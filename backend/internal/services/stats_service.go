package services

import (
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"github.com/Sanat-07/English-Premier-League/backend/internal/repositories"
)

type StatsService struct {
	matchRepo *repositories.MatchRepository
}

func NewStatsService(matchRepo *repositories.MatchRepository) *StatsService {
	return &StatsService{
		matchRepo: matchRepo,
	}
}

type StatsResponse struct {
	TopScorers  []repositories.StatEntry `json:"topScorers"`
	TopAssists  []repositories.StatEntry `json:"topAssists"`
	CleanSheets []repositories.StatEntry `json:"cleanSheets"`
}

func (s *StatsService) GetStats() (*StatsResponse, error) {
	topScorers, err := s.matchRepo.GetTopScorers(10)
	if err != nil {
		return nil, err
	}
	topAssists, err := s.matchRepo.GetTopAssists(10)
	if err != nil {
		return nil, err
	}
	cleanSheets, err := s.matchRepo.GetCleanSheets(10)
	if err != nil {
		return nil, err
	}
	return &StatsResponse{
		TopScorers:  topScorers,
		TopAssists:  topAssists,
		CleanSheets: cleanSheets,
	}, nil
}

func (s *StatsService) GetMatchGoalEvents(matchIndex int) ([]models.GoalEvent, error) {
	return s.matchRepo.GetMatchGoalEvents(matchIndex)
}
