package tax

import (
	"context"

	"github.com/ryl1k/INT20H-test-task-server/internal/entity"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
	"github.com/paulmach/orb/planar"
	"github.com/tidwall/rtree"
)

// Tax implements geospatial tax lookup logic.
// It determines jurisdiction tax data based on geographic coordinates.
// The implementation uses an R-tree spatial index for efficient
// bounding box filtering before performing precise polygon checks.
type Tax struct {
	// features contains all geojson features representing
	// jurisdiction geometries (polygons or multipolygons).
	features []*geojson.Feature

	// taxConfig maps jurisdiction names to their corresponding tax configuration.
	// The key must match the name stored in feature properties.
	taxConfig map[string]entity.JurisdictionTax

	// tree is an R-tree spatial index used to quickly narrow down
	// candidate geometries by bounding box intersection.
	tree rtree.RTreeG[int]
}

// New constructs a Tax service instance.
// It builds an R-tree index from provided geojson features
// by inserting their bounding boxes for efficient spatial search.
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

// GetTaxByLocation determines tax configuration by geographic coordinates.
// It performs the following steps:
// 1. Creates a point from longitude and latitude.
// 2. Searches the R-tree for candidate geometries whose bounding boxes contain the point.
// 3. Performs an exact point-in-polygon check using planar geometry utilities.
// 4. Selects the first matching jurisdiction based on feature index priority.
// 5. Returns the associated tax configuration if found.
// If no jurisdiction matches the location or no tax configuration exists
// for the matched name, the function returns false.
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
