FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build for production
RUN npm run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
