package repositories

import (
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) CreateUser(user *models.User) error {
	return database.DB.Create(user).Error
}

func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := database.DB.Preload("FavoriteTeams").Preload("FavoritePlayers").Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *UserRepository) GetUserByID(id string) (*models.User, error) {
	var user models.User
	err := database.DB.Preload("FavoriteTeams").Preload("FavoritePlayers").Where("id = ?", id).First(&user).Error
	return &user, err
}

func (r *UserRepository) ToggleFavoriteTeam(userID, teamID string) error {
	var user models.User
	if err := database.DB.Preload("FavoriteTeams").First(&user, "id = ?", userID).Error; err != nil {
		return err
	}

	var team models.Team
	if err := database.DB.First(&team, "id = ?", teamID).Error; err != nil {
		return err
	}

	// Check if already favorite
	isFavorite := false
	for _, t := range user.FavoriteTeams {
		if t.ID == teamID {
			isFavorite = true
			break
		}
	}

	if isFavorite {
		return database.DB.Model(&user).Association("FavoriteTeams").Delete(&team)
	}
	return database.DB.Model(&user).Association("FavoriteTeams").Append(&team)
}

func (r *UserRepository) ToggleFavoritePlayer(userID, playerID string) error {
	var user models.User
	if err := database.DB.Preload("FavoritePlayers").First(&user, "id = ?", userID).Error; err != nil {
		return err
	}

	var player models.Player
	if err := database.DB.First(&player, "id = ?", playerID).Error; err != nil {
		return err
	}

	// Check if already favorite
	isFavorite := false
	for _, p := range user.FavoritePlayers {
		if p.ID == playerID {
			isFavorite = true
			break
		}
	}

	if isFavorite {
		return database.DB.Model(&user).Association("FavoritePlayers").Delete(&player)
	}
	return database.DB.Model(&user).Association("FavoritePlayers").Append(&player)
}
