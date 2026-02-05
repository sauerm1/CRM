package main

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	ctx := context.Background()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	db := client.Database("goapi")
	collections, err := db.ListCollectionNames(ctx, struct{}{})
	if err != nil {
		log.Fatal(err)
	}

	for _, coll := range collections {
		if coll != "users" {
			fmt.Printf("Dropping collection: %s\n", coll)
			err := db.Collection(coll).Drop(ctx)
			if err != nil {
				log.Printf("Failed to drop %s: %v\n", coll, err)
			}
		}
	}

	fmt.Println("Done. All collections except 'users' have been dropped.")
}
