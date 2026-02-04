package main

import (
	"context"
	"log"
	"time"

	"go-api-mongo/database"
	"go-api-mongo/models"
)

func main() {
	// Connect to MongoDB
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer db.Disconnect()

	log.Println("🌱 Seeding database with mock data...")

	// Clear existing items
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = db.Collection.DeleteMany(ctx, map[string]interface{}{})
	if err != nil {
		log.Printf("Warning: Could not clear existing items: %v\n", err)
	} else {
		log.Println("✓ Cleared existing items")
	}

	// Sample items to insert
	items := []interface{}{
		models.Item{
			Name:        "Laptop",
			Description: "High-performance laptop for development",
			Price:       1299.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Item{
			Name:        "Wireless Mouse",
			Description: "Ergonomic wireless mouse with precision tracking",
			Price:       29.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Item{
			Name:        "Mechanical Keyboard",
			Description: "RGB mechanical keyboard with Cherry MX switches",
			Price:       149.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Item{
			Name:        "USB-C Hub",
			Description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
			Price:       49.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Item{
			Name:        "Monitor",
			Description: "27-inch 4K monitor with HDR support",
			Price:       399.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Item{
			Name:        "Headphones",
			Description: "Noise-cancelling wireless headphones",
			Price:       249.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Item{
			Name:        "Webcam",
			Description: "1080p HD webcam with auto-focus",
			Price:       79.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Item{
			Name:        "Standing Desk",
			Description: "Electric standing desk with memory presets",
			Price:       599.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Item{
			Name:        "Desk Lamp",
			Description: "LED desk lamp with adjustable brightness",
			Price:       39.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Item{
			Name:        "External SSD",
			Description: "1TB portable SSD with USB-C connection",
			Price:       129.99,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	// Insert items
	result, err := db.Collection.InsertMany(ctx, items)
	if err != nil {
		log.Fatal("Failed to insert items:", err)
	}

	log.Printf("✓ Successfully inserted %d items\n", len(result.InsertedIDs))
	log.Println("🎉 Database seeding complete!")
	log.Println("\nYou can view the items at: http://localhost:8080/api/items")
}
