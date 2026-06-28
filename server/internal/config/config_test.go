package config

import "testing"

func TestLoadDefaultsTopic(t *testing.T) {
	c, err := Load("testdata/min.json")
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if c.MQTTTopic != "meshcore/hunter/+/packets" {
		t.Fatalf("topic = %q, want default wildcard", c.MQTTTopic)
	}
	if c.DBPath == "" || c.HTTPAddr == "" {
		t.Fatalf("DBPath/HTTPAddr must have defaults, got %q / %q", c.DBPath, c.HTTPAddr)
	}
}
