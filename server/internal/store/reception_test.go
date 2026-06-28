package store

import "testing"

const samplePayload = `{
 "origin_id":"aabb","origin":"hunter-1","timestamp":"2026-06-29T10:00:00Z",
 "type":"PACKET","direction":"rx","raw":"deadbeef","SNR":-3.5,"RSSI":-92,
 "is_direct":true,"hops":0,"sender_key":"a1","sender_keylen":1,"sender_role":"",
 "packet_type":"channel-msg","gps":{"lat":51.0,"lon":4.0,"acc_m":8.0}
}`

func TestParsePayloadMapsAllFields(t *testing.T) {
	r, err := ParsePayload("meshcore/hunter/aabb/packets", []byte(samplePayload), "2026-06-29T10:00:01Z")
	if err != nil {
		t.Fatalf("ParsePayload: %v", err)
	}
	if r.HunterPubkey != "aabb" || r.HunterName != "hunter-1" {
		t.Fatalf("hunter fields wrong: %+v", r)
	}
	if !r.IsDirect || r.Hops != 0 || r.SenderKeylen != 1 || r.SNR != -3.5 || r.RSSI != -92 {
		t.Fatalf("signal/axis fields wrong: %+v", r)
	}
	if r.Raw != "deadbeef" || r.PacketType != "channel-msg" || r.Lat != 51.0 {
		t.Fatalf("payload fields wrong: %+v", r)
	}
	if r.IngestedAt != "2026-06-29T10:00:01Z" || r.MQTTTopic == "" {
		t.Fatalf("ingest meta wrong: %+v", r)
	}
}

func TestInsertRoundTrip(t *testing.T) {
	st, err := Open(":memory:")
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	defer st.Close()
	r, _ := ParsePayload("t", []byte(samplePayload), "2026-06-29T10:00:01Z")
	if err := st.Insert(r); err != nil {
		t.Fatalf("Insert: %v", err)
	}
	var n int
	if err := st.db.QueryRow(`SELECT count(*) FROM hunter_receptions WHERE is_direct=1`).Scan(&n); err != nil {
		t.Fatalf("query: %v", err)
	}
	if n != 1 {
		t.Fatalf("rows=%d want 1", n)
	}
}
