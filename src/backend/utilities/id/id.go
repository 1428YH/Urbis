package id

import (
	"math/rand"
	"time"
)

func Generate() int {
	rand.Seed(time.Now().UnixNano())
	id := []int{}

	for i := 0; i < 6; i++ {
		id = append(id, rand.Intn(100))
	}

	var result int 
	for _, num := range id {
		result = result*100 + num
	}

	return result
}