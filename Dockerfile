# Production Multi-Stage Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client manifests
COPY package.json ./
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy client source and build
COPY client/ ./client/
RUN cd client && npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/

# Copy built frontend assets from builder stage
COPY --from=builder /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Seed database and start server
CMD ["sh", "-c", "node server/src/seeds/seedData.js && node server/src/server.js"]
