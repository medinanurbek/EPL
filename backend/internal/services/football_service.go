package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"log"
	"strings"

	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"github.com/Sanat-07/English-Premier-League/backend/internal/repositories"
	"go.mongodb.org/mongo-driver/bson"
)

type FootballService struct {
	matchRepo *repositories.MatchRepository
	teamRepo  *repositories.TeamRepository
}

func NewFootballService() *FootballService {
	return &FootballService{
		matchRepo: repositories.NewMatchRepository(),
		teamRepo:  repositories.NewTeamRepository(),
	}
}

func (s *FootballService) GetAllMatches() ([]models.Match, error) {
	return s.matchRepo.GetAllMatches()
}

// Helper for local JSON structure
type MatchJSON struct {
	Matchday  int    `json:"matchday"`
	Date      string `json:"date"`
	Time      string `json:"time"`
	HomeTeam  string `json:"homeTeam"`
	AwayTeam  string `json:"awayTeam"`
	HomeScore int    `json:"homeScore"`
	AwayScore int    `json:"awayScore"`
}

func (s *FootballService) GetStandings() ([]models.Standing, error) {
	standings, err := s.matchRepo.GetStandings()
	if err != nil {
		return nil, err
	}

	// Assign positions
	for i := range standings {
		standings[i].Position = i + 1
	}

	// Try to load next matches for next opponent info
	nextBytes, err := os.ReadFile("../next_matches.json")
	if err == nil {
		var nextMatches []MatchJSON
		if err := json.Unmarshal(nextBytes, &nextMatches); err == nil {
			// Map: Team Name -> Logo URL
			logoMap := make(map[string]string)
			for _, s := range standings {
				logoMap[s.Team.Name] = s.Team.LogoURL
				logoMap[normalizeTeamName(s.Team.Name)] = s.Team.LogoURL
			}

			nextOpponentMap := make(map[string]string)
			for _, m := range nextMatches {
				home := normalizeTeamName(m.HomeTeam)
				away := normalizeTeamName(m.AwayTeam)

				if _, ok := nextOpponentMap[home]; !ok {
					nextOpponentMap[home] = m.AwayTeam
				}
				if _, ok := nextOpponentMap[away]; !ok {
					nextOpponentMap[away] = m.HomeTeam
				}
			}

			for i := range standings {
				normName := normalizeTeamName(standings[i].Team.Name)
				if opp, ok := nextOpponentMap[normName]; ok {
					standings[i].NextOpponent = opp
					if logo, hasLogo := logoMap[normalizeTeamName(opp)]; hasLogo {
						standings[i].NextOpponentLogo = logo
					} else if logo, hasLogo := logoMap[opp]; hasLogo {
						standings[i].NextOpponentLogo = logo
					}
				}
			}
		}
	}

	// Initialize empty form array if nil
	for i := range standings {
		if standings[i].Form == nil {
			standings[i].Form = []string{}
		}
	}

	return standings, nil
}

func normalizeTeamName(name string) string {
	name = strings.TrimSpace(name)
	if strings.HasSuffix(name, " FC") {
		return strings.TrimSpace(name[:len(name)-3])
	}
	if strings.HasSuffix(name, " AFC") {
		return strings.TrimSpace(name[:len(name)-4])
	}
	return name
}

func (s *FootballService) CreateMatch(match *models.Match) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Create the Match
	if err := s.matchRepo.CreateMatch(match); err != nil {
		return err
	}

	// 2. Update Standings if Finished
	if err := UpdateStandings(ctx, match); err != nil {
		return err
	}

	return nil
}

func (s *FootballService) GetAllTeams() ([]models.Team, error) {
	return s.teamRepo.GetAllTeams()
}

func (s *FootballService) GetTeamByID(id string) (*models.Team, error) {
	return s.teamRepo.GetTeamByID(id)
}

func (s *FootballService) GetMatchByID(id string) (*models.Match, error) {
	return s.matchRepo.GetMatchByID(id)
}

func (s *FootballService) UpdateMatchStatus(id string, status models.MatchStatus) error {
	match, err := s.matchRepo.GetMatchByID(id)
	if err != nil {
		return err
	}

	match.Status = status
	return s.matchRepo.UpdateMatch(match)
}

func (s *FootballService) GetTeamSquad(teamID string) ([]models.Player, error) {
	return s.matchRepo.GetTeamSquad(teamID)
}

