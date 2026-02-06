package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"gorm.io/gorm/clause"
)

// JSON Structures matching ptext.txt
type SportMonksParticipant struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	ShortCode string `json:"short_code"`
	ImagePath string `json:"image_path"`
	VenueID   int    `json:"venue_id"`
}

type SportMonksStanding struct {
	Position    int                   `json:"position"`
	Points      int                   `json:"points"`
	Participant SportMonksParticipant `json:"participant"`
	Form        []struct {
		Form string `json:"form"`
	} `json:"form"`
	Details []struct {
		TypeID int `json:"type_id"`
		Value  int `json:"value"`
	} `json:"details"`
}

// SportMonks Type IDs (inferred from data)
const (
	TypePlayed       = 129
	TypeWon          = 130
	TypeDraw         = 131
	TypeLost         = 132
	TypeGoalsFor     = 133
	TypeGoalsAgainst = 134
	TypeGoalDiff     = 179
)

func main() {
	// 1. Setup DB
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)

	// 2. Read File
	filePath := "../../ptext.txt" // Relative to cmd/seed/main.go
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		// Try absolute path if relative fails
		filePath = "/Users/admin/English-Premier-League/ptext.txt"
		data, err = ioutil.ReadFile(filePath)
		if err != nil {
			log.Fatalf("Failed to read file: %v", err)
		}
	}

	var standings []SportMonksStanding
	if err := json.Unmarshal(data, &standings); err != nil {
		log.Fatalf("Failed to parse JSON: %v", err)
	}

	fmt.Printf("Found %d standings entries\n", len(standings))

	// 3. Process Data
	for _, s := range standings {
		// --- Sync Team ---
		team := models.Team{
			ID:        fmt.Sprintf("%d", s.Participant.ID),
			Name:      s.Participant.Name,
			ShortName: s.Participant.ShortCode,
			LogoURL:   s.Participant.ImagePath,
			// City and Stadium omitted for now as they require venue lookups or are not directly in participant object simple fields
		}

		if err := database.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{"name", "short_name", "logo_url"}),
		}).Create(&team).Error; err != nil {
			log.Printf("Error syncing team %s: %v", team.Name, err)
			continue
		}

		// --- Sync Standing ---
		var played, won, draw, lost, gf, ga, gd int

		for _, d := range s.Details {
			switch d.TypeID {
			case TypePlayed:
				played = d.Value
			case TypeWon:
				won = d.Value
			case TypeDraw:
				draw = d.Value
			case TypeLost:
				lost = d.Value
			case TypeGoalsFor:
				gf = d.Value
			case TypeGoalsAgainst:
				ga = d.Value
			case TypeGoalDiff:
				gd = d.Value
			}
		}

		// Note: The 'Form' in our model is not yet defined as a string array,
		// but checking football.go, Standing struct doesn't have Form.
		// We might need to add it or ignore for now.
		// Let's check football.go again. (It has Played, Wins, etc.)

		standing := models.Standing{
			TeamID:         team.ID,
			Played:         played,
			Wins:           won,
			Draws:          draw,
			Losses:         lost,
			Points:         s.Points,
			GoalsFor:       gf,
			GoalsAgainst:   ga,
			GoalDifference: gd,
		}

		if err := database.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "team_id"}},
			DoUpdates: clause.AssignmentColumns([]string{"played", "wins", "draws", "losses", "points", "goals_for", "goals_against", "goal_difference"}),
		}).Create(&standing).Error; err != nil {
			log.Printf("Error syncing standing for %s: %v", team.Name, err)
		}
	}

	fmt.Println("Seeding completed successfully!")
}
