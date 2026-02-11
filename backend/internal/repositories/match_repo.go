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
		"statistics": 1,
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

type StatEntry struct {
	PlayerID  string `bson:"_id" json:"playerId"`
	Name      string `bson:"name" json:"name"`
	TeamName  string `bson:"teamName" json:"teamName"`
	TeamID    string `bson:"teamId" json:"teamId"`
	ImagePath string `bson:"imagePath" json:"imagePath"`
	Value     int    `bson:"count" json:"value"`
}

func (r *MatchRepository) GetTopScorers(limit int) ([]StatEntry, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	coll := database.DB.Collection("goalscorers")
	opts := options.Find().SetSort(bson.M{"count": -1}).SetLimit(int64(limit))

	cursor, err := coll.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []StatEntry
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func (r *MatchRepository) GetTopAssists(limit int) ([]StatEntry, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	coll := database.DB.Collection("assists")
	opts := options.Find().SetSort(bson.M{"count": -1}).SetLimit(int64(limit))

	cursor, err := coll.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []StatEntry
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func (r *MatchRepository) GetCleanSheets(limit int) ([]StatEntry, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	coll := database.DB.Collection("cleansheets")
	opts := options.Find().SetSort(bson.M{"count": -1}).SetLimit(int64(limit))

	cursor, err := coll.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []StatEntry
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func (r *MatchRepository) GetMatchGoalEvents(matchIndex int) ([]models.GoalEvent, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("goal_events")
	opts := options.Find().SetSort(bson.D{{Key: "minute", Value: 1}})
	cursor, err := coll.Find(ctx, bson.M{"matchIndex": matchIndex}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var events []models.GoalEvent
	if err := cursor.All(ctx, &events); err != nil {
		return nil, err
	}
	return events, nil
}

// GetGoalEventsByMatchID returns all goal events for a match by matchId
func (r *MatchRepository) GetGoalEventsByMatchID(matchID string) ([]models.GoalEvent, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("goal_events")
	opts := options.Find().SetSort(bson.D{{Key: "minute", Value: 1}})
	cursor, err := coll.Find(ctx, bson.M{"matchId": matchID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var events []models.GoalEvent
	if err := cursor.All(ctx, &events); err != nil {
		return nil, err
	}
	return events, nil
}

// EditGoalEvent updates a goal event
func (r *MatchRepository) EditGoalEvent(eventID string, update bson.M) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("goal_events")
	_, err := coll.UpdateOne(ctx, bson.M{"_id": eventID}, bson.M{"$set": update})
	return err
}

// DeleteGoalEvent removes a goal event
func (r *MatchRepository) DeleteGoalEvent(eventID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("goal_events")
	_, err := coll.DeleteOne(ctx, bson.M{"_id": eventID})
	return err
}

// GetMatchesByMatchday returns all matches for a given matchday
func (r *MatchRepository) GetMatchesByMatchday(matchday int) ([]models.Match, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "date", Value: 1}})
	cursor, err := r.collection.Find(ctx, bson.M{"matchday": matchday}, opts)
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

// UpdateMatchScore updates only the score fields
func (r *MatchRepository) UpdateMatchScore(matchID string, homeScore, awayScore int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.UpdateOne(ctx,
		bson.M{"_id": matchID},
		bson.M{"$set": bson.M{"homeScore": homeScore, "awayScore": awayScore}},
	)
	return err
}

// UpdateMatchStatus updates the match status
func (r *MatchRepository) UpdateMatchStatus(matchID string, status models.MatchStatus) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.UpdateOne(ctx,
		bson.M{"_id": matchID},
		bson.M{"$set": bson.M{"status": status}},
	)
	return err
}

// --- Player CRUD ---

// CreatePlayer inserts a new player
func (r *MatchRepository) CreatePlayer(player *models.Player) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("players")
	_, err := coll.InsertOne(ctx, player)
	return err
}

// UpdatePlayer updates a player's fields
func (r *MatchRepository) UpdatePlayer(playerID string, update bson.M) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("players")
	_, err := coll.UpdateOne(ctx, bson.M{"_id": playerID}, bson.M{"$set": update})
	return err
}

// DeletePlayer removes a player
func (r *MatchRepository) DeletePlayer(playerID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	coll := database.DB.Collection("players")
	_, err := coll.DeleteOne(ctx, bson.M{"_id": playerID})
	return err
}

// GetLatestResultMatches returns the last 'limit' matches with status FINISHED, sorted by date desc
func (r *MatchRepository) GetLatestResultMatches(limit int) ([]models.Match, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Find().
		SetSort(bson.D{
			{Key: "matchday", Value: -1},
			{Key: "date", Value: -1},
		}). // Latest first
		SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, bson.M{"status": "FINISHED"}, opts)
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

// GetUpcomingMatches returns the next 'limit' matches with status SCHEDULED, sorted by date asc
func (r *MatchRepository) GetUpcomingMatches(limit int) ([]models.Match, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Find().
		SetSort(bson.D{{Key: "date", Value: 1}}). // Earliest first
		SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, bson.M{"status": "SCHEDULED"}, opts)
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
