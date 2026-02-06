package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
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
	ISO3      string `json:"iso3"`
}

type SMPosition struct {
	Name string `json:"name"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("Warning: .env file not found, relying on system env vars")
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASSWORD", "postgres"),
		getEnv("DB_NAME", "epl_db"),
		getEnv("DB_PORT", "5432"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

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
			Number:           item.JerseyNumber, // Use jersey number from wrapper
			Height:           height,
			Weight:           weight,
			DateOfBirth:      smPlayer.DateOfBirth,
			ImagePath:        smPlayer.ImagePath,
			IsCaptain:        item.Captain, // Use captain status from wrapper
			Statistics:       statsStr,     // Store raw stats JSON
		}

		// Save to DB (Upsert)
		if err := db.Save(&player).Error; err != nil {
			log.Printf("Failed to save player %s: %v", player.Name, err)
		} else {
			fmt.Printf("Saved player: %s (#%d)\n", player.Name, player.Number)
		}
	}

	fmt.Println("Seeding completed successfully!")
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
