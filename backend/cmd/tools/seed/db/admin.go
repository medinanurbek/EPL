package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func CreateAdmin(ctx context.Context, col *mongo.Collection) {
	adminEmail := "admin@epl.com"
	var existing models.User
	err := col.FindOne(ctx, bson.M{"email": adminEmail}).Decode(&existing)
	if err == nil {
		fmt.Printf("Admin user %s already exists\n", adminEmail)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	admin := models.User{
		ID:        primitive.NewObjectID(),
		Email:     adminEmail,
		Password:  string(hashedPassword),
		Role:      "admin",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = col.InsertOne(ctx, admin)
	if err != nil {
		log.Printf("Failed to create admin: %v", err)
	} else {
		fmt.Printf("Created admin user: %s (password: admin123)\n", adminEmail)
	}
}
