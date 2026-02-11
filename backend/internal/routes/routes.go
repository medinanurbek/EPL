package routes

import (
	"github.com/Sanat-07/English-Premier-League/backend/internal/handlers"
	"github.com/Sanat-07/English-Premier-League/backend/internal/middleware"
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

	// Football Routes
	footballHandler := handlers.NewFootballHandler()

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
	api.GET("/stats", footballHandler.GetStats)
	api.GET("/matches/:id/events", footballHandler.GetMatchEvents)

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
		admin.POST("/matches", footballHandler.CreateMatch)
		admin.PATCH("/matches/:id/status", footballHandler.UpdateMatchStatus)
		admin.DELETE("/reviews/:id", handlers.NewReviewHandler().DeleteReview)
	}

	// Review Routes (Public/Protected mixed)
	reviewHandler := handlers.NewReviewHandler()
	api.GET("/reviews", reviewHandler.GetReviews)

	reviewProtected := api.Group("/reviews")
	reviewProtected.Use(middleware.AuthMiddleware())
	{
		reviewProtected.POST("/", reviewHandler.CreateReview)
	}
}
