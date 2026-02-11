package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

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

func (h *FootballHandler) GetTeamMatches(c *gin.Context) {
	id := c.Param("id")
	matches, err := h.service.GetTeamMatches(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Matches not found"})
		return
	}
	c.JSON(http.StatusOK, matches)
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

func (h *FootballHandler) UpdateMatchStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status models.MatchStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateMatchStatus(id, req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Match status updated"})
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

func (h *FootballHandler) GetPlayers(c *gin.Context) {
	players, err := h.service.GetAllPlayers()
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

func (h *FootballHandler) GetResultsJSON(c *gin.Context) {
	c.File("../results.json")
}

func (h *FootballHandler) GetNextMatchesJSON(c *gin.Context) {
	c.File("../next_matches.json")
}

// Helper struct for parsing JSON files locally
type MatchJSON struct {
	Matchday      int    `json:"matchday"`
	Date          string `json:"date"`
	Time          string `json:"time"`
	HomeTeam      string `json:"homeTeam"`
	AwayTeam      string `json:"awayTeam"`
	HomeScore     int    `json:"homeScore"`
	AwayScore     int    `json:"awayScore"`
	HalfTimeScore string `json:"halfTimeScore"`
}

func (h *FootballHandler) GetLatestResults(c *gin.Context) {
	matches, err := readMatchesFromFile("../results.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read results"})
		return
	}

	// Get last 2 matches
	count := len(matches)
	if count == 0 {
		c.JSON(http.StatusOK, []MatchJSON{})
		return
	}

	var latest []MatchJSON
	if count >= 2 {
		latest = matches[count-2:]
	} else {
		latest = matches
	}

	// Reverse to show most recent first
	for i, j := 0, len(latest)-1; i < j; i, j = i+1, j-1 {
		latest[i], latest[j] = latest[j], latest[i]
	}

	c.JSON(http.StatusOK, latest)
}

func (h *FootballHandler) GetUpcomingFixtures(c *gin.Context) {
	matches, err := readMatchesFromFile("../next_matches.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read fixtures"})
		return
	}

	// Get first 3 matches
	var upcoming []MatchJSON
	if len(matches) >= 3 {
		upcoming = matches[:3]
	} else {
		upcoming = matches
	}

	c.JSON(http.StatusOK, upcoming)
}

func readMatchesFromFile(filename string) ([]MatchJSON, error) {
	var matches []MatchJSON

	bytes, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(bytes, &matches); err != nil {
		return nil, err
	}

	return matches, nil
}

func (h *FootballHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *FootballHandler) GetMatchEvents(c *gin.Context) {
	idStr := c.Param("id")
	// Parse match index from the id
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
