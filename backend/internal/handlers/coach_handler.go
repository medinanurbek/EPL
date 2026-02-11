package handlers

import (
	"net/http"

	"github.com/Sanat-07/English-Premier-League/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type CoachHandler struct {
	service *services.CoachService
}

func NewCoachHandler(service *services.CoachService) *CoachHandler {
	return &CoachHandler{
		service: service,
	}
}

func (h *CoachHandler) AddCoach(c *gin.Context) {
	teamID := c.Param("id")
	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := h.service.AddCoach(teamID, input.Name); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Coach added successfully"})
}

func (h *CoachHandler) RemoveCoach(c *gin.Context) {
	teamID := c.Param("id")
	if err := h.service.RemoveCoach(teamID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Coach removed successfully"})
}

func (h *CoachHandler) ReplaceCoach(c *gin.Context) {
	teamID := c.Param("id")
	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := h.service.ReplaceCoach(teamID, input.Name); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Coach replaced successfully"})
}
