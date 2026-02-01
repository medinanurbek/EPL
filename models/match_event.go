package models

type MatchEvent struct {
	ID        int    `json:"id"`
	MatchID   int    `json:"match_id"`
	Minute    int    `json:"minute"`
	TeamID    int    `json:"team_id"`
	PlayerID  int    `json:"player_id"`
	EventType string `json:"event_type"`
	Details   string `json:"details"`
}
