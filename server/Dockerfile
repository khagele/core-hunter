FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/ingestor ./cmd/ingestor

FROM gcr.io/distroless/static-debian12
COPY --from=build /out/ingestor /ingestor
VOLUME ["/app/data"]
EXPOSE 8090
ENTRYPOINT ["/ingestor", "/app/config.json"]
