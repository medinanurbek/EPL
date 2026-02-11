package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func main() {
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Goal Events Indexes
	goalEvents := database.DB.Collection("goal_events")
	_, err := goalEvents.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "scorerId", Value: 1}}},
		{Keys: bson.D{{Key: "assistId", Value: 1}}},
		{Keys: bson.D{{Key: "matchIndex", Value: 1}}},
		{Keys: bson.D{{Key: "minute", Value: 1}}},
	})
	if err != nil {
		log.Printf("Error creating goal_events indexes: %v", err)
	} else {
		fmt.Println("✅ goal_events indexes created")
	}

	// Players Indexes
	players := database.DB.Collection("players")
	_, err = players.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "teamId", Value: 1}}},
		{Keys: bson.D{{Key: "position", Value: 1}}},
	})
	if err != nil {
		log.Printf("Error creating players indexes: %v", err)
	} else {
		fmt.Println("✅ players indexes created")
	}

	// Matches Indexes
	matches := database.DB.Collection("matches")
	_, err = matches.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "date", Value: 1}}},
		{Keys: bson.D{{Key: "homeTeamId", Value: 1}}},
		{Keys: bson.D{{Key: "awayTeamId", Value: 1}}},
	})
	if err != nil {
		log.Printf("Error creating matches indexes: %v", err)
	} else {
		fmt.Println("✅ matches indexes created")
	}
}
