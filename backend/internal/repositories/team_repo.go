package repositories

import (
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
)

type TeamRepository struct{}

func NewTeamRepository() *TeamRepository {
	return &TeamRepository{}
}

func (r *TeamRepository) GetAllTeams() ([]models.Team, error) {
	var teams []models.Team
	err := database.DB.Find(&teams).Error
	return teams, err
}

func (r *TeamRepository) GetTeamByID(id string) (*models.Team, error) {
	var team models.Team
	err := database.DB.Preload("Players").First(&team, "id = ?", id).Error
	return &team, err
}

func (r *TeamRepository) CreateTeam(team *models.Team) error {
	return database.DB.Create(team).Error
}
