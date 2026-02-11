package main

import (
	"context"
	"fmt"
	"log"
	"sort"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
)

type CoachDoc struct {
	TeamID   string `bson:"team_id" json:"team_id"`
	TeamName string `bson:"team_name" json:"team_name"`
	Name     string `bson:"name" json:"name"`
}

type StatDoc struct {
	PlayerID  string `bson:"_id" json:"playerId"`
	Name      string `bson:"name" json:"name"`
	TeamName  string `bson:"teamName" json:"teamName"`
	TeamID    string `bson:"teamId" json:"teamId"`
	Value     int    `bson:"count" json:"value"`
	ImagePath string `bson:"imagePath" json:"imagePath"`
}

func main() {
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	teamColl := database.DB.Collection("teams")
	playerColl := database.DB.Collection("players")
	coachColl := database.DB.Collection("coaches")
	scorerColl := database.DB.Collection("goalscorers")
	assistColl := database.DB.Collection("assists")

	// 1. Coaches
	fmt.Println("Processing Coaches...")
	coachColl.Drop(ctx)
	cursor, err := teamColl.Find(ctx, bson.M{})
	if err != nil {
		log.Fatalf("Failed to find teams: %v", err)
	}
	var teams []models.Team
	if err := cursor.All(ctx, &teams); err != nil {
		log.Fatalf("Failed to decode teams: %v", err)
	}

	for _, t := range teams {
		if t.Coach != "" {
			doc := CoachDoc{
				TeamID:   t.ID,
				TeamName: t.Name,
				Name:     t.Coach,
			}
			_, err := coachColl.InsertOne(ctx, doc)
			if err != nil {
				log.Printf("Failed to insert coach for %s: %v", t.Name, err)
			}
		}
	}

	// 2. Statistics
	fmt.Println("Processing Players for Stats...")
	cursor, err = playerColl.Find(ctx, bson.M{})
	if err != nil {
		log.Fatalf("Failed to find players: %v", err)
	}
	var players []models.Player
	if err := cursor.All(ctx, &players); err != nil {
		log.Fatalf("Failed to decode players: %v", err)
	}

	// Map team names for display
	teamMap := make(map[string]string)
	for _, t := range teams {
		teamMap[t.ID] = t.Name
	}

	// Goalscorers
	sort.Slice(players, func(i, j int) bool {
		return players[i].Statistics.Goals > players[j].Statistics.Goals
	})

	scorerColl.Drop(ctx)
	count := 0
	for _, p := range players {
		if count >= 10 {
			break
		}
		if p.Statistics.Goals > 0 {
			doc := StatDoc{
				PlayerID:  p.ID,
				Name:      p.DisplayName,
				TeamName:  teamMap[p.TeamID],
				TeamID:    p.TeamID,
				Value:     p.Statistics.Goals,
				ImagePath: p.ImagePath,
			}
			scorerColl.InsertOne(ctx, doc)
			count++
		}
	}

	// Assists
	sort.Slice(players, func(i, j int) bool {
		return players[i].Statistics.Assists > players[j].Statistics.Assists
	})

	assistColl.Drop(ctx)
	count = 0
	for _, p := range players {
		if count >= 10 {
			break
		}
		if p.Statistics.Assists > 0 {
			doc := StatDoc{
				PlayerID:  p.ID,
				Name:      p.DisplayName,
				TeamName:  teamMap[p.TeamID],
				TeamID:    p.TeamID,
				Value:     p.Statistics.Assists,
				ImagePath: p.ImagePath,
			}
			assistColl.InsertOne(ctx, doc)
			count++
		}
	}

	// Clean Sheets
	sort.Slice(players, func(i, j int) bool {
		return players[i].Statistics.CleanSheets > players[j].Statistics.CleanSheets
	})

	cleansheetColl := database.DB.Collection("cleansheets")
	cleansheetColl.Drop(ctx)
	count = 0
	for _, p := range players {
		if count >= 10 {
			break
		}
		if p.Statistics.CleanSheets > 0 {
			doc := StatDoc{
				PlayerID:  p.ID,
				Name:      p.DisplayName,
				TeamName:  teamMap[p.TeamID],
				TeamID:    p.TeamID,
				Value:     p.Statistics.CleanSheets,
				ImagePath: p.ImagePath,
			}
			cleansheetColl.InsertOne(ctx, doc)
			count++
		}
	}

	fmt.Println("Successfully populated coaches, goalscorers, assists, and cleansheets collections.")
}
