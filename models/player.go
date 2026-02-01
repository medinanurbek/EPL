package models

type Player struct {
	ID          int    `json:"id"`
	TeamID      int    `json:"team_id"`
	FullName    string `json:"full_name"`
	Position    string `json:"position"`
	Number      int    `json:"number"`
	Nationality string `json:"nationality"`
}
