package ingest

import "github.com/efiten/core-hunter/server/internal/store"

type Store interface {
	Insert(store.Reception) error
	InsertRaw(topic, payload, receivedAt, errMsg string) error
}

func Handle(s Store, topic string, body []byte, now func() string) error {
	ts := now()
	r, err := store.ParsePayload(topic, body, ts)
	if err != nil {
		return s.InsertRaw(topic, string(body), ts, "parse: "+err.Error())
	}
	if r.Raw == "" || r.RxAt == "" {
		return s.InsertRaw(topic, string(body), ts, "missing raw or rx_at")
	}
	if ierr := s.Insert(r); ierr != nil {
		if rerr := s.InsertRaw(topic, string(body), ts, "insert: "+ierr.Error()); rerr != nil {
			return rerr
		}
		return ierr
	}
	return nil
}
