package services

import (
	"fmt"

	"github.com/Sanat-07/English-Premier-League/backend/internal/repositories"
)

type CoachService struct {
	teamRepo *repositories.TeamRepository
}

func NewCoachService(teamRepo *repositories.TeamRepository) *CoachService {
	return &CoachService{
		teamRepo: teamRepo,
	}
}

func (s *CoachService) AddCoach(teamID, name string) error {
	team, err := s.teamRepo.GetTeamByID(teamID)
	if err != nil {
		return err
	}
	if team.Coach != "" {
		return fmt.Errorf("team already has a coach: %s. Use replace to change.", team.Coach)
	}
	return s.teamRepo.UpdateTeamCoach(teamID, name)
}

func (s *CoachService) RemoveCoach(teamID string) error {
	return s.teamRepo.UpdateTeamCoach(teamID, "")
}

func (s *CoachService) ReplaceCoach(teamID, name string) error {
	return s.teamRepo.UpdateTeamCoach(teamID, name)
}
