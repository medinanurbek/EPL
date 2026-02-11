package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// SportMonks structures for parsing the JSON
type SquadItem struct {
	Player       SMPlayer `json:"player"`
	Captain      bool     `json:"captain"`
	JerseyNumber int      `json:"jersey_number"`
}

type SMPlayer struct {
	ID          int           `json:"id"`
	CommonName  string        `json:"common_name"`
	FirstName   string        `json:"firstname"`
	LastName    string        `json:"lastname"`
	Name        string        `json:"name"`
	DisplayName string        `json:"display_name"`
	ImagePath   string        `json:"image_path"`
	Height      interface{}   `json:"height"` // can be int or string
	Weight      interface{}   `json:"weight"` // can be int or string
	DateOfBirth string        `json:"date_of_birth"`
	Nationality SMNationality `json:"nationality"`
	Position    SMPosition    `json:"position"`
	Statistics  []interface{} `json:"statistics"` // Raw stats array
}

type SMNationality struct {
	Name      string `json:"name"`
	ImagePath string `json:"image_path"` // Country flag
	ISO2      string `json:"iso2"`
	ISO3      string `json:"iso3"`
}

type SMPosition struct {
	Name string `json:"name"`
}

func main() {
	// 1. Setup DB
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Read mancitysquad.json
	jsonFile, err := os.Open("/Users/admin/English-Premier-League/mancitysquad.json")
	if err != nil {
		// Fallback to teamsquad.txt just in case
		jsonFile, err = os.Open("/Users/admin/English-Premier-League/teamsquad.txt")
		if err != nil {
			log.Fatalf("Error opening mancitysquad.json or teamsquad.txt: %v", err)
		}
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Fatalf("Error reading squad file: %v", err)
	}

	if len(byteValue) == 0 {
		log.Fatal("File is empty.")
	}

	var squadItems []SquadItem
	if err := json.Unmarshal(byteValue, &squadItems); err != nil {
		log.Fatalf("Error parsing JSON: %v", err)
	}

	fmt.Printf("Found %d players in parsed file\n", len(squadItems))

	coll := database.DB.Collection("players")

	for _, item := range squadItems {
		smPlayer := item.Player

		// Map position
		pos := smPlayer.Position.Name
		if pos == "" {
			pos = "Unknown"
		}

		// Map height/weight safely
		height := 0
		if val, ok := smPlayer.Height.(float64); ok {
			height = int(val)
		} else if val, ok := smPlayer.Height.(int); ok {
			height = val
		}

		weight := 0
		if val, ok := smPlayer.Weight.(float64); ok {
			weight = int(val)
		} else if val, ok := smPlayer.Weight.(int); ok {
			weight = val
		}

		// Marshal statistics to string
		var statsStr *string
		if len(smPlayer.Statistics) > 0 {
			statsBytes, err := json.Marshal(smPlayer.Statistics)
			if err == nil {
				s := string(statsBytes)
				statsStr = &s
			}
		}

		player := models.Player{
			ID:               strconv.Itoa(smPlayer.ID),
			TeamID:           "9", // Manchester City
			Name:             smPlayer.Name,
			CommonName:       smPlayer.CommonName,
			FirstName:        smPlayer.FirstName,
			LastName:         smPlayer.LastName,
			DisplayName:      smPlayer.DisplayName,
			Position:         pos,
			DetailedPosition: pos,
			Nationality:      smPlayer.Nationality.Name,
			NationalityCode:  smPlayer.Nationality.ISO3,
			NationalityISO2:  smPlayer.Nationality.ISO2,
			Number:           item.JerseyNumber, // Use jersey number from wrapper
			Height:           height,
			Weight:           weight,
			DateOfBirth:      smPlayer.DateOfBirth,
			ImagePath:        smPlayer.ImagePath,
			IsCaptain:        item.Captain, // Use captain status from wrapper
			Statistics:       statsStr,     // Store raw stats JSON
		}

		// Save to DB (Upsert)
		filter := bson.M{"_id": player.ID}
		update := bson.M{"$set": player}
		opts := options.Update().SetUpsert(true)
		_, err := coll.UpdateOne(ctx, filter, update, opts)
		if err != nil {
			log.Printf("Failed to save player %s: %v", player.Name, err)
		} else {
			fmt.Printf("Saved player: %s (#%d)\n", player.Name, player.Number)
		}
	}

	fmt.Println("Seeding completed successfully!")
}
