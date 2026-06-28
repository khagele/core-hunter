package main

import (
	"log"
	"net/http"
	"os"

	"github.com/efiten/core-hunter/server/internal/config"
)

func main() {
	cfgPath := "config.json"
	if len(os.Args) > 1 {
		cfgPath = os.Args[1]
	}
	cfg, err := config.Load(cfgPath)
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	log.Printf("ingestor listening on %s, topic %s", cfg.HTTPAddr, cfg.MQTTTopic)
	log.Fatal(http.ListenAndServe(cfg.HTTPAddr, nil))
}
