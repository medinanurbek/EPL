package services

import (
	"encoding/json"
	"os"
	"sort"

	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"github.com/Sanat-07/English-Premier-League/backend/internal/repositories"
	"gorm.io/gorm"
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
	// 1. Get All Teams to initialize standings
	teams, err := s.teamRepo.GetAllTeams()
	if err != nil {
		return nil, err
	}

	// Map: Normalized Team Name -> Pointer to Standing
	standingsMap := make(map[string]*models.Standing)
	// Map: Team Name -> Logo URL (for next opponent logo lookup)
	logoMap := make(map[string]string)

	for i := range teams {
		t := teams[i]
		normName := normalizeTeamName(t.Name)
		standingsMap[normName] = &models.Standing{
			TeamID: t.ID,
			Team:   t,
			Form:   []string{},
		}
		// Also map the original name to the standing entry just in case
		// But better to rely on normalized names for keys
		logoMap[t.Name] = t.LogoURL
		logoMap[normalizeTeamName(t.Name)] = t.LogoURL
	}

	// 2. Process Results (Points, W/D/L, Form)
	resultsBytes, err := os.ReadFile("../results.json")
	if err == nil {
		var results []MatchJSON
		if err := json.Unmarshal(resultsBytes, &results); err == nil {
			// Process for Table Stats
			for _, m := range results {
				homeName := normalizeTeamName(m.HomeTeam)
				awayName := normalizeTeamName(m.AwayTeam)

				homeStanding, okH := standingsMap[homeName]
				awayStanding, okA := standingsMap[awayName]

				if okH && okA {
					homeStanding.Played++
					awayStanding.Played++
					homeStanding.GoalsFor += m.HomeScore
					homeStanding.GoalsAgainst += m.AwayScore
					awayStanding.GoalsFor += m.AwayScore
					awayStanding.GoalsAgainst += m.HomeScore
					homeStanding.GoalDifference = homeStanding.GoalsFor - homeStanding.GoalsAgainst
					awayStanding.GoalDifference = awayStanding.GoalsFor - awayStanding.GoalsAgainst

					if m.HomeScore > m.AwayScore {
						homeStanding.Wins++
						homeStanding.Points += 3
						awayStanding.Losses++
					} else if m.AwayScore > m.HomeScore {
						awayStanding.Wins++
						awayStanding.Points += 3
						homeStanding.Losses++
					} else {
						homeStanding.Draws++
						homeStanding.Points += 1
						awayStanding.Draws++
						awayStanding.Points += 1
					}
				}
			}

			// Process for Form (Last 5) - Iterate backwards
			// Ensure formMap tracks per team to stop at 5
			formCounts := make(map[string]int)

			for i := len(results) - 1; i >= 0; i-- {
				m := results[i]
				homeName := normalizeTeamName(m.HomeTeam)
				awayName := normalizeTeamName(m.AwayTeam)

				if s, ok := standingsMap[homeName]; ok && formCounts[homeName] < 5 {
					res := "D"
					if m.HomeScore > m.AwayScore {
						res = "W"
					} else if m.HomeScore < m.AwayScore {
						res = "L"
					}
					s.Form = append(s.Form, res)
					formCounts[homeName]++
				}

				if s, ok := standingsMap[awayName]; ok && formCounts[awayName] < 5 {
					res := "D"
					if m.AwayScore > m.HomeScore {
						res = "W"
					} else if m.AwayScore < m.HomeScore {
						res = "L"
					}
					s.Form = append(s.Form, res)
					formCounts[awayName]++
				}
			}
		}
	}

	// 3. Process Next Matches (Next Opponent)
	nextBytes, err := os.ReadFile("../next_matches.json")
	if err == nil {
		var nextMatches []MatchJSON
		if err := json.Unmarshal(nextBytes, &nextMatches); err == nil {
			nextOpponentMap := make(map[string]string)
			for _, m := range nextMatches {
				home := normalizeTeamName(m.HomeTeam)
				away := normalizeTeamName(m.AwayTeam)

				// First encounter is the next match
				if _, ok := nextOpponentMap[home]; !ok {
					nextOpponentMap[home] = m.AwayTeam // Keep original name for display
				}
				if _, ok := nextOpponentMap[away]; !ok {
					nextOpponentMap[away] = m.HomeTeam
				}
			}

			for _, s := range standingsMap {
				normName := normalizeTeamName(s.Team.Name)
				if opp, ok := nextOpponentMap[normName]; ok {
					s.NextOpponent = opp
					if logo, hasLogo := logoMap[normalizeTeamName(opp)]; hasLogo {
						s.NextOpponentLogo = logo
					} else if logo, hasLogo := logoMap[opp]; hasLogo {
						// Fallback to direct lookup
						s.NextOpponentLogo = logo
					}
				}
			}
		}
	}

	// 4. Convert Map to Slice
	var standings []models.Standing
	for _, s := range standingsMap {
		standings = append(standings, *s)
	}

	// 5. Sort
	sort.Slice(standings, func(i, j int) bool {
		if standings[i].Points != standings[j].Points {
			return standings[i].Points > standings[j].Points
		}
		if standings[i].GoalDifference != standings[j].GoalDifference {
			return standings[i].GoalDifference > standings[j].GoalDifference
		}
		return standings[i].GoalsFor > standings[j].GoalsFor
	})

	// 6. Assign Position
	for i := range standings {
		standings[i].Position = i + 1
	}

	return standings, nil
}

func normalizeTeamName(name string) string {
	if len(name) > 3 && name[len(name)-3:] == " FC" {
		return name[:len(name)-3]
	}
	if len(name) > 4 && name[len(name)-4:] == " AFC" {
		return name[:len(name)-4]
	}
	return name
}

func (s *FootballService) CreateMatch(match *models.Match) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Create the Match
		if err := tx.Create(match).Error; err != nil {
			return err
		}

		// 2. Update Standings if Finished
		if err := UpdateStandings(match, tx); err != nil {
			return err
		}

		return nil
	})
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

func (s *FootballService) GetTeamSquad(teamID string) ([]models.Player, error) {
	return s.matchRepo.GetTeamSquad(teamID)
}

func (s *FootballService) GetPlayerByID(playerID string) (*models.Player, error) {
	return s.matchRepo.GetPlayerByID(playerID)
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

	// 2. Get Past Matches (Results)
	resultsBytes, err := os.ReadFile("../results.json")
	if err == nil {
		var results []MatchJSON
		if err := json.Unmarshal(resultsBytes, &results); err == nil {
			// Filter for this team
			var teamResults []MatchJSON
			for _, m := range results {
				if normalizeTeamName(m.HomeTeam) == targetName || normalizeTeamName(m.AwayTeam) == targetName {
					teamResults = append(teamResults, m)
				}
			}

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
