package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Password string `json:"-"` // Never return password
	FullName string `json:"fullName"`
	// Favorites
	FavoriteTeams   []Team   `gorm:"many2many:user_favorite_teams;" json:"favoriteTeams"`
	FavoritePlayers []Player `gorm:"many2many:user_favorite_players;" json:"favoritePlayers"`

	Role string `gorm:"default:'GUEST'" json:"role"` // GUEST, ADMIN
}
