package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Review struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    string             `bson:"userId" json:"userId"`
	UserName  string             `bson:"userName" json:"userName"` // For display without extra lookup
	MatchID   string             `bson:"matchId,omitempty" json:"matchId,omitempty"`
	TeamID    string             `bson:"teamId,omitempty" json:"teamId,omitempty"`
	PlayerID  string             `bson:"playerId,omitempty" json:"playerId,omitempty"`
	Content   string             `bson:"content" json:"content"`
	Rating    int                `bson:"rating" json:"rating"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}
