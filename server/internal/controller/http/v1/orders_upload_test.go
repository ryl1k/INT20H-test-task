package v1

import "testing"

func TestIsAllowedCSVUpload(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		contentType string
		fileName    string
		want        bool
	}{
		{
			name:        "text_csv",
			contentType: "text/csv",
			fileName:    "orders.csv",
			want:        true,
		},
		{
			name:        "text_csv_with_charset",
			contentType: "text/csv; charset=utf-8",
			fileName:    "orders.csv",
			want:        true,
		},
		{
			name:        "ms_excel_csv",
			contentType: "application/vnd.ms-excel",
			fileName:    "orders.csv",
			want:        true,
		},
		{
			name:        "plain_text_with_csv_extension",
			contentType: "text/plain",
			fileName:    "orders.csv",
			want:        true,
		},
		{
			name:        "octet_stream_with_csv_extension",
			contentType: "application/octet-stream",
			fileName:    "orders.csv",
			want:        true,
		},
		{
			name:        "invalid_extension",
			contentType: "application/octet-stream",
			fileName:    "orders.txt",
			want:        false,
		},
		{
			name:        "unknown_mime_even_with_csv_extension",
			contentType: "application/pdf",
			fileName:    "orders.csv",
			want:        false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := isAllowedCSVUpload(tc.contentType, tc.fileName)
			if got != tc.want {
				t.Fatalf("isAllowedCSVUpload(%q, %q)=%v, want %v", tc.contentType, tc.fileName, got, tc.want)
			}
		})
	}
}
