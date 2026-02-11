package services

import (
	"context"
	"log"

	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// UpdatePlayerStatsForMatch updates individual player statistics (Goals, Assists, Clean Sheets)
// based on the events of a finished match.
func UpdatePlayerStatsForMatch(ctx context.Context, matchID string) error {
	// 1. Get Goal Events
	cursor, err := database.DB.Collection("goal_events").Find(ctx, bson.M{"matchId": matchID})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx) // Good practice

	var events []models.GoalEvent
	if err := cursor.All(ctx, &events); err != nil {
		return err
	}

	// 2. Identify Scorers and Assisters
	scorers := make(map[string]int)
	assisters := make(map[string]int)

	for _, e := range events {
		if e.ScorerID != "" {
			scorers[e.ScorerID]++
		}
		if e.AssistID != "" {
			assisters[e.AssistID]++
		}
	}

	// 3. Update Scorers
	playerColl := database.DB.Collection("players")
	for pID, count := range scorers {
		_, err := playerColl.UpdateOne(ctx, bson.M{"_id": pID}, bson.M{"$inc": bson.M{"statistics.goals": count}})
		if err != nil {
			log.Printf("[Stats] Failed to update goals for player %s: %v", pID, err)
		}
	}

	// 4. Update Assisters
	for pID, count := range assisters {
		_, err := playerColl.UpdateOne(ctx, bson.M{"_id": pID}, bson.M{"$inc": bson.M{"statistics.assists": count}})
		if err != nil {
			log.Printf("[Stats] Failed to update assists for player %s: %v", pID, err)
		}
	}

	// 5. Clean Sheets
	// We need to know which teams kept a clean sheet
	var match models.Match
	if err := database.DB.Collection("matches").FindOne(ctx, bson.M{"_id": matchID}).Decode(&match); err != nil {
		return err
	}

	homeCleanSheet := match.AwayScore == 0
	awayCleanSheet := match.HomeScore == 0

	if homeCleanSheet {
		updateCleanSheetsForTeam(ctx, match.HomeTeamID, playerColl)
	}
	if awayCleanSheet {
		updateCleanSheetsForTeam(ctx, match.AwayTeamID, playerColl)
	}

	log.Printf("[Stats] Player statistics updated for match %s", matchID)
	return nil
}

func updateCleanSheetsForTeam(ctx context.Context, teamID string, playerColl *mongo.Collection) {
	// Regex for "Goalkeeper" case-insensitive
	filter := bson.M{
		"teamId":   teamID,
		"position": bson.M{"$regex": "(?i)goalkeeper"},
	}

	// Increment clean sheets for the #1 GK or first found GK
	var gk models.Player
	// Try to find GK with jersey number 1 first
	err := playerColl.FindOne(ctx, bson.M{"teamId": teamID, "number": 1}).Decode(&gk)
	if err != nil {
		// Fallback: any GK
		err = playerColl.FindOne(ctx, filter).Decode(&gk)
	}

	if err == nil && gk.ID != "" {
		_, err := playerColl.UpdateOne(ctx, bson.M{"_id": gk.ID}, bson.M{"$inc": bson.M{"statistics.cleanSheets": 1}})
		if err != nil {
			log.Printf("[Stats] Failed to update clean sheet for GK %s: %v", gk.Name, err)
		} else {
			log.Printf("[Stats] Clean sheet credited to GK %s (Team %s)", gk.Name, teamID)
		}
	}
}
