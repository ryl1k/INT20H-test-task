package dto

import "time"

type Order struct {
	Id        int       `json:"id"`
	Longitude float64   `json:"longitude" validate:"required"`
	Latitude  float64   `json:"latitude" validate:"required"`
	Timestamp time.Time `json:"timestamp" validate:"required"`
	Subtotal  float64   `json:"subtotal" validate:"required"`
}
