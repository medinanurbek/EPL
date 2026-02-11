package main

import (
	"context"
	"log"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/database"
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func CreateAdmin() {
	email := "admin@epl.com"
	password := "admin123"
	fullName := "System Admin"

	// Check if exists
	var existing models.User
	err := database.DB.Collection("users").FindOne(context.Background(), bson.M{"email": email}).Decode(&existing)
	if err == nil {
		log.Println("Admin user already exists")
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	newUser := &models.User{
		ID:        primitive.NewObjectID(),
		Email:     email,
		Password:  string(hashedPassword),
		FullName:  fullName,
		Role:      "ADMIN",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = database.DB.Collection("users").InsertOne(context.Background(), newUser)
	if err != nil {
		log.Printf("Failed to create admin: %v", err)
		return
	}

	log.Printf("Admin created successfully!\nEmail: %s\nPassword: %s\n", email, password)
}
