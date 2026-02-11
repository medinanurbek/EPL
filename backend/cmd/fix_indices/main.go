package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Println("Error loading .env file")
	}

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	dbName := os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		dbName = "epl"
	}

	coll := client.Database(dbName).Collection("players")

	// Create index on name for sorting and searching
	_, err = coll.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "name", Value: 1}},
	})
	if err != nil {
		log.Printf("Failed to create name index: %v", err)
	} else {
		log.Println("Created index on 'name'")
	}

	// Create index on teamId
	_, err = coll.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "teamId", Value: 1}},
	})
	if err != nil {
		log.Printf("Failed to create teamId index: %v", err)
	} else {
		log.Println("Created index on 'teamId'")
	}

	log.Println("Indexing complete.")
}
