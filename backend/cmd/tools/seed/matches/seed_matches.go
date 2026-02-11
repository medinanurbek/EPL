package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strings"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MatchJSON struct {
	Matchday      int         `json:"matchday"`
	Date          string      `json:"date"`
	Time          string      `json:"time"`
	HomeTeam      string      `json:"homeTeam"`
	AwayTeam      string      `json:"awayTeam"`
	HomeScore     int         `json:"homeScore"`
	AwayScore     int         `json:"awayScore"`
	HalfTimeScore interface{} `json:"halfTimeScore"` // can be string or null
}

func main() {
	cfg := config.LoadConfig()
	database.ConnectDB(cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// 1. Load Teams
	teamColl := database.DB.Collection("teams")
	matchColl := database.DB.Collection("matches")

	// Clear existing matches to avoid duplicates or use upsert
	if err := matchColl.Drop(ctx); err != nil {
		log.Printf("Warning: Failed to drop matches collection: %v", err)
	}

	cursor, err := teamColl.Find(ctx, bson.M{})
	if err != nil {
		log.Fatalf("Failed to fetch teams: %v", err)
	}
	var teams []models.Team
	if err := cursor.All(ctx, &teams); err != nil {
		log.Fatalf("Failed to decode teams: %v", err)
	}

	// Create map for fuzzy matching
	teamMap := make(map[string]string) // name -> ID
	for _, t := range teams {
		teamMap[normalizeName(t.Name)] = t.ID
		// Add some hardcoded variations if needed
		if t.Name == "Wolverhampton Wanderers" {
			teamMap["wolves"] = t.ID
		}
	}

	// 2. Process Results (Finished Matches)
	processFile(ctx, "../../results.json", matchColl, teamMap, models.MatchFinished)

	// 3. Process Fixtures (Scheduled Matches)
	processFile(ctx, "../../next_matches.json", matchColl, teamMap, models.MatchScheduled)

	fmt.Println("Match seeding completed!")
}

func processFile(ctx context.Context, filePath string, coll *mongo.Collection, teamMap map[string]string, status models.MatchStatus) {
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		// Try absolute path
		filePath = "/Users/admin/English-Premier-League/" + strings.TrimPrefix(filePath, "../../")
		data, err = ioutil.ReadFile(filePath)
		if err != nil {
			log.Printf("Failed to read file %s: %v", filePath, err)
			return
		}
	}

	var matchEntries []MatchJSON
	if err := json.Unmarshal(data, &matchEntries); err != nil {
		log.Printf("Failed to parse JSON %s: %v", filePath, err)
		return
	}

	count := 0
	for _, m := range matchEntries {
		homeID, ok1 := resolveTeamID(m.HomeTeam, teamMap)
		awayID, ok2 := resolveTeamID(m.AwayTeam, teamMap)

		if !ok1 || !ok2 {
			log.Printf("Skipping match %s vs %s: Team ID not found", m.HomeTeam, m.AwayTeam)
			continue
		}

		// Parse Date
		// Date format examples: "Fri Aug/15", "Sat Feb/7"
		dateStr := m.Date
		if !strings.Contains(dateStr, "202") {
			// Intelligent year assignment for 2025/26 season
			if strings.Contains(dateStr, "Aug") ||
				strings.Contains(dateStr, "Sep") ||
				strings.Contains(dateStr, "Oct") ||
				strings.Contains(dateStr, "Nov") ||
				strings.Contains(dateStr, "Dec") {
				dateStr += " 2025"
			} else {
				dateStr += " 2026"
			}
		}

		// Normalize time: "20.00" -> "20:00"
		timeStr := strings.Replace(m.Time, ".", ":", 1)
		if timeStr == "" {
			timeStr = "15:00" // Default time
		}

		// Try multiple layouts
		layouts := []string{
			"Mon Jan/02 2006 15:04",
			"Mon Jan/2 2006 15:04",
		}

		fullDateStr := fmt.Sprintf("%s %s", dateStr, timeStr)
		var parsedTime time.Time
		var err error

		for _, layout := range layouts {
			parsedTime, err = time.Parse(layout, fullDateStr)
			if err == nil {
				break
			}
		}

		if err != nil {
			log.Printf("Failed to parse date: %s (%v). Using default.", fullDateStr, err)
			parsedTime = time.Now()
		}

		match := models.Match{
			ID:         fmt.Sprintf("M%d_%s_%s", m.Matchday, homeID, awayID),
			HomeTeamID: homeID,
			AwayTeamID: awayID,
			Matchday:   m.Matchday,
			Date:       parsedTime, // Fixed: passing time.Time
			Status:     status,
			SeasonID:   "2025/26",
			HomeScore:  0,
			AwayScore:  0,
		}

		if status == models.MatchFinished {
			match.HomeScore = m.HomeScore
			match.AwayScore = m.AwayScore
		}

		_, err = coll.InsertOne(ctx, match)
		if err != nil {
			log.Printf("Error inserting match: %v", err)
		} else {
			count++
		}
	}
	fmt.Printf("Inserted %d matches from %s\n", count, filePath)
}

func normalizeName(name string) string {
	s := strings.ToLower(name)
	s = strings.ReplaceAll(s, " fc", "")
	s = strings.ReplaceAll(s, " afc", "")
	s = strings.ReplaceAll(s, "&", "and")
	s = strings.TrimSpace(s)
	return s
}

func resolveTeamID(name string, teamMap map[string]string) (string, bool) {
	normalized := normalizeName(name)
	id, ok := teamMap[normalized]

	// Fallback for some specifics
	if !ok {
		if strings.Contains(normalized, "manchester united") {
			return teamMap["manchester united"], true
		}
		if strings.Contains(normalized, "manchester city") {
			return teamMap["manchester city"], true
		}
		if strings.Contains(normalized, "tottenham") {
			return teamMap["tottenham hotspur"], true
		}
		if strings.Contains(normalized, "newcastle") {
			return teamMap["newcastle united"], true
		}
		if strings.Contains(normalized, "brighton") {
			return teamMap["brighton and hove albion"], true
		}
		if strings.Contains(normalized, "west ham") {
			return teamMap["west ham united"], true
		}
		if strings.Contains(normalized, "wolves") {
			return teamMap["wolverhampton wanderers"], true
		}
		if strings.Contains(normalized, "leicester") {
			return teamMap["leicester city"], true
		}
		if strings.Contains(normalized, "leeds") {
			return teamMap["leeds united"], true
		}
		if strings.Contains(normalized, "nottingham") {
			return teamMap["nottingham forest"], true
		}
		if strings.Contains(normalized, "sheffield") {
			return teamMap["sheffield united"], true
		}
		if strings.Contains(normalized, "luton") {
			return teamMap["luton town"], true
		}
		if strings.Contains(normalized, "bournemouth") {
			return teamMap["afc bournemouth"], true
		}
	}
	return id, ok
}
