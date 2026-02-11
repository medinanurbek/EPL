package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

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
	fmt.Println("=== DEBUG GET MATCHES EXECUTED ===")
	matches, err := h.service.GetAllMatches()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	activeMatchday, err := h.service.GetActiveMatchday()
	if err != nil {
		// Log error but don't fail, default to 0
		fmt.Printf("Error getting active matchday: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"matches":        matches,
		"activeMatchday": activeMatchday,
	})
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
	matches, err := h.service.GetLatestResults()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch latest results"})
		return
	}
	c.JSON(http.StatusOK, matches)
}

func (h *FootballHandler) GetUpcomingFixtures(c *gin.Context) {
	matches, err := h.service.GetUpcomingFixtures()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch upcoming fixtures"})
		return
	}
	c.JSON(http.StatusOK, matches)
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

// --- Match Lifecycle ---

func (h *FootballHandler) StartMatch(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.StartMatch(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Match started, simulation running"})
}

func (h *FootballHandler) FinishMatch(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.FinishMatch(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Match finished, standings updated"})
}

// --- Event Management ---

func (h *FootballHandler) GetMatchEventsByID(c *gin.Context) {
	matchID := c.Param("id")
	events, err := h.service.GetGoalEventsByMatchID(matchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, events)
}

func (h *FootballHandler) EditGoalEvent(c *gin.Context) {
	matchID := c.Param("id")
	eventID := c.Param("eventId")

	var update map[string]interface{}
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.EditGoalEvent(matchID, eventID, update); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Event updated, score recalculated"})
}

func (h *FootballHandler) DeleteGoalEvent(c *gin.Context) {
	matchID := c.Param("id")
	eventID := c.Param("eventId")

	if err := h.service.DeleteGoalEvent(matchID, eventID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Event deleted, score recalculated"})
}

// --- Matchday ---

func (h *FootballHandler) GetMatchesByMatchday(c *gin.Context) {
	dayStr := c.Param("day")
	var day int
	if _, err := fmt.Sscanf(dayStr, "%d", &day); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid matchday"})
		return
	}
	matches, err := h.service.GetMatchesByMatchday(day)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, matches)
}

// --- Player CRUD ---

func (h *FootballHandler) CreatePlayer(c *gin.Context) {
	var player models.Player
	if err := c.ShouldBindJSON(&player); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if player.ID == "" {
		player.ID = fmt.Sprintf("p_%d", time.Now().UnixNano())
	}
	if err := h.service.CreatePlayer(&player); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, player)
}

func (h *FootballHandler) UpdatePlayer(c *gin.Context) {
	playerID := c.Param("id")
	var update map[string]interface{}
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.UpdatePlayer(playerID, update); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Player updated"})
}

func (h *FootballHandler) DeletePlayer(c *gin.Context) {
	playerID := c.Param("id")
	if err := h.service.DeletePlayer(playerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Player deleted"})
}

// --- Coach Management ---

func (h *FootballHandler) AddCoach(c *gin.Context) {
	teamID := c.Param("id")
	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.AddCoach(teamID, input.Name); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Coach added successfully"})
}

func (h *FootballHandler) RemoveCoach(c *gin.Context) {
	teamID := c.Param("id")
	if err := h.service.RemoveCoach(teamID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Coach removed successfully"})
}

func (h *FootballHandler) ReplaceCoach(c *gin.Context) {
	teamID := c.Param("id")
	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.ReplaceCoach(teamID, input.Name); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Coach replaced successfully"})
}
