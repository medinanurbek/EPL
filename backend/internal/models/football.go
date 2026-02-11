package models

import (
	"time"
)

type Team struct {
	ID        string   `bson:"_id" json:"id"`
	Name      string   `bson:"name" json:"name"`
	ShortName string   `bson:"shortName" json:"shortName"`
	City      string   `bson:"city" json:"city"`
	Stadium   string   `bson:"stadium" json:"stadium"`
	Coach     string   `bson:"coach,omitempty" json:"coach,omitempty"`
	LogoURL   string   `bson:"logoUrl" json:"logoUrl"`
	Players   []Player `bson:"players,omitempty" json:"players,omitempty"`
}

type Player struct {
	ID               string      `bson:"_id" json:"id"`
	TeamID           string      `bson:"teamId" json:"teamId"`
	Name             string      `bson:"name" json:"name"`
	CommonName       string      `bson:"commonName" json:"commonName"`
	FirstName        string      `bson:"firstName" json:"firstName"`
	LastName         string      `bson:"lastName" json:"lastName"`
	DisplayName      string      `bson:"displayName" json:"displayName"`
	Position         string      `bson:"position" json:"position"`
	DetailedPosition string      `bson:"detailedPosition" json:"detailedPosition"`
	Nationality      string      `bson:"nationality" json:"nationality"`
	NationalityCode  string      `bson:"nationalityCode" json:"nationalityCode"`
	NationalityISO2  string      `bson:"nationalityISO2" json:"nationalityISO2"`
	Number           int         `bson:"number" json:"number"`
	Height           int         `bson:"height" json:"height"`
	Weight           int         `bson:"weight" json:"weight"`
	DateOfBirth      string      `bson:"dateOfBirth" json:"dateOfBirth"`
	ImagePath        string      `bson:"imagePath" json:"imagePath"`
	IsCaptain        bool        `bson:"isCaptain" json:"isCaptain"`
	Statistics       PlayerStats `bson:"statistics,omitempty" json:"statistics,omitempty"`
}

type PlayerStats struct {
	Goals       int `bson:"goals" json:"goals"`
	Assists     int `bson:"assists" json:"assists"`
	CleanSheets int `bson:"cleanSheets" json:"cleanSheets"`
}

type MatchStatus string

const (
	MatchScheduled MatchStatus = "SCHEDULED"
	MatchFinished  MatchStatus = "FINISHED"
	MatchLive      MatchStatus = "LIVE"
)

type Match struct {
	ID         string       `bson:"_id" json:"id"`
	HomeTeamID string       `bson:"homeTeamId" json:"homeTeamId"`
	AwayTeamID string       `bson:"awayTeamId" json:"awayTeamId"`
	HomeTeam   Team         `bson:"homeTeam,omitempty" json:"homeTeam,omitempty"`
	AwayTeam   Team         `bson:"awayTeam,omitempty" json:"awayTeam,omitempty"`
	HomeScore  int          `bson:"homeScore" json:"homeScore"`
	AwayScore  int          `bson:"awayScore" json:"awayScore"`
	Date       time.Time    `bson:"date" json:"date"`
	Matchday   int          `bson:"matchday" json:"matchday"`
	Status     MatchStatus  `bson:"status" json:"status"`
	SeasonID   string       `bson:"seasonId" json:"seasonId"`
	Events     []MatchEvent `bson:"events,omitempty" json:"events,omitempty"`
}

type EventType string

const (
	Goal         EventType = "GOAL"
	YellowCard   EventType = "YELLOW_CARD"
	RedCard      EventType = "RED_CARD"
	Substitution EventType = "SUBSTITUTION"
)

type MatchEvent struct {
	ID       string    `bson:"_id" json:"id"`
	MatchID  string    `bson:"matchId" json:"matchId"`
	PlayerID string    `bson:"playerId" json:"playerId"`
	Type     EventType `bson:"type" json:"type"`
	Minute   int       `bson:"minute" json:"minute"`
}

type GoalEvent struct {
	ID         string `bson:"_id" json:"id"`
	MatchID    string `bson:"matchId" json:"matchId"`
	MatchIndex int    `bson:"matchIndex" json:"matchIndex"`
	Matchday   int    `bson:"matchday" json:"matchday"`
	HomeTeam   string `bson:"homeTeam" json:"homeTeam"`
	AwayTeam   string `bson:"awayTeam" json:"awayTeam"`
	ScorerID   string `bson:"scorerId" json:"scorerId"`
	ScorerName string `bson:"scorerName" json:"scorerName"`
	AssistID   string `bson:"assistId,omitempty" json:"assistId,omitempty"`
	AssistName string `bson:"assistName,omitempty" json:"assistName,omitempty"`
	TeamName   string `bson:"teamName" json:"teamName"`
	TeamID     string `bson:"teamId" json:"teamId"`
	Minute     int    `bson:"minute" json:"minute"`
	IsHomeGoal bool   `bson:"isHomeGoal" json:"isHomeGoal"`
}

type Season struct {
	ID       string `bson:"_id" json:"id"`
	Year     string `bson:"year" json:"year"`
	IsActive bool   `bson:"isActive" json:"isActive"`
}

type Standing struct {
	TeamID           string   `bson:"_id" json:"teamId"`
	Team             Team     `bson:"team,omitempty" json:"team,omitempty"`
	Played           int      `bson:"played" json:"played"`
	Wins             int      `bson:"wins" json:"wins"`
	Draws            int      `bson:"draws" json:"draws"`
	Losses           int      `bson:"losses" json:"losses"`
	Points           int      `bson:"points" json:"points"`
	GoalsFor         int      `bson:"goalsFor" json:"goalsFor"`
	GoalsAgainst     int      `bson:"goalsAgainst" json:"goalsAgainst"`
	GoalDifference   int      `bson:"goalDifference" json:"goalDifference"`
	NextOpponent     string   `bson:"nextOpponent" json:"nextOpponent"`
	NextOpponentLogo string   `bson:"nextOpponentLogo" json:"nextOpponentLogo"`
	Form             []string `bson:"form" json:"form"`
	Position         int      `bson:"position" json:"position"`
}