func (s *FootballService) GetAllPlayers() ([]models.Player, error) {
	return s.matchRepo.GetAllPlayers()
}

func (s *FootballService) GetPlayerByID(playerID string) (*models.Player, error) {
	return s.matchRepo.GetPlayerByID(playerID)
}

type StatsResponse struct {
	TopScorers  []repositories.StatEntry `json:"topScorers"`
	TopAssists  []repositories.StatEntry `json:"topAssists"`
	CleanSheets []repositories.StatEntry `json:"cleanSheets"`
}

func (s *FootballService) GetStats() (*StatsResponse, error) {
	topScorers, err := s.matchRepo.GetTopScorers(10)
	if err != nil {
		return nil, err
	}
	topAssists, err := s.matchRepo.GetTopAssists(10)
	if err != nil {
		return nil, err
	}
	cleanSheets, err := s.matchRepo.GetCleanSheets(10)
	if err != nil {
		return nil, err
	}
	return &StatsResponse{
		TopScorers:  topScorers,
		TopAssists:  topAssists,
		CleanSheets: cleanSheets,
	}, nil
}

func (s *FootballService) GetMatchGoalEvents(matchIndex int) ([]models.GoalEvent, error) {
	return s.matchRepo.GetMatchGoalEvents(matchIndex)
}

type TeamMatchesResponse struct {
	Team          models.Team `json:"team"`
	RecentMatches []MatchJSON `json:"recentMatches"` // Last 5 results
	NextMatch     *MatchJSON  `json:"nextMatch"`     // Immediate next match
	Upcoming      []MatchJSON `json:"upcoming"`      // Next 5 matches (excluding immediate next if desired, or just next 5)
	Form          []string    `json:"form"`          // W, D, L for recent matches
}

func (s *FootballService) GetTeamMatches(teamID string) (*TeamMatchesResponse, error) {
	// 1. Get Team
	team, err := s.teamRepo.GetTeamByID(teamID)
	if err != nil {
		return nil, err
	}

	response := &TeamMatchesResponse{
		Team:          *team,
		RecentMatches: []MatchJSON{},
		Upcoming:      []MatchJSON{},
		Form:          []string{},
	}

	targetName := normalizeTeamName(team.Name)
	log.Printf("Getting matches for team: %s (Normalized: %s)", team.Name, targetName)

	// 2. Get Past Matches (Results)
	resultsBytes, err := os.ReadFile("../results.json")
	if err != nil {
		log.Printf("Error reading results.json: %v", err)
	} else {
		var results []MatchJSON
		if err := json.Unmarshal(resultsBytes, &results); err == nil {
			log.Printf("Total results in file: %d", len(results))
			// Filter for this team
			var teamResults []MatchJSON
			for _, m := range results {
				if normalizeTeamName(m.HomeTeam) == targetName || normalizeTeamName(m.AwayTeam) == targetName {
					teamResults = append(teamResults, m)
				}
			}
			log.Printf("Found %d results for team %s", len(teamResults), targetName)

			// Sort descending (assuming they are chronological in file, we reverse)
			// Actually file is chronological 1..N. We want latest first.
			// Let's just traverse backwards from the end of teamResults
			count := 0
			for i := len(teamResults) - 1; i >= 0 && count < 5; i-- {
				m := teamResults[i]
				response.RecentMatches = append(response.RecentMatches, m)

				// Calculate Form
				var result string
				isHome := normalizeTeamName(m.HomeTeam) == targetName

				if m.HomeScore == m.AwayScore {
					result = "D"
				} else if m.HomeScore > m.AwayScore {
					if isHome {
						result = "W"
					} else {
						result = "L"
					}
				} else { // Home < Away
					if isHome {
						result = "L"
					} else {
						result = "W"
					}
				}
				response.Form = append(response.Form, result)
				count++
			}
		}
	}

	// 3. Get Upcoming Matches
	nextBytes, err := os.ReadFile("../next_matches.json")
	if err == nil {
		var nextMatches []MatchJSON
		if err := json.Unmarshal(nextBytes, &nextMatches); err == nil {
			// Filter
			var teamNext []MatchJSON
			for _, m := range nextMatches {
				if normalizeTeamName(m.HomeTeam) == targetName || normalizeTeamName(m.AwayTeam) == targetName {
					teamNext = append(teamNext, m)
				}
			}

			// Looking for next match and subsequent 5
			// Accessing linearly assuming sorted by date
			if len(teamNext) > 0 {
				response.NextMatch = &teamNext[0]

				// Get next 5 (including or excluding next match? User said "next match then next 5 matches")
				// Let's get next 5 *after* the immediate one if possible, or just next 5 total
				// Interpret "next match implies the very first one". "next 5 matches" often excludes it in UI if shown separately.
				// Let's provide the slice of next 5 starting from index 1 if exists.

				startIndex := 1
				endIndex := startIndex + 5
				if endIndex > len(teamNext) {
					endIndex = len(teamNext)
				}

				if startIndex < len(teamNext) {
					response.Upcoming = teamNext[startIndex:endIndex]
				}
			}
		}
	}

	return response, nil
}

