package utils

import (
	"errors"
	"time"

	"github.com/Sanat-07/English-Premier-League/backend/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(userID string, email string, role string) (string, error) {
	cfg := config.LoadConfig()
	claims := jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"role":  role,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWTSecret))
}

func ValidateToken(tokenString string) (*jwt.Token, error) {
	cfg := config.LoadConfig()
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(cfg.JWTSecret), nil
	})
}
