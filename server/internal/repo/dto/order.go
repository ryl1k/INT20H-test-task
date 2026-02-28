package dto

import "time"

type Order struct {
	Id        int       `json:"id"`
	Longitude float64   `json:"longitude"`
	Latitude  float64   `json:"latitude"`
	Timestamp time.Time `json:"timestamp" validate:"required"`
	Subtotal  float64   `json:"subtotal"`
}

type OrderFilters struct {
	Limit  int
	Offset int

	Status        string
	ReportingCode string

	TotalAmountMin *float64
	TotalAmountMax *float64
	FromDate       *time.Time
	ToDate         *time.Time

	SortBy    string
	SortOrder string
}
