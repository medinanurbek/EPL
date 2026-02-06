package repositories

import (
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
)

type MatchRepository struct{}

func NewMatchRepository() *MatchRepository {
	return &MatchRepository{}
}

func (r *MatchRepository) GetAllMatches() ([]models.Match, error) {
	var matches []models.Match
	err := database.DB.Preload("HomeTeam").Preload("AwayTeam").Preload("Events").Find(&matches).Error
	return matches, err
}

func (r *MatchRepository) CreateMatch(match *models.Match) error {
	return database.DB.Create(match).Error
}

func (r *MatchRepository) UpdateMatch(match *models.Match) error {
	return database.DB.Save(match).Error
}

func (r *MatchRepository) GetMatchByID(id string) (*models.Match, error) {
	var match models.Match
	err := database.DB.Preload("HomeTeam").Preload("AwayTeam").Preload("Events").First(&match, "id = ?", id).Error
	return &match, err
}

func (r *MatchRepository) GetStandings() ([]models.Standing, error) {
	var standings []models.Standing
	// Ensure we preload the Team info for the table
	err := database.DB.Preload("Team").Order("points desc, goal_difference desc, goals_for desc").Find(&standings).Error
	return standings, err
}

func (r *MatchRepository) GetTeamSquad(teamID string) ([]models.Player, error) {
	var players []models.Player
	err := database.DB.Where("team_id = ?", teamID).Order("position, number").Find(&players).Error
	return players, err
}

func (r *MatchRepository) GetPlayerByID(playerID string) (*models.Player, error) {
	var player models.Player
	err := database.DB.First(&player, "id = ?", playerID).Error
	return &player, err
}

func (r *MatchRepository) GetAllTeams() ([]models.Team, error) {
	var teams []models.Team
	err := database.DB.Find(&teams).Error
	return teams, err
}

func (r *MatchRepository) GetTeamByID(teamID string) (*models.Team, error) {
	var team models.Team
	err := database.DB.First(&team, "id = ?", teamID).Error
	return &team, err
}
