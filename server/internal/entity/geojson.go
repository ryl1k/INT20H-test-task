package entity

import (
	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
)

type GeoJSON struct {
	Features []*geojson.Feature `json:"features"`
}

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
