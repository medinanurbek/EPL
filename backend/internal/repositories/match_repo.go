package repositories

import (
	"context"
	"log"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MatchRepository struct {
	collection *mongo.Collection
}

func NewMatchRepository() *MatchRepository {
	return &MatchRepository{
		collection: database.DB.Collection("matches"),
	}
}

func (r *MatchRepository) CreateMatch(match *models.Match) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, match)
	return err
}

func (r *MatchRepository) GetAllMatches() ([]models.Match, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.M{"date": 1})
	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var matches []models.Match
	if err := cursor.All(ctx, &matches); err != nil {
		return nil, err
	}
	return matches, nil
}

func (r *MatchRepository) GetMatchByID(id string) (*models.Match, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var match models.Match
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&match)
	if err != nil {
		return nil, err
	}
	return &match, nil
}

func (r *MatchRepository) GetMatchesByTeamID(teamID string) ([]models.Match, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"$or": []bson.M{
			{"homeTeamId": teamID},
			{"awayTeamId": teamID},
		},
	}
	opts := options.Find().SetSort(bson.M{"date": 1})
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var matches []models.Match
	if err := cursor.All(ctx, &matches); err != nil {
		return nil, err
	}
	return matches, nil
}

func (r *MatchRepository) UpdateMatch(match *models.Match) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": match.ID}, match)
	return err
}

func (r *MatchRepository) GetStandings() ([]models.Standing, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("standings")
	opts := options.Find().SetSort(bson.D{
		{Key: "points", Value: -1},
		{Key: "goalDifference", Value: -1},
		{Key: "goalsFor", Value: -1},
	})
	cursor, err := coll.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var standings []models.Standing
	if err := cursor.All(ctx, &standings); err != nil {
		return nil, err
	}
	return standings, nil
}

func (r *MatchRepository) GetAllPlayers() ([]models.Player, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	coll := database.DB.Collection("players")

	opts := options.Find().SetSort(bson.D{
		{Key: "name", Value: 1},
	}).SetProjection(bson.M{
		"statistics": 0,
	})

	cursor, err := coll.Find(ctx, bson.M{}, opts)
	if err != nil {
		log.Printf("ERROR: GetAllPlayers find failed: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var players []models.Player
	if err := cursor.All(ctx, &players); err != nil {
		log.Printf("ERROR: GetAllPlayers all failed: %v", err)
		return nil, err
	}
	return players, nil
}

func (r *MatchRepository) GetTeamSquad(teamID string) ([]models.Player, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	coll := database.DB.Collection("players")
	opts := options.Find().SetSort(bson.D{
		{Key: "position", Value: 1},
		{Key: "number", Value: 1},
	})
	cursor, err := coll.Find(ctx, bson.M{"teamId": teamID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var players []models.Player
	if err := cursor.All(ctx, &players); err != nil {
		return nil, err
	}
	return players, nil
}

func (r *MatchRepository) GetPlayerByID(playerID string) (*models.Player, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("players")
	var player models.Player
	err := coll.FindOne(ctx, bson.M{"_id": playerID}).Decode(&player)
	if err != nil {
		return nil, err
	}
	return &player, nil
}

func (r *MatchRepository) GetAllTeams() ([]models.Team, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("teams")
	cursor, err := coll.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var teams []models.Team
	if err := cursor.All(ctx, &teams); err != nil {
		return nil, err
	}
	return teams, nil
}

func (r *MatchRepository) GetTeamByID(teamID string) (*models.Team, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("teams")
	var team models.Team
	err := coll.FindOne(ctx, bson.M{"_id": teamID}).Decode(&team)
	if err != nil {
		return nil, err
	}
	return &team, nil
}
