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
)

func main() {
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	col := database.DB.Collection("teams")

	casey := "Casey Stoney"
	mikel := "Mikel Arteta"
	pep := "Pep Guardiola"

	updates := map[string]string{
		"Arsenal":         mikel,
		"Manchester City": pep,
		"Chelsea":         casey,
	}

	for teamName, coach := range updates {
		var team models.Team
		err := col.FindOne(ctx, bson.M{"name": teamName}).Decode(&team)
		if err != nil {
			log.Printf("Team %s not found: %v", teamName, err)
			continue
		}

		_, err = col.UpdateOne(ctx, bson.M{"_id": team.ID}, bson.M{"$set": bson.M{"coach": coach}})
		if err != nil {
			log.Printf("Failed to update coach for %s: %v", teamName, err)
		} else {
			fmt.Printf("Updated %s with coach %s\n", teamName, coach)
		}
	}

	fmt.Println("Coach assignment complete.")
}