// --- Match Lifecycle ---

// StartMatch transitions a match from SCHEDULED to LIVE and starts the simulation
func (s *FootballService) StartMatch(matchID string) error {
	match, err := s.matchRepo.GetMatchByID(matchID)
	if err != nil {
		return err
	}
	if match.Status != models.MatchScheduled {
		return fmt.Errorf("match is not in SCHEDULED state (current: %s)", match.Status)
	}

	// Enforce sequential matchdays
	activeMatchday, err := s.GetActiveMatchday()
	if err != nil {
		return err
	}
	if match.Matchday != activeMatchday {
		return fmt.Errorf("can only start matches for current Matchday %d (this match is Matchday %d)", activeMatchday, match.Matchday)
	}

	// Update status to LIVE
	if err := s.matchRepo.UpdateMatchStatus(matchID, models.MatchLive); err != nil {
		return err
	}

	// Start background simulation
	SimulateMatch(matchID)

	return nil
}

// GetActiveMatchday returns the first matchday that has SCHEDULED or LIVE matches.
// If all are finished, returns the last matchday + 1 (or just max matchday).
func (s *FootballService) GetActiveMatchday() (int, error) {
	matches, err := s.matchRepo.GetAllMatches()
	if err != nil {
		return 0, err
	}

	// Find min matchday that is not all FINISHED
	// Actually simpler: Find first matchday where status != FINISHED
	// Matches are not guaranteed sorted by matchday in DB return, so let's check properly.

	// Group by matchday
	statusByDay := make(map[int][]models.MatchStatus)
	minDay := 100
	maxDay := 0

	for _, m := range matches {
		statusByDay[m.Matchday] = append(statusByDay[m.Matchday], m.Status)
		if m.Matchday < minDay {
			minDay = m.Matchday
		}
		if m.Matchday > maxDay {
			maxDay = m.Matchday
		}
	}

	if len(matches) == 0 {
		return 1, nil
	}

	// Check from minDay upwards
	for day := minDay; day <= maxDay; day++ {
		statuses, exists := statusByDay[day]
		if !exists {
			continue
		}

		allFinished := true
		for _, st := range statuses {
			if st != models.MatchFinished {
				allFinished = false
				break
			}
		}

		if !allFinished {
			return day, nil
		}
	}

	return maxDay, nil // All finished
}

// FinishMatch transitions a match from LIVE to FINISHED and recalculates stats
func (s *FootballService) FinishMatch(matchID string) error {
	match, err := s.matchRepo.GetMatchByID(matchID)
	if err != nil {
		return err
	}
	if match.Status != models.MatchLive {
		return fmt.Errorf("match is not in LIVE state (current: %s)", match.Status)
	}

	// Stop simulation if running
	StopSimulation(matchID)

	// Recalculate score from events
	homeScore, awayScore, err := RecalculateMatchScore(context.Background(), matchID)
	if err != nil {
		return err
	}

	// Update match status to FINISHED
	if err := s.matchRepo.UpdateMatchStatus(matchID, models.MatchFinished); err != nil {
		return err
	}

	// Update standings
	match.Status = models.MatchFinished
	match.HomeScore = homeScore
	match.AwayScore = awayScore
	if err := UpdateStandings(context.Background(), match); err != nil {
		log.Printf("Error updating standings: %v", err)
	}

	log.Printf("[FinishMatch] Match %s finished: %d-%d. Standings updated.", matchID, homeScore, awayScore)
	return nil
}

