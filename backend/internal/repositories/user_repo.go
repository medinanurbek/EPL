package repositories

import (
	"context"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository() *UserRepository {
	return &UserRepository{
		collection: database.DB.Collection("users"),
	}
}

func (r *UserRepository) CreateUser(user *models.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if user.ID.IsZero() {
		user.ID = primitive.NewObjectID()
	}
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	_, err := r.collection.InsertOne(ctx, user)
	return err
}

func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetUserByID(id string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var user models.User
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) ToggleFavoriteTeam(userID, teamID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find the user first to check current favorites
	user, err := r.GetUserByID(userID)
	if err != nil {
		return err
	}

	// Find the team to add/remove
	teamCollection := database.DB.Collection("teams")
	var team models.Team
	err = teamCollection.FindOne(ctx, bson.M{"_id": teamID}).Decode(&team)
	if err != nil {
		return err
	}

	isFavorite := false
	for _, t := range user.FavoriteTeams {
		if t.ID == teamID {
			isFavorite = true
			break
		}
	}

	var update bson.M
	if isFavorite {
		update = bson.M{"$pull": bson.M{"favoriteTeams": bson.M{"_id": teamID}}}
	} else {
		update = bson.M{"$addToSet": bson.M{"favoriteTeams": team}}
	}

	objID, _ := primitive.ObjectIDFromHex(userID)
	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	return err
}

func (r *UserRepository) ToggleFavoritePlayer(userID, playerID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find the user
	user, err := r.GetUserByID(userID)
	if err != nil {
		return err
	}

	// Find the player
	playerCollection := database.DB.Collection("players")
	var player models.Player
	err = playerCollection.FindOne(ctx, bson.M{"_id": playerID}).Decode(&player)
	if err != nil {
		return err
	}

	isFavorite := false
	for _, p := range user.FavoritePlayers {
		if p.ID == playerID {
			isFavorite = true
			break
		}
	}

	var update bson.M
	if isFavorite {
		update = bson.M{"$pull": bson.M{"favoritePlayers": bson.M{"_id": playerID}}}
	} else {
		update = bson.M{"$addToSet": bson.M{"favoritePlayers": player}}
	}

	objID, _ := primitive.ObjectIDFromHex(userID)
	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	return err
}
