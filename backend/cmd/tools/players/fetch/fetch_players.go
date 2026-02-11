package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	APIToken = "EYG7VsDUN0BeetGy3ahvlXX1oftKQzsqHzjplb99YWSs9Kt8ZYUVA5KLnrca"
	SeasonID = "25583"
)

type SquadResponse struct {
	Data []SquadItem `json:"data"`
}

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
	Height      interface{}   `json:"height"`
	Weight      interface{}   `json:"weight"`
	DateOfBirth string        `json:"date_of_birth"`
	Nationality SMNationality `json:"nationality"`
	Position    SMPosition    `json:"position"`
	Statistics  []interface{} `json:"statistics"`
}

type SMNationality struct {
	Name      string `json:"name"`
	ImagePath string `json:"image_path"`
	ISO2      string `json:"iso2"`
	ISO3      string `json:"iso3"`
}

type SMPosition struct {
	Name string `json:"name"`
}

func main() {
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)

	ctx := context.Background()

	// 1. Clear players collection
	fmt.Println("Clearing existing players...")
	_, err := database.DB.Collection("players").DeleteMany(ctx, bson.M{})
	if err != nil {
		log.Fatalf("Failed to clear players: %v", err)
	}

	// 2. Get Teams
	cursor, err := database.DB.Collection("teams").Find(ctx, bson.M{})
	if err != nil {
		log.Fatalf("Failed to fetch teams: %v", err)
	}
	defer cursor.Close(ctx)

	var teams []models.Team
	if err := cursor.All(ctx, &teams); err != nil {
		log.Fatalf("Failed to decode teams: %v", err)
	}

	fmt.Printf("Found %d teams. Starting seeding...\n", len(teams))

	for _, team := range teams {
		fmt.Printf("Fetching squad for %s (ID: %s)...\n", team.Name, team.ID)

		url := fmt.Sprintf("https://api.sportmonks.com/v3/football/squads/teams/%s?api_token=%s&include=player.nationality;player.position&filters=playerstatisticSeasons:%s", team.ID, APIToken, SeasonID)

		resp, err := http.Get(url)
		if err != nil {
			log.Printf("Failed to fetch squad for team %s: %v", team.Name, err)
			continue
		}
		defer resp.Body.Close()

		body, _ := ioutil.ReadAll(resp.Body)
		var squadResp SquadResponse
		if err := json.Unmarshal(body, &squadResp); err != nil {
			log.Printf("Failed to parse JSON for team %s: %v", team.Name, err)
			continue
		}

		fmt.Printf("Processing %d players for %s...\n", len(squadResp.Data), team.Name)

		coll := database.DB.Collection("players")
		for _, item := range squadResp.Data {
			smPlayer := item.Player
			pos := smPlayer.Position.Name
			if pos == "" {
				pos = "Unknown"
			}

			height := 0
			if val, ok := smPlayer.Height.(float64); ok {
				height = int(val)
			}
			weight := 0
			if val, ok := smPlayer.Weight.(float64); ok {
				weight = int(val)
			}

			// isCaptainVal removed

			player := models.Player{
				ID:               strconv.Itoa(smPlayer.ID),
				TeamID:           team.ID,
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
				Number:           item.JerseyNumber,
				Height:           height,
				Weight:           weight,
				DateOfBirth:      smPlayer.DateOfBirth,
				ImagePath:        smPlayer.ImagePath,
				IsCaptain:        item.Captain,
				Statistics:       models.PlayerStats{},
			}

			filter := bson.M{"_id": player.ID}
			update := bson.M{"$set": player}
			opts := options.Update().SetUpsert(true)
			coll.UpdateOne(ctx, filter, update, opts)
		}

		// Small sleep to avoid rate limiting
		time.Sleep(500 * time.Millisecond)
	}

	fmt.Println("All squads seeded successfully!")
}
