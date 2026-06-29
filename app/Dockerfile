# Multi-stage: build the Vite PWA, then serve the static bundle with nginx.
# Runtime config (config.json, holds broker creds) is NOT baked in — mount it
# at /usr/share/nginx/html/config.json so the browser fetches it at runtime.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
