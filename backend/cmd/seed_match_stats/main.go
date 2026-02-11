package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
)

type RawMatch struct {
	Matchday      int     `json:"matchday"`
	Date          string  `json:"date"`
	Time          string  `json:"time"`
	HomeTeam      string  `json:"homeTeam"`
	AwayTeam      string  `json:"awayTeam"`
	HomeScore     *int    `json:"homeScore"`
	AwayScore     *int    `json:"awayScore"`
	HalfTimeScore *string `json:"halfTimeScore"`
}

// Normalize team name: "Arsenal FC" -> "Arsenal", "Sunderland AFC" -> "Sunderland"
func normalizeTeamName(name string) string {
	name = strings.TrimSuffix(name, " FC")
	name = strings.TrimSuffix(name, " AFC")
	// Special mapping: "AFC Bournemouth" stays as is
	if name == "AFC Bournemouth" {
		return name
	}
	return name
}

func main() {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	cfg := config.LoadConfig()
	database.ConnectDB(cfg)
	ctx := context.Background()

	// 1. Load teams & players from DB
	fmt.Println("Loading teams from DB...")
	teamCursor, err := database.DB.Collection("teams").Find(ctx, bson.M{})
	if err != nil {
		log.Fatalf("Failed to fetch teams: %v", err)
	}
	var teams []models.Team
	if err := teamCursor.All(ctx, &teams); err != nil {
		log.Fatalf("Failed to decode teams: %v", err)
	}

	// Build team name -> team map
	teamByName := map[string]*models.Team{}
	for i := range teams {
		teamByName[teams[i].Name] = &teams[i]
	}

	fmt.Println("Loading players from DB...")
	playerCursor, err := database.DB.Collection("players").Find(ctx, bson.M{})
	if err != nil {
		log.Fatalf("Failed to fetch players: %v", err)
	}
	var allPlayers []models.Player
	if err := playerCursor.All(ctx, &allPlayers); err != nil {
		log.Fatalf("Failed to decode players: %v", err)
	}

	// Build teamID -> []Player map
	playersByTeam := map[string][]models.Player{}
	for _, p := range allPlayers {
		playersByTeam[p.TeamID] = append(playersByTeam[p.TeamID], p)
	}

	fmt.Printf("Loaded %d teams, %d players\n", len(teams), len(allPlayers))

	// 2. Read results.json
	fmt.Println("Reading results.json...")
	resultsData, err := os.ReadFile("../results.json")
	if err != nil {
		log.Fatalf("Failed to read results.json: %v", err)
	}
	var results []RawMatch
	if err := json.Unmarshal(resultsData, &results); err != nil {
		log.Fatalf("Failed to parse results.json: %v", err)
	}

	// 3. Read next_matches.json
	fmt.Println("Reading next_matches.json...")
	nextData, err := os.ReadFile("../next_matches.json")
	if err != nil {
		log.Fatalf("Failed to read next_matches.json: %v", err)
	}
	var nextMatches []RawMatch
	if err := json.Unmarshal(nextData, &nextMatches); err != nil {
		log.Fatalf("Failed to parse next_matches.json: %v", err)
	}

	// 4. Clear collections
	fmt.Println("Clearing results, next_matches, goal_events collections...")
	database.DB.Collection("results").Drop(ctx)
	database.DB.Collection("next_matches").Drop(ctx)
	database.DB.Collection("goal_events").Drop(ctx)

	// 5. Seed results collection
	fmt.Printf("Seeding %d results...\n", len(results))
	var resultDocs []interface{}
	for i, r := range results {
		doc := bson.M{
			"_id":           fmt.Sprintf("result-%d", i),
			"matchday":      r.Matchday,
			"date":          r.Date,
			"time":          r.Time,
			"homeTeam":      r.HomeTeam,
			"awayTeam":      r.AwayTeam,
			"homeScore":     r.HomeScore,
			"awayScore":     r.AwayScore,
			"halfTimeScore": r.HalfTimeScore,
		}
		resultDocs = append(resultDocs, doc)
	}
	if len(resultDocs) > 0 {
		database.DB.Collection("results").InsertMany(ctx, resultDocs)
	}

	// 6. Seed next_matches collection
	fmt.Printf("Seeding %d next_matches...\n", len(nextMatches))
	var nextDocs []interface{}
	for i, r := range nextMatches {
		doc := bson.M{
			"_id":      fmt.Sprintf("next-%d", i),
			"matchday": r.Matchday,
			"date":     r.Date,
			"time":     r.Time,
			"homeTeam": r.HomeTeam,
			"awayTeam": r.AwayTeam,
		}
		nextDocs = append(nextDocs, doc)
	}
	if len(nextDocs) > 0 {
		database.DB.Collection("next_matches").InsertMany(ctx, nextDocs)
	}

	// 7. Generate goal events from results
	fmt.Println("Generating goal events...")
	var goalEvents []interface{}
	totalGoals := 0
	matchesWithGoals := 0
	unmatchedTeams := map[string]bool{}

	for matchIdx, match := range results {
		homeScore := 0
		awayScore := 0
		if match.HomeScore != nil {
			homeScore = *match.HomeScore
		}
		if match.AwayScore != nil {
			awayScore = *match.AwayScore
		}

		if homeScore == 0 && awayScore == 0 {
			continue
		}

		homeNorm := normalizeTeamName(match.HomeTeam)
		awayNorm := normalizeTeamName(match.AwayTeam)

		homeTeam := teamByName[homeNorm]
		awayTeam := teamByName[awayNorm]

		if homeTeam == nil {
			if !unmatchedTeams[homeNorm] {
				fmt.Printf("  ⚠ Team not found in DB: '%s' (normalized from '%s')\n", homeNorm, match.HomeTeam)
				unmatchedTeams[homeNorm] = true
			}
			continue
		}
		if awayTeam == nil {
			if !unmatchedTeams[awayNorm] {
				fmt.Printf("  ⚠ Team not found in DB: '%s' (normalized from '%s')\n", awayNorm, match.AwayTeam)
				unmatchedTeams[awayNorm] = true
			}
			continue
		}

		homePlayers := playersByTeam[homeTeam.ID]
		awayPlayers := playersByTeam[awayTeam.ID]

		if len(homePlayers) == 0 || len(awayPlayers) == 0 {
			continue
		}

		matchesWithGoals++
		usedMinutes := map[int]bool{}

		// Generate home goals
		for g := 0; g < homeScore; g++ {
			scorer := pickScorer(rng, homePlayers)
			if scorer == nil {
				continue
			}

			minute := randomMinute(rng, usedMinutes)

			event := models.GoalEvent{
				ID:         fmt.Sprintf("goal-%d-%d", matchIdx, totalGoals),
				MatchIndex: matchIdx,
				Matchday:   match.Matchday,
				HomeTeam:   match.HomeTeam,
				AwayTeam:   match.AwayTeam,
				ScorerID:   scorer.ID,
				ScorerName: scorer.DisplayName,
				TeamName:   homeTeam.Name,
				TeamID:     homeTeam.ID,
				Minute:     minute,
				IsHomeGoal: true,
			}

			// 70% chance of assist
			if rng.Float64() < 0.7 {
				assister := pickAssister(rng, homePlayers, scorer.ID)
				if assister != nil {
					event.AssistID = assister.ID
					event.AssistName = assister.DisplayName
				}
			}

			goalEvents = append(goalEvents, event)
			totalGoals++
		}

		// Generate away goals
		for g := 0; g < awayScore; g++ {
			scorer := pickScorer(rng, awayPlayers)
			if scorer == nil {
				continue
			}

			minute := randomMinute(rng, usedMinutes)

			event := models.GoalEvent{
				ID:         fmt.Sprintf("goal-%d-%d", matchIdx, totalGoals),
				MatchIndex: matchIdx,
				Matchday:   match.Matchday,
				HomeTeam:   match.HomeTeam,
				AwayTeam:   match.AwayTeam,
				ScorerID:   scorer.ID,
				ScorerName: scorer.DisplayName,
				TeamName:   awayTeam.Name,
				TeamID:     awayTeam.ID,
				Minute:     minute,
				IsHomeGoal: false,
			}

			if rng.Float64() < 0.7 {
				assister := pickAssister(rng, awayPlayers, scorer.ID)
				if assister != nil {
					event.AssistID = assister.ID
					event.AssistName = assister.DisplayName
				}
			}

			goalEvents = append(goalEvents, event)
			totalGoals++
		}
	}

	// Sort goal events by minute within each match
	sort.Slice(goalEvents, func(i, j int) bool {
		ei := goalEvents[i].(models.GoalEvent)
		ej := goalEvents[j].(models.GoalEvent)
		if ei.MatchIndex != ej.MatchIndex {
			return ei.MatchIndex < ej.MatchIndex
		}
		return ei.Minute < ej.Minute
	})

	// Insert into DB
	if len(goalEvents) > 0 {
		// Insert in batches of 500
		batchSize := 500
		for i := 0; i < len(goalEvents); i += batchSize {
			end := i + batchSize
			if end > len(goalEvents) {
				end = len(goalEvents)
			}
			_, err := database.DB.Collection("goal_events").InsertMany(ctx, goalEvents[i:end])
			if err != nil {
				log.Printf("Error inserting batch: %v", err)
			}
		}
	}

	fmt.Printf("\n✅ Seeding complete!\n")
	fmt.Printf("   Results:      %d matches\n", len(results))
	fmt.Printf("   Next Matches: %d matches\n", len(nextMatches))
	fmt.Printf("   Goal Events:  %d goals from %d matches\n", totalGoals, matchesWithGoals)
}

