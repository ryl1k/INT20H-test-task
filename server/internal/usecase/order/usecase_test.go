package order

import (
	"context"
	"encoding/csv"
	"errors"
	"io"
	"strings"
	"testing"
	"time"

	"go.uber.org/mock/gomock"

	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
	"github.com/ryl1k/INT20H-test-task-server/internal/repo/dto"
	repomocks "github.com/ryl1k/INT20H-test-task-server/internal/repo/mocks"

	"github.com/rs/zerolog"
)

func newTestUseCase(t *testing.T) (*UseCase, *repomocks.MockTaxRepo, *repomocks.MockOrderRepo) {
	ctrl := gomock.NewController(t)
	taxRepo := repomocks.NewMockTaxRepo(ctrl)
	orderRepo := repomocks.NewMockOrderRepo(ctrl)
	uc := New(context.Background(), taxRepo, orderRepo, time.Second*5, 1, zerolog.Nop())
	return uc, taxRepo, orderRepo
}

func TestCreate(t *testing.T) {
	uc, taxRepo, orderRepo := newTestUseCase(t)

	t.Run("completed", func(t *testing.T) {
		input := dto.Order{
			Latitude:  51.0,
			Longitude: -0.1,
			Subtotal:  100,
			Timestamp: time.Now(),
		}
		expectedTax := entity.JurisdictionTax{
			CompositeRate: 0.05,
			Breakdown: entity.JurisdictionTaxBreakdown{
				State:   0.02,
				County:  0.01,
				City:    0.01,
				Special: 0.01,
			},
			Names: []string{"X"},
			Code:  "X",
		}

		gomock.InOrder(
			taxRepo.EXPECT().
				GetTaxByLocation(gomock.Any(), input.Latitude, input.Longitude).
				Return(&expectedTax, true),
			orderRepo.EXPECT().
				Create(gomock.Any(), gomock.Any()).
				DoAndReturn(func(ctx context.Context, o entity.Order) (int, error) {
					if o.CompositeTaxRate != expectedTax.CompositeRate {
						t.Errorf("wrong composite rate %v", o.CompositeTaxRate)
					}
					return 123, nil
				}),
		)

		out, err := uc.Create(context.Background(), input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if out.Id != 123 {
			t.Errorf("got id %d", out.Id)
		}
		if out.Status != entity.OrderStatusCompleted {
			t.Errorf("expected completed status")
		}
	})

	t.Run("out_of_scope", func(t *testing.T) {
		input := dto.Order{
			Latitude:  10,
			Longitude: 20,
			Subtotal:  50,
			Timestamp: time.Now(),
		}

		taxRepo.EXPECT().
			GetTaxByLocation(gomock.Any(), input.Latitude, input.Longitude).
			Return(nil, false)
		orderRepo.EXPECT().
			Create(gomock.Any(), gomock.Any()).
			Return(5, nil)

		out, err := uc.Create(context.Background(), input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if out.Status != entity.OrderStatusOutOfScope {
			t.Errorf("expected out_of_scope status, got %s", out.Status)
		}
		if out.Id != 5 {
			t.Errorf("wrong id %d", out.Id)
		}
	})

	t.Run("repo error", func(t *testing.T) {
		input := dto.Order{
			Latitude:  1,
			Longitude: 2,
			Subtotal:  1,
			Timestamp: time.Now(),
		}
		expectedTax := entity.JurisdictionTax{CompositeRate: 0}

		gomock.InOrder(
			taxRepo.EXPECT().GetTaxByLocation(gomock.Any(), gomock.Any(), gomock.Any()).Return(&expectedTax, true),
			orderRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(0, errors.New("boom")),
		)

		_, err := uc.Create(context.Background(), input)
		if err == nil {
			t.Fatal("expected error")
		}
	})
}

func TestPassthroughMethods(t *testing.T) {
	uc, _, orderRepo := newTestUseCase(t)

	orderRepo.EXPECT().GetById(gomock.Any(), 42).Return(entity.Order{Id: 42}, nil)
	if _, err := uc.GetById(context.Background(), 42); err != nil {
		t.Fatal(err)
	}

	orderRepo.EXPECT().GetAll(gomock.Any(), dto.OrderFilters{Limit: 1, Offset: 0}).Return(entity.OrderList{}, nil)
	if _, err := uc.GetAll(context.Background(), dto.OrderFilters{Limit: 1, Offset: 0}); err != nil {
		t.Fatal(err)
	}

	orderRepo.EXPECT().DeleteAll(gomock.Any()).Return(nil)
	if err := uc.DeleteAll(context.Background()); err != nil {
		t.Fatal(err)
	}
}

func Test_mapCSVToEntity(t *testing.T) {
	uc, _, _ := newTestUseCase(t)

	t.Run("invalid columns", func(t *testing.T) {
		_, err := uc.mapCSVToEntity([]string{"a", "b", "c"})
		if err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("valid row", func(t *testing.T) {
		row := []string{"1", "10.1", "20.2", "2023-01-01 00:00:00.000000000", "15.5"}
		d, err := uc.mapCSVToEntity(row)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if d.Latitude != 20.2 || d.Longitude != 10.1 || d.Subtotal != 15.5 {
			t.Error("parsed values mismatch")
		}
	})

	t.Run("invalid longitude", func(t *testing.T) {
		row := []string{"1", "bad", "20.2", "2023-01-01 00:00:00.000000000", "15.5"}
		if _, err := uc.mapCSVToEntity(row); err == nil {
			t.Fatal("expected parse error for longitude")
		}
	})

	t.Run("invalid timestamp", func(t *testing.T) {
		row := []string{"1", "10.1", "20.2", "bad-time", "15.5"}
		if _, err := uc.mapCSVToEntity(row); err == nil {
			t.Fatal("expected parse error for timestamp")
		}
	})
}

func TestAsyncBatchCreate(t *testing.T) {
	uc, taxRepo, orderRepo := newTestUseCase(t)

	// create CSV with two records; first returns tax, second missing
	csvData := strings.Join([]string{
		"1,30.0,50.0,2023-01-01 00:00:00.000000000,10.0",
		"2,40.0,60.0,2023-01-02 00:00:00.000000000,20.0",
	}, "\n")
	src := io.NopCloser(strings.NewReader(csvData))
	reader := csv.NewReader(src)

	// expectations: two tax lookups and two batch writes (batch size == 1)
	gomock.InOrder(
		taxRepo.EXPECT().GetTaxByLocation(gomock.Any(), 50.0, 30.0).
			Return(&entity.JurisdictionTax{CompositeRate: 0.1, Names: []string{"A"}, Code: "A"}, true),
		orderRepo.EXPECT().BatchCreate(gomock.Any(), gomock.Any()).Do(func(ctx interface{}, orders interface{}) {
			o := orders.([]entity.Order)
			if len(o) != 1 {
				t.Errorf("expected batch size 1, got %d", len(o))
			}
		}),
		taxRepo.EXPECT().GetTaxByLocation(gomock.Any(), 60.0, 40.0).
			Return(nil, false),
		orderRepo.EXPECT().BatchCreate(gomock.Any(), gomock.Any()).Do(func(ctx interface{}, orders interface{}) {
			o := orders.([]entity.Order)
			if o[0].Status != entity.OrderStatusOutOfScope {
				t.Errorf("expected out_of_scope status")
			}
		}),
	)

	uc.AsyncBatchCreate(reader, src)
}
