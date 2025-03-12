# Build stage
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL
ARG VITE_REVIEWER_HONORIUM
ARG VITE_MAX_FILE_SIZE
ARG VITE_JWT_TOKEN_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_REVIEWER_HONORIUM=$VITE_REVIEWER_HONORIUM
ENV VITE_MAX_FILE_SIZE=$VITE_MAX_FILE_SIZE
ENV VITE_JWT_TOKEN_KEY=$VITE_JWT_TOKEN_KEY

RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
