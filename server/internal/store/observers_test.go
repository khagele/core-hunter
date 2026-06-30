package store

import (
	"database/sql"
	"testing"
)

func TestObserverPointsMobileOnlyBySrcAndTimeframe(t *testing.T) {
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("open: %v", err)
	}
	defer db.Close()
	mustExec(t, db, `CREATE TABLE client_receptions (rx_pubkey TEXT, heard_key TEXT, heard_keylen INT,
	  rssi INT, snr REAL, lat REAL, lon REAL, pos_acc_m REAL, rx_at TEXT, ingested_at TEXT, src TEXT)`)
	mustExec(t, db, `CREATE TABLE client_observers (pubkey TEXT, name TEXT, last_seen TEXT)`)
	mustExec(t, db, `INSERT INTO client_observers VALUES ('mob','Erwin Mobile','x'),('fix','Fixed','x')`)
	// 'mob' moves (>300 m spread) → mobile; 'fix' sits at one spot → not mobile.
	mustExec(t, db, `INSERT INTO client_receptions (rx_pubkey,heard_key,heard_keylen,rssi,snr,lat,lon,rx_at,src) VALUES
	  ('mob','1d6f',2,-110,-5.0, 51.000,4.000,'2026-06-30T10:00:00Z','rxlog'),
	  ('mob','1d6f',2,-100,-4.0, 51.010,4.010,'2026-06-30T10:05:00Z','rxlog'),
	  ('mob','abcd',32,-90,-3.0, 51.005,4.005,'2026-06-30T10:06:00Z','advert'),
	  ('mob','1d6f',2,-95,-4.0, 51.002,4.002,'2026-06-29T08:00:00Z','rxlog'),
	  ('fix','f519',2,-80,-2.0, 52.000,5.000,'2026-06-30T10:07:00Z','rxlog')`)
	cs := &CSReader{db: db}

	rx, err := cs.ObserverPoints("rxlog", "2026-06-30T09:00:00Z", "2026-06-30T11:00:00Z", 100)
	if err != nil {
		t.Fatalf("rxlog: %v", err)
	}
	// only 'mob' rxlog within the timeframe (2): the fixed observer and the
	// out-of-window row are excluded; the advert is a different src.
	if len(rx) != 2 {
		t.Fatalf("rxlog mobile in window = %d, want 2: %+v", len(rx), rx)
	}
	if rx[0].Observer != "Erwin Mobile" || rx[0].Src != "rxlog" {
		t.Fatalf("observer/src wrong: %+v", rx[0])
	}

	adv, err := cs.ObserverPoints("advert", "2026-06-30T09:00:00Z", "2026-06-30T11:00:00Z", 100)
	if err != nil {
		t.Fatalf("advert: %v", err)
	}
	if len(adv) != 1 || adv[0].HeardKey != "abcd" {
		t.Fatalf("advert mobile = %d, want 1 (abcd): %+v", len(adv), adv)
	}
}

func mustExec(t *testing.T, db *sql.DB, q string) {
	t.Helper()
	if _, err := db.Exec(q); err != nil {
		t.Fatalf("exec: %v\n%s", err, q)
	}
}
