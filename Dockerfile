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

# Generate Prisma client
RUN npx prisma generate

# Initialize SQLite Database tables in the container image
RUN npx prisma db push --skip-generate

# Compile TypeScript → dist/
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]
