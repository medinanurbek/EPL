package services

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"log"
	"strings"

	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"github.com/Sanat-07/English-Premier-League/backend/internal/repositories"
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
