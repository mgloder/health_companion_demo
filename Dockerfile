# Use Node.js LTS (Long Term Support) as the base image
FROM node:20-slim

# Add these labels at the top
LABEL org.opencontainers.image.source="https://github.com/mgloder/health_companion_demo"
LABEL org.opencontainers.image.description="AI Health Companion Demo"
LABEL org.opencontainers.image.licenses="MIT"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Install debugging tools
RUN apt-get update && apt-get install -y curl net-tools

# Set environment variables
ENV NODE_ENV=production
ENV OPENAI_API_KEY=""
ENV HTTPS_PROXY=""
ENV HTTP_PROXY=""
ENV NO_PROXY="localhost,127.0.0.1,0.0.0.0"
ENV HOST="0.0.0.0"
ENV PORT=3000
ENV DEBUG="*"

# Expose the port your app runs on
EXPOSE 3000/tcp

# Start the application with console logging
CMD ["npm", "run", "start"] 