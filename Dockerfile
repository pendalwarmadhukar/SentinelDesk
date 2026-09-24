# Build & Run SentinelDesk SOC on Linux
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose SentinelDesk SOC port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start server using tsx
CMD ["npx", "tsx", "server.ts"]
