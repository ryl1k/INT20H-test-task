package tax

import (
	"context"

	"github.com/ryl1k/NT20H-test-task-server/internal/entity"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
	"github.com/paulmach/orb/planar"
	"github.com/tidwall/rtree"
)

type Tax struct {
	features  []*geojson.Feature
	taxConfig map[string]entity.JurisdictionTax
	tree      rtree.RTreeG[int]
}

func New(features []*geojson.Feature, taxConfig map[string]entity.JurisdictionTax) *Tax {
	var tr rtree.RTreeG[int]

	for i, f := range features {
		if f.Geometry == nil {
			continue
		}
		bound := f.Geometry.Bound()
		tr.Insert([2]float64{bound.Min.X(), bound.Min.Y()}, [2]float64{bound.Max.X(), bound.Max.Y()}, i)
	}

	return &Tax{
		features:  features,
		taxConfig: taxConfig,
		tree:      tr,
	}
}

func (r *Tax) GetTaxByLocation(ctx context.Context, lat, lon float64) (*entity.JurisdictionTax, bool) {
	point := orb.Point{lon, lat}
	foundName := entity.UnknownName
	bestIdx := len(r.features)

	r.tree.Search([2]float64{point.X(), point.Y()}, [2]float64{point.X(), point.Y()},
		func(min, max [2]float64, featureIdx int) bool {
			if featureIdx >= bestIdx {
				return true
			}

			feature := r.features[featureIdx]
			multiPoly := entity.GetMultiPolygon(feature)
			if multiPoly == nil {
				return true
			}

			if planar.MultiPolygonContains(multiPoly, point) {
				bestIdx = featureIdx
				foundName = feature.Properties.MustString(entity.NamePropertyKey, entity.UnknownName)
			}
			return true
		},
	)

	tax, ok := r.taxConfig[foundName]
	if !ok {
		return nil, false
	}

	return &tax, true
}
