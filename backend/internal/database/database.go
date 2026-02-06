package database

import (
	"fmt"
	"log"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB(cfg *config.Config) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection established")

	// AutoMigrate
	log.Println("Running migrations...")
	err = DB.AutoMigrate(
		&models.User{},
		&models.Team{},
		&models.Player{},
		&models.Season{},
		&models.Match{},
		&models.MatchEvent{},
		&models.Standing{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migration completed")
}
