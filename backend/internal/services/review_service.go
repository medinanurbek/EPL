package services

import (
	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"github.com/Sanat-07/English-Premier-League/backend/internal/repositories"
)

type ReviewService struct {
	reviewRepo *repositories.ReviewRepository
	userRepo   *repositories.UserRepository
}

func NewReviewService() *ReviewService {
	return &ReviewService{
		reviewRepo: repositories.NewReviewRepository(),
		userRepo:   repositories.NewUserRepository(),
	}
}

func (s *ReviewService) CreateReview(email, content string, rating int, matchID, teamID, playerID string) error {
	user, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		return err
	}

	review := &models.Review{
		UserID:   user.ID.Hex(),
		UserName: user.FullName,
		Content:  content,
		Rating:   rating,
		MatchID:  matchID,
		TeamID:   teamID,
		PlayerID: playerID,
	}

	return s.reviewRepo.Create(review)
}

func (s *ReviewService) GetAllReviews() ([]models.Review, error) {
	return s.reviewRepo.FindAll()
}

func (s *ReviewService) DeleteReview(id string) error {
	return s.reviewRepo.Delete(id)
}
