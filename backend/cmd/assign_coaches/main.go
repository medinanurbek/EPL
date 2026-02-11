package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"strings"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	coll := database.DB.Collection("teams")

	coaches := map[string]string{
		"Arsenal":           "Mikel Arteta",
		"Aston Villa":       "Unai Emery",
		"Bournemouth":       "Andoni Iraola",
		"Brentford":         "Thomas Frank",
		"Brighton":          "Fabian Hürzeler",
		"Chelsea":           "Enzo Maresca",
		"Crystal Palace":    "Oliver Glasner",
		"Everton":           "Sean Dyche",
		"Fulham":            "Marco Silva",
		"Ipswich":           "Kieran McKenna",
		"Leicester":         "Steve Cooper",
		"Liverpool":         "Arne Slot",
		"Manchester City":   "Pep Guardiola",
		"Manchester United": "Ruben Amorim",
		"Newcastle":         "Eddie Howe",
		"Nottingham":        "Nuno Espírito Santo",
		"Southampton":       "Russell Martin",
		"Tottenham":         "Ange Postecoglou",
		"West Ham":          "Julen Lopetegui",
		"Wolverhampton":     "Gary O'Neil",
	}

	cursor, err := coll.Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	count := 0
	for cursor.Next(ctx) {
		var team struct {
			ID   string `bson:"_id"`
			Name string `bson:"name"`
		}
		if err := cursor.Decode(&team); err != nil {
			continue
		}

		coachName := ""
		// Try exact match
		if name, ok := coaches[team.Name]; ok {
			coachName = name
		} else {
			// Try partial match
			for tName, cName := range coaches {
				if strings.Contains(strings.ToLower(team.Name), strings.ToLower(tName)) {
					coachName = cName
					break
				}
			}
		}

		if coachName == "" {
			coachName = "N/A"
		}

		_, err := coll.UpdateOne(ctx, bson.M{"_id": team.ID}, bson.M{"$set": bson.M{"coach": coachName}})
		if err != nil {
			log.Printf("Failed to update coach for %s: %v", team.Name, err)
		} else {
			fmt.Printf("Assigned %s to %s\n", coachName, team.Name)
			count++
		}
	}

	fmt.Printf("Total teams updated: %d\n", count)
}
