package models

type Match struct {
	ID         int    `json:"id"`
	SeasonID   int    `json:"season_id"`
	Matchweek  int    `json:"matchweek"`
	HomeTeamID int    `json:"home_team_id"`
	AwayTeamID int    `json:"away_team_id"`
	MatchDate  string `json:"match_date"`
	StadiumID  int    `json:"stadium_id"`
	Status     string `json:"status"`
	HomeGoals  int    `json:"home_goals"`
	AwayGoals  int    `json:"away_goals"`
}

type MatchResponse struct {
	ID           int    `json:"id"`
	HomeTeamName string `json:"home_team_name"`
	AwayTeamName string `json:"away_team_name"`
	HomeGoals    int    `json:"home_goals"`
	AwayGoals    int    `json:"away_goals"`
}
