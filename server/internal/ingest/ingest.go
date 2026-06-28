package ingest

import "github.com/efiten/core-hunter/server/internal/store"

type Inserter interface{ Insert(store.Reception) error }

func Handle(s Inserter, topic string, body []byte, now func() string) error {
	r, err := store.ParsePayload(topic, body, now())
	if err != nil {
		return err
	}
	return s.Insert(r)
}
