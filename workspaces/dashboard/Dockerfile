FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Expose port and start
EXPOSE $PORT
ENV PORT=$PORT

CMD ["npm", "run", "start"]
