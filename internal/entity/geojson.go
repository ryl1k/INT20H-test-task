package entity

import (
	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
)

// GeoJSON represents a simplified GeoJSON structure
// containing a collection of geographic features.
// It is typically used as an input container
// for jurisdiction boundary definitions.
type GeoJSON struct {
	Features []*geojson.Feature `json:"features"`
}

// GetMultiPolygon extracts an orb.MultiPolygon from a GeoJSON feature.
// This helper ensures consistent geometry handling
// for spatial operations such as point-in-polygon checks.
func GetMultiPolygon(f *geojson.Feature) orb.MultiPolygon {
	if f.Geometry == nil {
		return nil
	}

	if mp, ok := f.Geometry.(orb.MultiPolygon); ok {
		return mp
	}

	if p, ok := f.Geometry.(orb.Polygon); ok {
		return orb.MultiPolygon{p}
	}

	return nil
}
