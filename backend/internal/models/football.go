package models

import (
	"time"
)

type Team struct {
	ID        string   `gorm:"primaryKey" json:"id"` // external API ID or UUID
	Name      string   `gorm:"not null" json:"name"`
	ShortName string   `json:"shortName"`
	City      string   `json:"city"`
	Stadium   string   `json:"stadium"`
	LogoURL   string   `json:"logoUrl"`
	Players   []Player `gorm:"foreignKey:TeamID" json:"players,omitempty"`
}

type Player struct {
	ID               string `gorm:"primaryKey" json:"id"`
	TeamID           string `gorm:"index" json:"teamId"`
	Name             string `gorm:"not null" json:"name"`
	CommonName       string `json:"commonName"`
	FirstName        string `json:"firstName"`
	LastName         string `json:"lastName"`
	DisplayName      string `json:"displayName"`
	Position         string `json:"position"` // Goalkeeper, Defender, Midfielder, Forward
	DetailedPosition string `json:"detailedPosition"`
	Nationality      string `json:"nationality"`
	NationalityCode  string `json:"nationalityCode"`
	Number           int    `json:"number"`
	Height           int    `json:"height"` // in cm
	Weight           int    `json:"weight"` // in kg
	DateOfBirth      string `json:"dateOfBirth"`
	ImagePath        string `json:"imagePath"`
	IsCaptain        bool   `json:"isCaptain"`
	// Statistics stored as JSONB - nullable
	Statistics *string `gorm:"type:jsonb" json:"statistics,omitempty"`
}

type MatchStatus string

const (
	MatchScheduled MatchStatus = "SCHEDULED"
	MatchFinished  MatchStatus = "FINISHED"
	MatchLive      MatchStatus = "LIVE"
)

type Match struct {
	ID         string       `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	HomeTeamID string       `gorm:"index" json:"homeTeamId"`
	AwayTeamID string       `gorm:"index" json:"awayTeamId"`
	HomeTeam   Team         `gorm:"foreignKey:HomeTeamID" json:"homeTeam,omitempty"`
	AwayTeam   Team         `gorm:"foreignKey:AwayTeamID" json:"awayTeam,omitempty"`
	HomeScore  int          `json:"homeScore"`
	AwayScore  int          `json:"awayScore"`
	Date       time.Time    `json:"date"`
	Status     MatchStatus  `json:"status"`
	SeasonID   string       `json:"seasonId"`
	Events     []MatchEvent `gorm:"foreignKey:MatchID" json:"events,omitempty"`
}

type EventType string

const (
	Goal         EventType = "GOAL"
	YellowCard   EventType = "YELLOW_CARD"
	RedCard      EventType = "RED_CARD"
	Substitution EventType = "SUBSTITUTION"
)

type MatchEvent struct {
	ID       string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	MatchID  string    `gorm:"index" json:"matchId"`
	PlayerID string    `gorm:"index" json:"playerId"`
	Type     EventType `json:"type"`
	Minute   int       `json:"minute"`
}

type Season struct {
	ID       string `gorm:"primaryKey" json:"id"`
	Year     string `json:"year"`
	IsActive bool   `json:"isActive"`
}

type Standing struct {
	TeamID           string   `gorm:"primaryKey" json:"teamId"`
	Team             Team     `gorm:"foreignKey:TeamID" json:"team,omitempty"`
	Played           int      `json:"played"`
	Wins             int      `json:"wins"`
	Draws            int      `json:"draws"`
	Losses           int      `json:"losses"`
	Points           int      `json:"points"`
	GoalsFor         int      `json:"goalsFor"`
	GoalsAgainst     int      `json:"goalsAgainst"`
	GoalDifference   int      `json:"goalDifference"`
	NextOpponent     string   `gorm:"-" json:"nextOpponent"`
	NextOpponentLogo string   `gorm:"-" json:"nextOpponentLogo"`
	Form             []string `gorm:"-" json:"form"`
	Position         int      `gorm:"-" json:"position"`
}
