package main

import (
	"assignment/handlers"
	"assignment/repositories"
	"assignment/services"
	"fmt"
	"net/http"
)

func main() {
	if err := repositories.Instance.Load(); err != nil {
		fmt.Printf("Warning: %v\n", err)
	}

	services.Instance.Start()

	http.HandleFunc("/matches", handlers.MatchHandler)
	http.HandleFunc("/standings", handlers.StandingHandler)
	http.HandleFunc("/teams", handlers.TeamHandler)
	http.HandleFunc("/teams/", handlers.TeamHandler)
	http.HandleFunc("/players", handlers.PlayerHandler)
	http.HandleFunc("/players/", handlers.PlayerHandler)

	fmt.Println("Server starting on :8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Printf("Error: %s\n", err)
	}
}
