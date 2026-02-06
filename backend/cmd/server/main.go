package main

import (
	"log"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load Config
	cfg := config.LoadConfig()

	// Connect to Database
	database.ConnectDB(cfg)

	// Setup Router
	r := gin.Default()

	// Setup Routes
	routes.SetupRoutes(r)

	// Start Server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
