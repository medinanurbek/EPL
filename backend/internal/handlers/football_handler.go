package handlers

import (
	"net/http"

	"github.com/Sanat-07/English-Premier-League/backend/internal/models"
	"github.com/Sanat-07/English-Premier-League/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type FootballHandler struct {
	service *services.FootballService
}

func NewFootballHandler() *FootballHandler {
	return &FootballHandler{
		service: services.NewFootballService(),
	}
}

func (h *FootballHandler) GetMatches(c *gin.Context) {
	matches, err := h.service.GetAllMatches()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, matches)
}

func (h *FootballHandler) GetStandings(c *gin.Context) {
	standings, err := h.service.GetStandings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, standings)
}

func (h *FootballHandler) GetTeams(c *gin.Context) {
	teams, err := h.service.GetAllTeams()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, teams)
}

func (h *FootballHandler) GetTeamByID(c *gin.Context) {
	id := c.Param("id")
	team, err := h.service.GetTeamByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}
	c.JSON(http.StatusOK, team)
}

func (h *FootballHandler) CreateMatch(c *gin.Context) {
	var match models.Match
	if err := c.ShouldBindJSON(&match); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.CreateMatch(&match); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, match)
}

func (h *FootballHandler) GetMatchByID(c *gin.Context) {
	id := c.Param("id")
	match, err := h.service.GetMatchByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}
	c.JSON(http.StatusOK, match)
}

func (h *FootballHandler) GetTeamSquad(c *gin.Context) {
	teamID := c.Param("id")
	players, err := h.service.GetTeamSquad(teamID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, players)
}

func (h *FootballHandler) GetPlayerByID(c *gin.Context) {
	playerID := c.Param("id")
	player, err := h.service.GetPlayerByID(playerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}
	c.JSON(http.StatusOK, player)
}
