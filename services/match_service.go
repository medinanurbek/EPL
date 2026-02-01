package services

import (
	"assignment/models"
	"assignment/repositories"
)

type MatchService struct {
	Store        *repositories.Store
	MatchChannel chan models.Match
}

var Instance = &MatchService{
	Store:        repositories.Instance,
	MatchChannel: make(chan models.Match, 100),
}

func (s *MatchService) Start() {
	go func() {
		for range s.MatchChannel {
			s.Store.RecalculateStandings()
		}
	}()
}

func (s *MatchService) CreateMatch(m models.Match) {
	s.Store.AddMatch(m)
	s.MatchChannel <- m
}

func (s *MatchService) GetMatches() []models.MatchResponse {
	matches := s.Store.GetMatches()
	var response []models.MatchResponse
	for _, m := range matches {
		homeTeam, _ := s.Store.GetTeam(m.HomeTeamID)
		awayTeam, _ := s.Store.GetTeam(m.AwayTeamID)
		response = append(response, models.MatchResponse{
			ID:           m.ID,
			HomeTeamName: homeTeam.Name,
			AwayTeamName: awayTeam.Name,
			HomeGoals:    m.HomeGoals,
			AwayGoals:    m.AwayGoals,
		})
	}
	return response
}

func (s *MatchService) GetStandings() []models.Standing {
	return s.Store.GetStandings()
}
