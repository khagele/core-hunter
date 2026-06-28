package store

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

type Store struct{ db *sql.DB }

const schema = `
CREATE TABLE IF NOT EXISTS hunter_receptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_pubkey TEXT NOT NULL,
  hunter_name   TEXT,
  rx_at         TEXT NOT NULL,
  ingested_at   TEXT NOT NULL,
  snr           REAL,
  rssi          INTEGER,
  raw           TEXT NOT NULL,
  packet_type   TEXT,
  sender_key    TEXT,
  sender_keylen INTEGER,
  sender_role   TEXT,
  is_direct     INTEGER NOT NULL,
  hops          INTEGER NOT NULL,
  lat           REAL,
  lon           REAL,
  pos_acc_m     REAL,
  mqtt_topic    TEXT
);
CREATE INDEX IF NOT EXISTS idx_recv_rxat   ON hunter_receptions(rx_at);
CREATE INDEX IF NOT EXISTS idx_recv_sender ON hunter_receptions(sender_key);
CREATE INDEX IF NOT EXISTS idx_recv_geo    ON hunter_receptions(lat, lon);
`

func Open(path string) (*Store, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	if _, err := db.Exec(schema); err != nil {
		return nil, err
	}
	return &Store{db: db}, nil
}

func (s *Store) Insert(r Reception) error {
	_, err := s.db.Exec(
		`INSERT INTO hunter_receptions
		 (hunter_pubkey,hunter_name,rx_at,ingested_at,snr,rssi,raw,packet_type,
		  sender_key,sender_keylen,sender_role,is_direct,hops,lat,lon,pos_acc_m,mqtt_topic)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		r.HunterPubkey, r.HunterName, r.RxAt, r.IngestedAt, r.SNR, r.RSSI, r.Raw, r.PacketType,
		r.SenderKey, r.SenderKeylen, r.SenderRole, b2i(r.IsDirect), r.Hops, r.Lat, r.Lon, r.PosAccM, r.MQTTTopic,
	)
	return err
}

func (s *Store) Close() error { return s.db.Close() }

func b2i(b bool) int {
	if b {
		return 1
	}
	return 0
}
