FROM node:22-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
COPY prisma ./prisma/

# Copy dashboard package files if they exist
COPY workspaces/dashboard/package*.json ./workspaces/dashboard/

RUN npm ci

# Copy all source files
COPY . .

# Compile TypeScript → dist/
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]
