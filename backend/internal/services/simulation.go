package services

import (
	"context"
	"log"
	"math/rand"
	"sort"
	"sync"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// activeSimulations tracks running simulations so they can be stopped
var (
	activeSimulations = make(map[string]chan struct{})
	simMu             sync.Mutex
)

// SimulateMatch starts a background goroutine that generates match events.
// It runs until the match "ends" at minute 90, or until StopSimulation is called.
func SimulateMatch(matchID string) {
	stopCh := make(chan struct{})
	simMu.Lock()
	activeSimulations[matchID] = stopCh
	simMu.Unlock()

	go func() {
		defer func() {
			simMu.Lock()
			delete(activeSimulations, matchID)
			simMu.Unlock()
		}()

		ctx := context.Background()

		// Load match
		var match models.Match
		err := database.DB.Collection("matches").FindOne(ctx, bson.M{"_id": matchID}).Decode(&match)
		if err != nil {
			log.Printf("[Simulation] Failed to load match %s: %v", matchID, err)
			return
		}

		// Load home team squad
		homePlayers := loadTeamPlayers(ctx, match.HomeTeamID)
		awayPlayers := loadTeamPlayers(ctx, match.AwayTeamID)

		if len(homePlayers) == 0 || len(awayPlayers) == 0 {
			log.Printf("[Simulation] No players found for match %s, skipping simulation", matchID)
			return
		}

		// Load team names
		homeTeam := loadTeamName(ctx, match.HomeTeamID)
		awayTeam := loadTeamName(ctx, match.AwayTeamID)

		// Determine total goals (weighted: avg ~2.5 per match)
		totalGoals := weightedGoalCount()

		if totalGoals == 0 {
			log.Printf("[Simulation] 0-0 draw for match %s", matchID)
			return
		}

		// Generate goal minutes (sorted)
		minutes := generateGoalMinutes(totalGoals)

		homeScore := 0
		awayScore := 0

		for i, minute := range minutes {
			select {
			case <-stopCh:
				log.Printf("[Simulation] Match %s stopped early at minute %d", matchID, minute)
				return
			default:
			}

			// Wait a bit between events (1-3 seconds real time)
			time.Sleep(time.Duration(1000+rand.Intn(2000)) * time.Millisecond)

			// Decide which team scores (roughly 50/50 with slight home advantage)
			isHomeGoal := rand.Float64() < 0.55
			var scorer models.Player
			var assist *models.Player
			var teamPlayers []models.Player
			var teamName, teamID string

			if isHomeGoal {
				teamPlayers = homePlayers
				teamName = homeTeam
				teamID = match.HomeTeamID
				homeScore++
			} else {
				teamPlayers = awayPlayers
				teamName = awayTeam
				teamID = match.AwayTeamID
				awayScore++
			}

			// Pick scorer based on position probability
			scorer = pickScorer(teamPlayers)

			// Pick assist (85% chance of having one)
			if rand.Float64() < 0.85 {
				a := pickAssist(teamPlayers, scorer.ID)
				assist = &a
			}

			// Create GoalEvent
			event := models.GoalEvent{
				ID:         primitive.NewObjectID().Hex(),
				MatchID:    matchID,
				MatchIndex: 0,
				Matchday:   match.Matchday,
				HomeTeam:   homeTeam,
				AwayTeam:   awayTeam,
				ScorerID:   scorer.ID,
				ScorerName: scorer.Name,
				TeamName:   teamName,
				TeamID:     teamID,
				Minute:     minute,
				IsHomeGoal: isHomeGoal,
			}

			if assist != nil {
				event.AssistID = assist.ID
				event.AssistName = assist.Name
			}

			// Save event to DB
			_, err := database.DB.Collection("goal_events").InsertOne(ctx, event)
			if err != nil {
				log.Printf("[Simulation] Failed to save event: %v", err)
				continue
			}

			// Update match score
			database.DB.Collection("matches").UpdateOne(ctx,
				bson.M{"_id": matchID},
				bson.M{"$set": bson.M{"homeScore": homeScore, "awayScore": awayScore}},
			)

			log.Printf("[Simulation] Match %s | %d' GOAL! %s (%s) %d-%d",
				matchID, minute, scorer.Name, teamName, homeScore, awayScore)

			_ = i
		}

		log.Printf("[Simulation] Match %s simulation complete: %s %d - %d %s",
			matchID, homeTeam, homeScore, awayScore, awayTeam)

		// --- Auto-Finish Logic ---
		// 1. Recalculate final score to ensure consistency
		hScore, aScore, err := RecalculateMatchScore(ctx, matchID)
		if err != nil {
			log.Printf("[Simulation] Error recalculating score for auto-finish %s: %v", matchID, err)
			hScore, aScore = homeScore, awayScore // Fallback
		}

		// 2. Update Match Status to FINISHED in DB
		_, err = database.DB.Collection("matches").UpdateOne(ctx,
			bson.M{"_id": matchID},
			bson.M{"$set": bson.M{"status": "FINISHED", "homeScore": hScore, "awayScore": aScore}},
		)
		if err != nil {
			log.Printf("[Simulation] Failed to update match status to FINISHED: %v", err)
			return
		}

		// 3. Update Standings
		// We need to pass a Match object with FINISHED status to UpdateStandings
		match.Status = models.MatchFinished
		match.HomeScore = hScore
		match.AwayScore = aScore

		if err := UpdateStandings(ctx, &match); err != nil {
			log.Printf("[Simulation] Error updating standings for match %s: %v", matchID, err)
		} else {
			log.Printf("[Simulation] Standings updated for match %s", matchID)
		}

		// 4. Update Player Stats (Goals, Assists, Clean Sheets)
		if err := UpdatePlayerStatsForMatch(ctx, matchID); err != nil {
			log.Printf("[Simulation] Error updating player stats for match %s: %v", matchID, err)
		}
	}()
}

// StopSimulation stops a running simulation for a match
func StopSimulation(matchID string) {
	simMu.Lock()
	defer simMu.Unlock()
	if ch, ok := activeSimulations[matchID]; ok {
		close(ch)
		delete(activeSimulations, matchID)
	}
}

// IsSimulationRunning checks if a simulation is active for a match
func IsSimulationRunning(matchID string) bool {
	simMu.Lock()
	defer simMu.Unlock()
	_, ok := activeSimulations[matchID]
	return ok
}

// loadTeamPlayers loads all players for a team
func loadTeamPlayers(ctx context.Context, teamID string) []models.Player {
	cursor, err := database.DB.Collection("players").Find(ctx, bson.M{"teamId": teamID})
	if err != nil {
		return nil
	}
	var players []models.Player
	cursor.All(ctx, &players)
	return players
}

// loadTeamName returns the team name
func loadTeamName(ctx context.Context, teamID string) string {
	var team models.Team
	err := database.DB.Collection("teams").FindOne(ctx, bson.M{"_id": teamID}).Decode(&team)
	if err != nil {
		return teamID
	}
	return team.Name
}

// weightedGoalCount returns a realistic total goal count
func weightedGoalCount() int {
	// Distribution: 0 goals=8%, 1=18%, 2=25%, 3=22%, 4=14%, 5=8%, 6=5%
	r := rand.Float64()
	switch {
	case r < 0.08:
		return 0
	case r < 0.26:
		return 1
	case r < 0.51:
		return 2
	case r < 0.73:
		return 3
	case r < 0.87:
		return 4
	case r < 0.95:
		return 5
	default:
		return 6
	}
}

// generateGoalMinutes generates sorted random minutes for goals
func generateGoalMinutes(count int) []int {
	mins := make([]int, count)
	for i := range mins {
		mins[i] = 1 + rand.Intn(90)
	}
	sort.Ints(mins)
	return mins
}

// weightedPlayer is used for position-based probability selection
type weightedPlayer struct {
	player models.Player
	weight float64
}

// pickScorer selects a scorer with position-based weighting
func pickScorer(players []models.Player) models.Player {
	var candidates []weightedPlayer
	for _, p := range players {
		w := 1.0
		switch p.Position {
		case "Attacker", "Forward":
			w = 6.0
		case "Midfielder":
			w = 3.0
		case "Defender":
			w = 1.0
		case "Goalkeeper":
			w = 0.05
		}
		candidates = append(candidates, weightedPlayer{p, w})
	}

	return weightedPick(candidates)
}

// pickAssist selects an assist provider (excluding the scorer)
func pickAssist(players []models.Player, scorerID string) models.Player {
	var candidates []weightedPlayer
	for _, p := range players {
		if p.ID == scorerID {
			continue
		}
		w := 1.0
		switch p.Position {
		case "Midfielder":
			w = 5.0
		case "Attacker", "Forward":
			w = 3.5
		case "Defender":
			w = 1.5
		case "Goalkeeper":
			w = 0.1
		}
		candidates = append(candidates, weightedPlayer{p, w})
	}

	if len(candidates) == 0 {
		return players[0]
	}

	return weightedPick(candidates)
}

// weightedPick does weighted random selection
func weightedPick(candidates []weightedPlayer) models.Player {
	totalWeight := 0.0
	for _, c := range candidates {
		totalWeight += c.weight
	}

	r := rand.Float64() * totalWeight
	cumulative := 0.0
	for _, c := range candidates {
		cumulative += c.weight
		if r <= cumulative {
			return c.player
		}
	}

	return candidates[len(candidates)-1].player
}

// RecalculateMatchScore recounts goals from GoalEvents and updates the match score
func RecalculateMatchScore(ctx context.Context, matchID string) (int, int, error) {
	homeCount, err := database.DB.Collection("goal_events").CountDocuments(ctx,
		bson.M{"matchId": matchID, "isHomeGoal": true})
	if err != nil {
		return 0, 0, err
	}

	awayCount, err := database.DB.Collection("goal_events").CountDocuments(ctx,
		bson.M{"matchId": matchID, "isHomeGoal": false})
	if err != nil {
		return 0, 0, err
	}

	h, a := int(homeCount), int(awayCount)
	_, err = database.DB.Collection("matches").UpdateOne(ctx,
		bson.M{"_id": matchID},
		bson.M{"$set": bson.M{"homeScore": h, "awayScore": a}},
	)

	return h, a, err
}

// RecalculateAllStandings drops standings and replays all finished matches
func RecalculateAllStandings(ctx context.Context) error {
	// Drop existing standings
	database.DB.Collection("standings").Drop(ctx)

	// Get all finished matches
	cursor, err := database.DB.Collection("matches").Find(ctx, bson.M{"status": "FINISHED"})
	if err != nil {
		return err
	}

	var matches []models.Match
	if err := cursor.All(ctx, &matches); err != nil {
		return err
	}

	// Recalculate score from goal_events for each match, then update standings
	for i := range matches {
		h, a, err := RecalculateMatchScore(ctx, matches[i].ID)
		if err != nil {
			log.Printf("[Recalculate] Error recalculating score for match %s: %v", matches[i].ID, err)
			continue
		}
		matches[i].HomeScore = h
		matches[i].AwayScore = a

		if err := UpdateStandings(ctx, &matches[i]); err != nil {
			log.Printf("[Recalculate] Error updating standings for match %s: %v", matches[i].ID, err)
		}
	}

	log.Printf("[Recalculate] Standings recalculated from %d finished matches", len(matches))
	return nil
}
