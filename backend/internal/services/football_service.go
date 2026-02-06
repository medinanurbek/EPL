package services

import (
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"github.com/Sanat-07/English-Premier-League/backend/internal/repositories"
	"gorm.io/gorm"
)

type FootballService struct {
	matchRepo *repositories.MatchRepository
	teamRepo  *repositories.TeamRepository
}

func NewFootballService() *FootballService {
	return &FootballService{
		matchRepo: repositories.NewMatchRepository(),
		teamRepo:  repositories.NewTeamRepository(),
	}
}

func (s *FootballService) GetAllMatches() ([]models.Match, error) {
	return s.matchRepo.GetAllMatches()
}

func (s *FootballService) GetStandings() ([]models.Standing, error) {
	return s.matchRepo.GetStandings()
}

func (s *FootballService) CreateMatch(match *models.Match) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Create the Match
		if err := tx.Create(match).Error; err != nil {
			return err
		}

		// 2. Update Standings if Finished
		if err := UpdateStandings(match, tx); err != nil {
			return err
		}

		return nil
	})
}

func (s *FootballService) GetAllTeams() ([]models.Team, error) {
	return s.teamRepo.GetAllTeams()
}

func (s *FootballService) GetTeamByID(id string) (*models.Team, error) {
	return s.teamRepo.GetTeamByID(id)
}

func (s *FootballService) GetMatchByID(id string) (*models.Match, error) {
	return s.matchRepo.GetMatchByID(id)
}

func (s *FootballService) GetTeamSquad(teamID string) ([]models.Player, error) {
	return s.matchRepo.GetTeamSquad(teamID)
}

func (s *FootballService) GetPlayerByID(playerID string) (*models.Player, error) {
	return s.matchRepo.GetPlayerByID(playerID)
}
