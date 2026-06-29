package store

import (
	"database/sql"
	"strings"

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
  sender_kind   TEXT,
  sender_id     TEXT,
  sender_label  TEXT,
  channel_name  TEXT,
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
CREATE TABLE IF NOT EXISTS raw_messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  topic        TEXT,
  payload      TEXT NOT NULL,
  received_at  TEXT NOT NULL,
  error        TEXT
);
`

func Open(path string) (*Store, error) {
	dsn := path
	if path != ":memory:" {
		dsn = "file:" + path + "?_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)"
	}
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	if _, err := db.Exec(schema); err != nil {
		return nil, err
	}
	for _, col := range []string{"sender_kind", "sender_id", "sender_label", "channel_name"} {
		if _, err := db.Exec("ALTER TABLE hunter_receptions ADD COLUMN " + col + " TEXT"); err != nil &&
			!strings.Contains(err.Error(), "duplicate column name") {
			return nil, err
		}
	}
	return &Store{db: db}, nil
}

func (s *Store) Insert(r Reception) error {
	_, err := s.db.Exec(
		`INSERT INTO hunter_receptions
		 (hunter_pubkey,hunter_name,rx_at,ingested_at,snr,rssi,raw,packet_type,
		  sender_key,sender_keylen,sender_role,sender_kind,sender_id,sender_label,channel_name,
		  is_direct,hops,lat,lon,pos_acc_m,mqtt_topic)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		r.HunterPubkey, r.HunterName, r.RxAt, r.IngestedAt, r.SNR, r.RSSI, r.Raw, r.PacketType,
		r.SenderKey, r.SenderKeylen, r.SenderRole, r.SenderKind, r.SenderID, r.SenderLabel, r.ChannelName,
		b2i(r.IsDirect), r.Hops, r.Lat, r.Lon, r.PosAccM, r.MQTTTopic,
	)
	return err
}

func (s *Store) InsertRaw(topic, payload, receivedAt, errMsg string) error {
	_, err := s.db.Exec(
		`INSERT INTO raw_messages (topic, payload, received_at, error) VALUES (?,?,?,?)`,
		topic, payload, receivedAt, errMsg,
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
