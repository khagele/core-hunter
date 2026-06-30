package httpapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/efiten/core-hunter/server/internal/version"
)

func TestParseBBox(t *testing.T) {
	a, b, c, d, ok := ParseBBox("51.0,4.0,52.0,5.0")
	if !ok || a != 51.0 || b != 4.0 || c != 52.0 || d != 5.0 { t.Fatalf("good bbox parsed wrong: %v %v %v %v %v", a, b, c, d, ok) }
	if _, _, _, _, ok := ParseBBox("nope"); ok { t.Fatal("bad bbox accepted") }
	if _, _, _, _, ok := ParseBBox("1,2,3"); ok { t.Fatal("short bbox accepted") }
}

func TestVersionEndpoint(t *testing.T) {
	mux := http.NewServeMux()
	RegisterRoutes(mux, nil, nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/version", nil))
	if rec.Code != http.StatusOK { t.Fatalf("status = %d, want 200", rec.Code) }
	var body map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil { t.Fatalf("bad json: %v", err) }
	if body["server"] != version.Version { t.Fatalf("server = %q, want %q", body["server"], version.Version) }
}
