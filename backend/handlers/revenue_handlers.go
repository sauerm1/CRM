package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// RevenueDataPoint represents revenue for a specific time period
type RevenueDataPoint struct {
	Date           string  `json:"date"`
	Revenue        float64 `json:"revenue"`
	BookingRevenue float64 `json:"booking_revenue"`
	BillingRevenue float64 `json:"billing_revenue"`
	Count          int     `json:"count"`
}

// RevenueAnalyticsResponse contains the aggregated revenue data
type RevenueAnalyticsResponse struct {
	Data         []RevenueDataPoint `json:"data"`
	TotalRevenue float64            `json:"total_revenue"`
	Period       string             `json:"period"`
	StartDate    string             `json:"start_date"`
	EndDate      string             `json:"end_date"`
}

// GetRevenueAnalytics returns revenue data aggregated by day or month
func GetRevenueAnalytics(bookingsCollection *mongo.Collection, membersCollection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get query parameters
		startDateStr := r.URL.Query().Get("start_date")
		endDateStr := r.URL.Query().Get("end_date")
		groupBy := r.URL.Query().Get("group_by") // "day" or "month"

		// Default to last 30 days if not specified
		endDate := time.Now()
		startDate := endDate.AddDate(0, 0, -30)

		if startDateStr != "" {
			if parsed, err := time.Parse("2006-01-02", startDateStr); err == nil {
				startDate = parsed
			}
		}
		if endDateStr != "" {
			if parsed, err := time.Parse("2006-01-02", endDateStr); err == nil {
				endDate = parsed
			}
		}

		// Default to day grouping
		if groupBy == "" {
			groupBy = "day"
		}

		// Fetch office bookings within date range
		bookingFilter := bson.M{
			"start_time": bson.M{
				"$gte": startDate,
				"$lte": endDate,
			},
			"status": bson.M{"$in": []string{"confirmed", "completed"}},
		}

		cursor, err := bookingsCollection.Find(context.Background(), bookingFilter)
		if err != nil {
			http.Error(w, "Failed to fetch bookings", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.Background())

		// Aggregate bookings by date
		bookingsByDate := make(map[string]float64)
		for cursor.Next(context.Background()) {
			var booking struct {
				StartTime time.Time `bson:"start_time"`
				TotalCost float64   `bson:"total_cost"`
			}
			if err := cursor.Decode(&booking); err != nil {
				continue
			}

			dateKey := formatDateKey(booking.StartTime, groupBy)
			bookingsByDate[dateKey] += booking.TotalCost
		}

		// Fetch member billing entries within date range
		memberCursor, err := membersCollection.Find(context.Background(), bson.M{})
		if err != nil {
			http.Error(w, "Failed to fetch members", http.StatusInternalServerError)
			return
		}
		defer memberCursor.Close(context.Background())

		billingsByDate := make(map[string]float64)
		for memberCursor.Next(context.Background()) {
			var member struct {
				BillingHistory []struct {
					Date   time.Time `bson:"date"`
					Amount float64   `bson:"amount"`
					Status string    `bson:"status"`
				} `bson:"billing_history"`
			}
			if err := memberCursor.Decode(&member); err != nil {
				continue
			}

			for _, billing := range member.BillingHistory {
				if billing.Date.Before(startDate) || billing.Date.After(endDate) {
					continue
				}
				if billing.Status != "paid" {
					continue
				}

				dateKey := formatDateKey(billing.Date, groupBy)
				billingsByDate[dateKey] += billing.Amount
			}
		}

		// Combine data and generate time series
		dataPoints := generateTimeSeries(startDate, endDate, groupBy, bookingsByDate, billingsByDate)

		// Calculate total revenue
		var totalRevenue float64
		for _, dp := range dataPoints {
			totalRevenue += dp.Revenue
		}

		response := RevenueAnalyticsResponse{
			Data:         dataPoints,
			TotalRevenue: totalRevenue,
			Period:       groupBy,
			StartDate:    startDate.Format("2006-01-02"),
			EndDate:      endDate.Format("2006-01-02"),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

// formatDateKey formats a date according to the grouping (day or month)
func formatDateKey(t time.Time, groupBy string) string {
	if groupBy == "month" {
		return t.Format("2006-01")
	}
	return t.Format("2006-01-02")
}

// generateTimeSeries creates a complete time series with all dates, filling in zeros for missing data
func generateTimeSeries(startDate, endDate time.Time, groupBy string, bookings, billings map[string]float64) []RevenueDataPoint {
	var dataPoints []RevenueDataPoint
	current := startDate

	for !current.After(endDate) {
		dateKey := formatDateKey(current, groupBy)
		bookingRev := bookings[dateKey]
		billingRev := billings[dateKey]

		dataPoints = append(dataPoints, RevenueDataPoint{
			Date:           dateKey,
			Revenue:        bookingRev + billingRev,
			BookingRevenue: bookingRev,
			BillingRevenue: billingRev,
			Count:          0, // Can be extended to count transactions
		})

		// Increment by day or month
		if groupBy == "month" {
			current = current.AddDate(0, 1, 0)
		} else {
			current = current.AddDate(0, 0, 1)
		}
	}

	return dataPoints
}
