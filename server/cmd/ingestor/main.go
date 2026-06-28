package main

import (
	"log"
	"net/http"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/efiten/core-hunter/server/internal/config"
	"github.com/efiten/core-hunter/server/internal/ingest"
	"github.com/efiten/core-hunter/server/internal/store"
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

	st, err := store.Open(cfg.DBPath)
	if err != nil {
		log.Fatalf("store: %v", err)
	}
	defer st.Close()

	opts := mqtt.NewClientOptions().
		AddBroker(cfg.MQTTURL).
		SetUsername(cfg.MQTTUsername).
		SetPassword(cfg.MQTTPassword).
		SetClientID("core-hunter-ingestor").
		SetAutoReconnect(true)
	opts.SetOnConnectHandler(func(c mqtt.Client) {
		c.Subscribe(cfg.MQTTTopic, 1, func(_ mqtt.Client, m mqtt.Message) {
			if err := ingest.Handle(st, m.Topic(), m.Payload(), func() string {
				return time.Now().UTC().Format(time.RFC3339)
			}); err != nil {
				log.Printf("ingest error: %v", err)
			}
		})
		log.Printf("subscribed to %s", cfg.MQTTTopic)
	})
	client := mqtt.NewClient(opts)
	if t := client.Connect(); t.Wait() && t.Error() != nil {
		log.Fatalf("mqtt connect: %v", t.Error())
	}

	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	log.Printf("ingestor listening on %s, topic %s", cfg.HTTPAddr, cfg.MQTTTopic)
	log.Fatal(http.ListenAndServe(cfg.HTTPAddr, nil))
}
