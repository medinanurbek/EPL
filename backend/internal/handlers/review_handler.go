package handlers

import (
	"net/http"

	"github.com/Sanat-07/English-Premier-League/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviewService *services.ReviewService
}

func NewReviewHandler() *ReviewHandler {
	return &ReviewHandler{
		reviewService: services.NewReviewService(),
	}
}

type CreateReviewRequest struct {
	Content  string `json:"content" binding:"required"`
	Rating   int    `json:"rating" binding:"required,min=1,max=5"`
	MatchID  string `json:"matchId"`
	TeamID   string `json:"teamId"`
	PlayerID string `json:"playerId"`
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {
	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	email, _ := c.Get("email") // Injected by AuthMiddleware
	err := h.reviewService.CreateReview(email.(string), req.Content, req.Rating, req.MatchID, req.TeamID, req.PlayerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review submitted successfully"})
}

func (h *ReviewHandler) GetReviews(c *gin.Context) {
	reviews, err := h.reviewService.GetAllReviews()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	id := c.Param("id")
	if err := h.reviewService.DeleteReview(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}
