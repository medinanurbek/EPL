package models

type Standing struct {
	ID       int `json:"id"`
	SeasonID int `json:"season_id"`
	TeamID   int `json:"team_id"`
	Played   int `json:"played"`
	Wins     int `json:"wins"`
	Draws    int `json:"draws"`
	Losses   int `json:"losses"`
	GF       int `json:"gf"`
	GA       int `json:"ga"`
	GD       int `json:"gd"`
	Points   int `json:"points"`
}
