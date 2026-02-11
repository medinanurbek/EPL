package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
	DeletedAt *time.Time         `bson:"deletedAt,omitempty" json:"-"`

	Email    string `bson:"email" json:"email"`
	Password string `bson:"password" json:"-"`
	FullName string `bson:"fullName" json:"fullName"`
	// Favorites
	FavoriteTeams   []Team   `bson:"favoriteTeams" json:"favoriteTeams"`
	FavoritePlayers []Player `bson:"favoritePlayers" json:"favoritePlayers"`

	Role string `bson:"role" json:"role"` // GUEST, ADMIN
}
