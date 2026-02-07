package services

import (
	"errors"

	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"github.com/Sanat-07/English-Premier-League/backend/internal/repositories"
	"github.com/Sanat-07/English-Premier-League/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo *repositories.UserRepository
}

func NewAuthService() *AuthService {
	return &AuthService{
		userRepo: repositories.NewUserRepository(),
	}
}

func (s *AuthService) Register(email, password, fullName string) (string, error) {
	// Check if user exists
	existingUser, err := s.userRepo.GetUserByEmail(email)
	if err == nil && existingUser.ID != "" {
		return "", errors.New("user already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	newUser := &models.User{
		Email:    email,
		Password: string(hashedPassword),
		FullName: fullName,
		Role:     "GUEST",
	}

	if err := s.userRepo.CreateUser(newUser); err != nil {
		return "", err
	}

	return utils.GenerateToken(newUser.ID, newUser.Email, newUser.Role)
}

func (s *AuthService) Login(email, password string) (string, *models.User, error) {
	user, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	return token, user, err
}

func (s *AuthService) GetUserFavorites(userID string) ([]string, []string, error) {
	user, err := s.userRepo.GetUserByID(userID)
	if err != nil {
		return nil, nil, err
	}

	var teamIDs []string
	for _, t := range user.FavoriteTeams {
		teamIDs = append(teamIDs, t.ID)
	}

	var playerIDs []string
	for _, p := range user.FavoritePlayers {
		playerIDs = append(playerIDs, p.ID)
	}

	return teamIDs, playerIDs, nil
}

func (s *AuthService) ToggleFavoriteTeam(userID, teamID string) error {
	return s.userRepo.ToggleFavoriteTeam(userID, teamID)
}

func (s *AuthService) ToggleFavoritePlayer(userID, playerID string) error {
	return s.userRepo.ToggleFavoritePlayer(userID, playerID)
}
