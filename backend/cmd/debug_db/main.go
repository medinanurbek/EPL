package main

import (
	"context"
	"fmt"
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

	matchColl := database.DB.Collection("matches")

	// 1. Total Count
	count, _ := matchColl.CountDocuments(ctx, bson.M{})
	fmt.Printf("Total matches: %d\n", count)

	// 2. Status Counts
	for _, status := range []models.MatchStatus{models.MatchFinished, models.MatchScheduled, models.MatchLive} {
		c, _ := matchColl.CountDocuments(ctx, bson.M{"status": status})
		fmt.Printf("Matches %s: %d\n", status, c)
	}

	// 3. Check Matchday 1
	cursor, _ := matchColl.Find(ctx, bson.M{"matchday": 1})
	var m1 []models.Match
	cursor.All(ctx, &m1)
	fmt.Printf("Matchday 1 matches: %d\n", len(m1))
	for _, m := range m1 {
		fmt.Printf(" - %s vs %s [%s]\n", m.HomeTeamID, m.AwayTeamID, m.Status)
	}

	// 4. Run GetActiveMatchday Logic
	var allMatches []models.Match
	cAll, _ := matchColl.Find(ctx, bson.M{})
	cAll.All(ctx, &allMatches)

	statusByDay := make(map[int][]models.MatchStatus)
	minDay := 100
	maxDay := 0

	for _, m := range allMatches {
		statusByDay[m.Matchday] = append(statusByDay[m.Matchday], m.Status)
		if m.Matchday < minDay {
			minDay = m.Matchday
		}
		if m.Matchday > maxDay {
			maxDay = m.Matchday
		}
	}

	fmt.Printf("Min Day: %d, Max Day: %d\n", minDay, maxDay)

	for day := minDay; day <= maxDay; day++ {
		statuses, exists := statusByDay[day]
		if !exists {
			continue
		}

		allFinished := true
		for _, st := range statuses {
			if st != models.MatchFinished {
				allFinished = false
				break
			}
		}

		if !allFinished {
			fmt.Printf("Active Matchday should be: %d\n", day)
			break
		}
	}
}