// pickScorer selects a random player weighted by position
func pickScorer(rng *rand.Rand, players []models.Player) *models.Player {
	type weightedPlayer struct {
		player *models.Player
		weight int
	}

	var candidates []weightedPlayer
	for i := range players {
		p := &players[i]
		pos := strings.ToLower(p.Position)
		w := 0
		switch {
		case strings.Contains(pos, "attack") || strings.Contains(pos, "forward") || strings.Contains(pos, "striker"):
			w = 50
		case strings.Contains(pos, "midfield"):
			w = 35
		case strings.Contains(pos, "defend"):
			w = 15
		case strings.Contains(pos, "goal"):
			w = 0
		default:
			w = 20
		}
		if w > 0 {
			candidates = append(candidates, weightedPlayer{player: p, weight: w})
		}
	}

	if len(candidates) == 0 {
		return nil
	}

	totalWeight := 0
	for _, c := range candidates {
		totalWeight += c.weight
	}

	r := rng.Intn(totalWeight)
	cumulative := 0
	for _, c := range candidates {
		cumulative += c.weight
		if r < cumulative {
			return c.player
		}
	}

	return candidates[len(candidates)-1].player
}

// pickAssister picks a player different from the scorer
func pickAssister(rng *rand.Rand, players []models.Player, scorerID string) *models.Player {
	type weightedPlayer struct {
		player *models.Player
		weight int
	}

	var candidates []weightedPlayer
	for i := range players {
		p := &players[i]
		if p.ID == scorerID {
			continue
		}
		pos := strings.ToLower(p.Position)
		w := 0
		switch {
		case strings.Contains(pos, "midfield"):
			w = 40
		case strings.Contains(pos, "attack") || strings.Contains(pos, "forward") || strings.Contains(pos, "striker"):
			w = 35
		case strings.Contains(pos, "defend"):
			w = 20
		case strings.Contains(pos, "goal"):
			w = 5
		default:
			w = 20
		}
		candidates = append(candidates, weightedPlayer{player: p, weight: w})
	}

	if len(candidates) == 0 {
		return nil
	}

	totalWeight := 0
	for _, c := range candidates {
		totalWeight += c.weight
	}

	r := rng.Intn(totalWeight)
	cumulative := 0
	for _, c := range candidates {
		cumulative += c.weight
		if r < cumulative {
			return c.player
		}
	}

	return candidates[len(candidates)-1].player
}

// randomMinute generates a unique minute 1-90
func randomMinute(rng *rand.Rand, used map[int]bool) int {
	for i := 0; i < 100; i++ {
		m := rng.Intn(90) + 1
		if !used[m] {
			used[m] = true
			return m
		}
	}
	// Fallback: find any unused minute
	for m := 1; m <= 90; m++ {
		if !used[m] {
			used[m] = true
			return m
		}
	}
	return 45
}
