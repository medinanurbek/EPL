package services

import (
	"log"

	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"gorm.io/gorm"
)

// UpdateStandings recalculates the standings for the given match.
// It assumes the match is either new or just updated.
// For simplicity, this function just increments the stats.
// In a real system, you might want to recalculate everything from scratch for accuracy.
func UpdateStandings(match *models.Match, tx *gorm.DB) error {
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

	for _, t := range teams {
		var standing models.Standing
		err := tx.FirstOrCreate(&standing, models.Standing{TeamID: t.ID}).Error
		if err != nil {
			return err
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

		if err := tx.Save(&standing).Error; err != nil {
			return err
		}
	}

	log.Printf("Calculated standings for match %s", match.ID)
	return nil
}
