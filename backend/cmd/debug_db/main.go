package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collections, err := database.DB.ListCollectionNames(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Collections:", collections)

	count, _ := database.DB.Collection("users").CountDocuments(ctx, bson.M{})
	fmt.Printf("User count: %d\n", count)

	var team bson.M
	err = database.DB.Collection("teams").FindOne(ctx, bson.M{}).Decode(&team)
	if err == nil {
		fmt.Printf("Sample team: %+v\n", team)
	}

	var standing bson.M
	err = database.DB.Collection("standings").FindOne(ctx, bson.M{}).Decode(&standing)
	if err == nil {
		fmt.Printf("Sample standing: %+v\n", standing)
	}
}
