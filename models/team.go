package models

type Team struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	City        string `json:"city"`
	FoundedYear int    `json:"founded_year"`
	StadiumID   int    `json:"stadium_id"`
}
