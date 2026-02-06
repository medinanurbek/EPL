package main

import (
	"fmt"
	"log"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
)

func main() {
	// Connect to DB
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)

	// Check Teams
	var teams []models.Team
	if err := database.DB.Find(&teams).Error; err != nil {
		log.Fatalf("Failed to fetch teams: %v", err)
	}

	fmt.Printf("\n=== TEAMS (Total: %d) ===\n", len(teams))
	for i, team := range teams {
		if i < 10 { // Show first 10
			fmt.Printf("%d. %s (%s) - Logo: %s\n", i+1, team.Name, team.ShortName, team.LogoURL)
		}
	}

	// Check Standings
	var standings []models.Standing
	if err := database.DB.Preload("Team").Order("points DESC").Find(&standings).Error; err != nil {
		log.Fatalf("Failed to fetch standings: %v", err)
	}

	fmt.Printf("\n=== STANDINGS (Total: %d) ===\n", len(standings))
	fmt.Println("Pos | Team                    | P  | W  | D  | L  | GF | GA | GD  | Pts")
	fmt.Println("----+-------------------------+----+----+----+----+----+----+-----+----")

	for i, s := range standings {
		teamName := s.Team.Name
		if len(teamName) > 23 {
			teamName = teamName[:20] + "..."
		}
		fmt.Printf("%-3d | %-23s | %-2d | %-2d | %-2d | %-2d | %-2d | %-2d | %-3d | %-3d\n",
			i+1, teamName, s.Played, s.Wins, s.Draws, s.Losses,
			s.GoalsFor, s.GoalsAgainst, s.GoalDifference, s.Points)
	}

	// Check other tables
	var users []models.User
	database.DB.Find(&users)
	fmt.Printf("\n=== OTHER TABLES ===\n")
	fmt.Printf("Users: %d\n", len(users))

	var players []models.Player
	database.DB.Find(&players)
	fmt.Printf("Players: %d\n", len(players))

	var matches []models.Match
	database.DB.Find(&matches)
	fmt.Printf("Matches: %d\n", len(matches))

	var seasons []models.Season
	database.DB.Find(&seasons)
	fmt.Printf("Seasons: %d\n", len(seasons))

	fmt.Println("\n✅ Database check completed!")
}
