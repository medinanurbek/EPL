package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Connect to DB
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check Teams
	var teams []models.Team
	teamColl := database.DB.Collection("teams")
	cursor, err := teamColl.Find(ctx, bson.M{})
	if err != nil {
		log.Fatalf("Failed to fetch teams: %v", err)
	}
	if err := cursor.All(ctx, &teams); err != nil {
		log.Fatalf("Failed to decode teams: %v", err)
	}

	fmt.Printf("\n=== TEAMS (Total: %d) ===\n", len(teams))
	for i, team := range teams {
		if i < 10 { // Show first 10
			fmt.Printf("%d. %s (%s) - Logo: %s\n", i+1, team.Name, team.ShortName, team.LogoURL)
		}
	}

	// Check Standings
	var standings []models.Standing
	standingColl := database.DB.Collection("standings")
	opts := options.Find().SetSort(bson.M{"points": -1})
	cursor, err = standingColl.Find(ctx, bson.M{}, opts)
	if err != nil {
		log.Fatalf("Failed to fetch standings: %v", err)
	}
	if err := cursor.All(ctx, &standings); err != nil {
		log.Fatalf("Failed to decode standings: %v", err)
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
	utils := []struct {
		Name string
		Coll string
	}{
		{"Users", "users"},
		{"Players", "players"},
		{"Matches", "matches"},
		{"Seasons", "seasons"},
	}

	fmt.Printf("\n=== OTHER TABLES ===\n")
	for _, u := range utils {
		count, _ := database.DB.Collection(u.Coll).CountDocuments(ctx, bson.M{})
		fmt.Printf("%s: %d\n", u.Name, count)
	}

	fmt.Println("\n✅ Database check completed!")
}
