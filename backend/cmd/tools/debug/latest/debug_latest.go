package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)
	ctx := context.Background()

	coll := database.DB.Collection("matches")

	opts := options.Find().
		SetSort(bson.D{
			{Key: "matchday", Value: -1},
			{Key: "date", Value: -1},
		}).
		SetLimit(10)

	cursor, err := coll.Find(ctx, bson.M{"status": "FINISHED"}, opts)
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	fmt.Println("Latest 10 Finished Matches (by matchday DESC, date DESC):")
	for cursor.Next(ctx) {
		var match struct {
			ID         string    `bson:"_id"`
			HomeTeamID string    `bson:"homeTeamId"`
			AwayTeamID string    `bson:"awayTeamId"`
			Matchday   int       `bson:"matchday"`
			Date       time.Time `bson:"date"`
			Status     string    `bson:"status"`
			HomeScore  int       `bson:"homeScore"`
			AwayScore  int       `bson:"awayScore"`
		}
		if err := cursor.Decode(&match); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Matchday %d | %s v %s | %d:%d | Date: %s\n",
			match.Matchday, match.HomeTeamID, match.AwayTeamID,
			match.HomeScore, match.AwayScore, match.Date.Format("Mon 02 Jan 2006"))
	}
}
