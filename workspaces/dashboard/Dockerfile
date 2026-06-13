FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Expose port and start
EXPOSE 3001
ENV PORT=3001

CMD ["npm", "run", "start"]
