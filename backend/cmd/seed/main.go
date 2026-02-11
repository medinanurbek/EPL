package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
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

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

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

	teamColl := database.DB.Collection("teams")
	standingColl := database.DB.Collection("standings")

	// 3. Process Data
	for _, s := range standings {
		// --- Sync Team ---
		team := models.Team{
			ID:        fmt.Sprintf("%d", s.Participant.ID),
			Name:      s.Participant.Name,
			ShortName: s.Participant.ShortCode,
			LogoURL:   s.Participant.ImagePath,
		}

		filter := bson.M{"_id": team.ID}
		update := bson.M{"$set": team}
		opts := options.Update().SetUpsert(true)
		_, err := teamColl.UpdateOne(ctx, filter, update, opts)
		if err != nil {
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
			Team:           team, // Embed team for easier access
		}

		filter = bson.M{"_id": team.ID}
		update = bson.M{"$set": standing}
		_, err = standingColl.UpdateOne(ctx, filter, update, opts)
		if err != nil {
			log.Printf("Error syncing standing for %s: %v", team.Name, err)
		}
	}

	CreateAdmin()
	fmt.Println("Seeding completed successfully!")
}
