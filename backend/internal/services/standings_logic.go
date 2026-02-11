package services

import (
	"context"
	"log"

	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// UpdateStandings recalculates the standings for the given match.
func UpdateStandings(ctx context.Context, match *models.Match) error {
	if match.Status != models.MatchFinished {
		return nil
	}

	teams := []struct {
		ID       string
		Score    int
		OppScore int
	}{
		{match.HomeTeamID, match.HomeScore, match.AwayScore},
		{match.AwayTeamID, match.AwayScore, match.HomeScore},
	}

	coll := database.DB.Collection("standings")

	for _, t := range teams {
		var standing models.Standing
		filter := bson.M{"_id": t.ID}

		err := coll.FindOne(ctx, filter).Decode(&standing)
		if err != nil {
			// If not found, a new standing object will be initialized with zeroes
			standing.TeamID = t.ID
		}

		standing.Played++
		standing.GoalsFor += t.Score
		standing.GoalsAgainst += t.OppScore
		standing.GoalDifference = standing.GoalsFor - standing.GoalsAgainst

		if t.Score > t.OppScore {
			standing.Wins++
			standing.Points += 3
		} else if t.Score == t.OppScore {
			standing.Draws++
			standing.Points += 1
		} else {
			standing.Losses++
		}

		// Update or Insert
		opts := options.Update().SetUpsert(true)
		_, err = coll.UpdateOne(ctx, filter, bson.M{"$set": standing}, opts)
		if err != nil {
			return err
		}
	}

	log.Printf("Calculated standings for match %s", match.ID)
	return nil
}