// --- Event Management ---

// GetGoalEventsByMatchID returns goal events for a specific match
func (s *FootballService) GetGoalEventsByMatchID(matchID string) ([]models.GoalEvent, error) {
	return s.matchRepo.GetGoalEventsByMatchID(matchID)
}

// EditGoalEvent updates a goal event and recalculates match score + standings
func (s *FootballService) EditGoalEvent(matchID string, eventID string, update map[string]interface{}) error {
	bsonUpdate := bson.M{}
	for k, v := range update {
		bsonUpdate[k] = v
	}
	if err := s.matchRepo.EditGoalEvent(eventID, bsonUpdate); err != nil {
		return err
	}

	// Recalculate score and standings
	return s.recalculateAfterEventChange(matchID)
}

// DeleteGoalEvent removes a goal event and recalculates match score + standings
func (s *FootballService) DeleteGoalEvent(matchID string, eventID string) error {
	if err := s.matchRepo.DeleteGoalEvent(eventID); err != nil {
		return err
	}

	// Recalculate score and standings
	return s.recalculateAfterEventChange(matchID)
}

// recalculateAfterEventChange recalculates match score and all standings
func (s *FootballService) recalculateAfterEventChange(matchID string) error {
	ctx := context.Background()

	// Recalculate score
	_, _, err := RecalculateMatchScore(ctx, matchID)
	if err != nil {
		return err
	}

	// Recalculate all standings from scratch
	return RecalculateAllStandings(ctx)
}

// --- Matchday ---

// GetMatchesByMatchday returns all matches for a given matchday
func (s *FootballService) GetMatchesByMatchday(matchday int) ([]models.Match, error) {
	return s.matchRepo.GetMatchesByMatchday(matchday)
}

// --- Player CRUD ---

// CreatePlayer creates a new player
func (s *FootballService) CreatePlayer(player *models.Player) error {
	return s.matchRepo.CreatePlayer(player)
}

// UpdatePlayer updates a player
func (s *FootballService) UpdatePlayer(playerID string, update map[string]interface{}) error {
	bsonUpdate := bson.M{}
	for k, v := range update {
		bsonUpdate[k] = v
	}
	return s.matchRepo.UpdatePlayer(playerID, bsonUpdate)
}

// DeletePlayer deletes a player
func (s *FootballService) DeletePlayer(playerID string) error {
	return s.matchRepo.DeletePlayer(playerID)
}

// GetLatestResults fetches finished matches from DB and formats them for frontend
func (s *FootballService) GetLatestResults() ([]MatchJSON, error) {
	// Get last 10 finished matches
	matches, err := s.matchRepo.GetLatestResultMatches(10)
	if err != nil {
		return nil, err
	}

	teams, err := s.teamRepo.GetAllTeams()
	if err != nil {
		return nil, err
	}
	teamMap := make(map[string]string)
	for _, t := range teams {
		teamMap[t.ID] = t.Name
	}

	var results []MatchJSON
	for _, m := range matches {
		results = append(results, MatchJSON{
			Matchday:  m.Matchday,
			Date:      m.Date.Format(time.RFC3339),
			Time:      m.Date.Format("15:04"),
			HomeTeam:  teamMap[m.HomeTeamID],
			AwayTeam:  teamMap[m.AwayTeamID],
			HomeScore: m.HomeScore,
			AwayScore: m.AwayScore,
		})
	}
	return results, nil
}

// GetUpcomingFixtures fetches scheduled matches from DB
func (s *FootballService) GetUpcomingFixtures() ([]MatchJSON, error) {
	matches, err := s.matchRepo.GetUpcomingMatches(10)
	if err != nil {
		return nil, err
	}

	teams, err := s.teamRepo.GetAllTeams()
	if err != nil {
		return nil, err
	}
	teamMap := make(map[string]string)
	for _, t := range teams {
		teamMap[t.ID] = t.Name
	}

	var upcoming []MatchJSON
	for _, m := range matches {
		upcoming = append(upcoming, MatchJSON{
			Matchday: m.Matchday,
			Date:     m.Date.Format(time.RFC3339),
			Time:     m.Date.Format("15:04"),
			HomeTeam: teamMap[m.HomeTeamID],
			AwayTeam: teamMap[m.AwayTeamID],
		})
	}
	return upcoming, nil
}
