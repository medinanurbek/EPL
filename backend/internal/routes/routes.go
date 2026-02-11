package routes

import (
	"github.com/Sanat-07/English-Premier-League/backend/internal/handlers"
	"github.com/Sanat-07/English-Premier-League/backend/internal/middleware"
	"github.com/Sanat-07/English-Premier-League/backend/internal/repositories"
	"github.com/Sanat-07/English-Premier-League/backend/internal/services"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")

	// Middleware
	api.Use(middleware.CORSMiddleware())

	// Auth Routes
	authHandler := handlers.NewAuthHandler()
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Handlers
	footballHandler := handlers.NewFootballHandler()

	// Repositories for specialized services
	teamRepo := repositories.NewTeamRepository()
	matchRepo := repositories.NewMatchRepository()

	// Coach
	coachService := services.NewCoachService(teamRepo)
	coachHandler := handlers.NewCoachHandler(coachService)

	// Stats
	statsService := services.NewStatsService(matchRepo)
	statsHandler := handlers.NewStatsHandler(statsService)

	// Public Routes
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	api.GET("/matches", footballHandler.GetMatches)
	api.GET("/matches/:id", footballHandler.GetMatchByID)
	api.GET("/standings", footballHandler.GetStandings)
	api.GET("/teams", footballHandler.GetTeams)
	api.GET("/teams/:id", footballHandler.GetTeamByID)
	api.GET("/teams/:id/matches", footballHandler.GetTeamMatches)
	api.GET("/teams/:id/squad", footballHandler.GetTeamSquad)
	api.GET("/players", footballHandler.GetPlayers)
	api.GET("/players/:id", footballHandler.GetPlayerByID)
	api.GET("/matches/results-json", footballHandler.GetResultsJSON)
	api.GET("/matches/next-json", footballHandler.GetNextMatchesJSON)
	api.GET("/matches/latest", footballHandler.GetLatestResults)
	api.GET("/matches/upcoming", footballHandler.GetUpcomingFixtures)
	api.GET("/matches/matchday/:day", footballHandler.GetMatchesByMatchday)

	// Stats endpoints
	statsGroup := api.Group("/stats")
	{
		statsGroup.GET("/", statsHandler.GetStats)
		statsGroup.GET("/top-scorers", statsHandler.GetTopScorers)
		statsGroup.GET("/top-assists", statsHandler.GetTopAssists)
		statsGroup.GET("/clean-sheets", statsHandler.GetCleanSheets)
	}
	api.GET("/matches/:id/events", statsHandler.GetMatchEvents)
	api.GET("/matches/:id/live-events", footballHandler.GetMatchEventsByID)

	// Protected Routes (User)
	userGroup := api.Group("/user")
	userGroup.Use(middleware.AuthMiddleware())
	{
		userGroup.GET("/favorites", authHandler.GetFavorites)
		userGroup.POST("/favorites/teams/:id", authHandler.ToggleFavoriteTeam)
		userGroup.POST("/favorites/players/:id", authHandler.ToggleFavoritePlayer)
	}

	// Admin Routes
	admin := api.Group("/")
	admin.Use(middleware.AdminMiddleware())
	{
		// Match management
		admin.POST("/matches", footballHandler.CreateMatch)
		admin.PATCH("/matches/:id/status", footballHandler.UpdateMatchStatus)
		admin.PATCH("/matches/:id/start", footballHandler.StartMatch)
		admin.PATCH("/matches/:id/finish", footballHandler.FinishMatch)

		// Event management (error correction)
		admin.PUT("/matches/:id/events/:eventId", footballHandler.EditGoalEvent)
		admin.DELETE("/matches/:id/events/:eventId", footballHandler.DeleteGoalEvent)

		// Player management
		admin.POST("/players", footballHandler.CreatePlayer)
		admin.PUT("/players/:id", footballHandler.UpdatePlayer)
		admin.DELETE("/players/:id", footballHandler.DeletePlayer)

		// Review management
		admin.DELETE("/reviews/:id", handlers.NewReviewHandler().DeleteReview)

		// Coach management
		admin.POST("/teams/:id/coach", coachHandler.AddCoach)
		admin.DELETE("/teams/:id/coach", coachHandler.RemoveCoach)
		admin.PUT("/teams/:id/coach/replace", coachHandler.ReplaceCoach)
	}

	// Review Routes
	reviewHandler := handlers.NewReviewHandler()
	api.GET("/reviews", reviewHandler.GetReviews)

	reviewProtected := api.Group("/reviews")
	reviewProtected.Use(middleware.AuthMiddleware())
	{
		reviewProtected.POST("/", reviewHandler.CreateReview)
	}
}
