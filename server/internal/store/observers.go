package store

import (
	"database/sql"
	"strings"
)

// ObserverPoint is one geolocated reception by a CoreScope mobile observer.
type ObserverPoint struct {
	Lat      float64  `json:"lat"`
	Lon      float64  `json:"lon"`
	RSSI     *int     `json:"rssi"`
	SNR      *float64 `json:"snr"`
	HeardKey string   `json:"heard_key"`
	Src      string   `json:"src"`
	Observer string   `json:"observer"`
	RxAt     string   `json:"rx_at"`
}

// CSReader is a read-only reader over the CoreScope meshcore.db. The connection
// is ALWAYS opened mode=ro — even when the underlying volume is mounted rw (which
// it must be, so SQLite can coordinate WAL shared memory with CoreScope's live
// writer). mode=ro guarantees this process never writes to that database.
type CSReader struct{ db *sql.DB }

// OpenCS opens the CoreScope DB read-only. An empty path returns (nil, nil) —
// the feature is simply disabled.
func OpenCS(path string) (*CSReader, error) {
	if path == "" {
		return nil, nil
	}
	db, err := sql.Open("sqlite", "file:"+path+"?mode=ro&_pragma=busy_timeout(5000)")
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}
	db.SetMaxOpenConns(2)
	return &CSReader{db: db}, nil
}

func (r *CSReader) Close() error {
	if r == nil {
		return nil
	}
	return r.db.Close()
}

// ObserverPoints returns geolocated receptions from MOBILE observers (lat/lon
// spread > ~300 m) for the given src ("advert" or "rxlog"), within [from, to],
// newest first, capped at limit. Joined with client_observers for the name.
func (r *CSReader) ObserverPoints(src, from, to string, limit int) ([]ObserverPoint, error) {
	if limit <= 0 {
		limit = 5000
	}
	conds := []string{"cr.lat IS NOT NULL", "cr.src = ?"}
	args := []any{src}
	if from != "" {
		conds = append(conds, "cr.rx_at >= ?")
		args = append(args, from)
	}
	if to != "" {
		conds = append(conds, "cr.rx_at <= ?")
		args = append(args, to)
	}
	args = append(args, limit)
	q := `WITH mobile AS (
	    SELECT rx_pubkey FROM client_receptions WHERE lat IS NOT NULL
	    GROUP BY rx_pubkey
	    HAVING (MAX(lat)-MIN(lat))*111000 > 300 OR (MAX(lon)-MIN(lon))*70000 > 300
	  )
	  SELECT cr.lat, cr.lon, cr.rssi, cr.snr, cr.heard_key, cr.src, COALESCE(co.name, ''), cr.rx_at
	  FROM client_receptions cr
	  JOIN mobile m ON m.rx_pubkey = cr.rx_pubkey
	  LEFT JOIN client_observers co ON co.pubkey = cr.rx_pubkey
	  WHERE ` + strings.Join(conds, " AND ") + `
	  ORDER BY cr.rx_at DESC LIMIT ?`
	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []ObserverPoint
	for rows.Next() {
		var p ObserverPoint
		var rssi sql.NullInt64
		var snr sql.NullFloat64
		if err := rows.Scan(&p.Lat, &p.Lon, &rssi, &snr, &p.HeardKey, &p.Src, &p.Observer, &p.RxAt); err != nil {
			return nil, err
		}
		if rssi.Valid {
			v := int(rssi.Int64)
			p.RSSI = &v
		}
		if snr.Valid {
			p.SNR = &snr.Float64
		}
		out = append(out, p)
	}
	return out, rows.Err()
}
