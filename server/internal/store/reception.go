package store

import "encoding/json"

type Reception struct {
	HunterPubkey string
	HunterName   string
	RxAt         string
	IngestedAt   string
	SNR          float64
	RSSI         int
	Raw          string
	PacketType   string
	SenderKey    string
	SenderKeylen int
	SenderRole   string
	SenderKind   string
	SenderID     string
	SenderLabel  string
	ChannelName  string
	IsDirect     bool
	Hops         int
	Lat          float64
	Lon          float64
	PosAccM      float64
	MQTTTopic    string
}

type payload struct {
	OriginID     string  `json:"origin_id"`
	Origin       string  `json:"origin"`
	Timestamp    string  `json:"timestamp"`
	Raw          string  `json:"raw"`
	SNR          float64 `json:"SNR"`
	RSSI         int     `json:"RSSI"`
	IsDirect     bool    `json:"is_direct"`
	Hops         int     `json:"hops"`
	SenderKey    string  `json:"sender_key"`
	SenderKeylen int     `json:"sender_keylen"`
	SenderRole   string  `json:"sender_role"`
	SenderKind   string  `json:"sender_kind"`
	SenderID     string  `json:"sender_id"`
	SenderLabel  string  `json:"sender_label"`
	ChannelName  string  `json:"channel_name"`
	PacketType   string  `json:"packet_type"`
	GPS          struct {
		Lat  float64 `json:"lat"`
		Lon  float64 `json:"lon"`
		AccM float64 `json:"acc_m"`
	} `json:"gps"`
}

func ParsePayload(topic string, body []byte, ingestedAt string) (Reception, error) {
	var p payload
	if err := json.Unmarshal(body, &p); err != nil {
		return Reception{}, err
	}
	return Reception{
		HunterPubkey: p.OriginID,
		HunterName:   p.Origin,
		RxAt:         p.Timestamp,
		IngestedAt:   ingestedAt,
		SNR:          p.SNR,
		RSSI:         p.RSSI,
		Raw:          p.Raw,
		PacketType:   p.PacketType,
		SenderKey:    p.SenderKey,
		SenderKeylen: p.SenderKeylen,
		SenderRole:   p.SenderRole,
		SenderKind:   p.SenderKind,
		SenderID:     p.SenderID,
		SenderLabel:  p.SenderLabel,
		ChannelName:  p.ChannelName,
		IsDirect:     p.IsDirect,
		Hops:         p.Hops,
		Lat:          p.GPS.Lat,
		Lon:          p.GPS.Lon,
		PosAccM:      p.GPS.AccM,
		MQTTTopic:    topic,
	}, nil
}
