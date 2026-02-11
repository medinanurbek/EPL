package handlers

import (
	"fmt"
	"net/http"

	"github.com/Sanat-07/English-Premier-League/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type StatsHandler struct {
	service *services.StatsService
}

func NewStatsHandler(service *services.StatsService) *StatsHandler {
	return &StatsHandler{
		service: service,
	}
}

func (h *StatsHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *StatsHandler) GetMatchEvents(c *gin.Context) {
	idStr := c.Param("id")
	var matchIndex int
	if _, err := fmt.Sscanf(idStr, "%d", &matchIndex); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid match index"})
		return
	}
	events, err := h.service.GetMatchGoalEvents(matchIndex)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, events)
}

func (h *StatsHandler) GetTopScorers(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats.TopScorers)
}

func (h *StatsHandler) GetTopAssists(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats.TopAssists)
}

func (h *StatsHandler) GetCleanSheets(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats.CleanSheets)
}
