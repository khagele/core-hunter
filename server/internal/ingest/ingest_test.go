package ingest

import (
	"testing"

	"github.com/efiten/core-hunter/server/internal/store"
)

type fake struct{ got []store.Reception }

func (f *fake) Insert(r store.Reception) error { f.got = append(f.got, r); return nil }

func TestHandleInsertsParsedReception(t *testing.T) {
	f := &fake{}
	body := []byte(`{"origin_id":"aa","timestamp":"t","raw":"00","hops":2,"is_direct":false,"gps":{"lat":1,"lon":2}}`)
	if err := Handle(f, "meshcore/hunter/aa/packets", body, func() string { return "now" }); err != nil {
		t.Fatalf("Handle: %v", err)
	}
	if len(f.got) != 1 || f.got[0].Hops != 2 || f.got[0].IngestedAt != "now" {
		t.Fatalf("bad reception: %+v", f.got)
	}
}
