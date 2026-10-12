# Use Node.js 22
FROM node:22-alpine

# Set application directory
WORKDIR /usr/src/myapp

# Install required Alpine packages
RUN apk add --no-cache git tzdata

# Copy package files first for better Docker caching
COPY package.json package-lock.json ./

# Install exact dependencies from package-lock.json
RUN npm ci

# Copy the rest of the source code
COPY . .

# Production environment
ENV NODE_ENV=production

# Nuxt/Nitro server configuration
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3008

# Set timezone
ENV TZ=Asia/Manila

# Build Nuxt application
RUN npm run build

# Container listens on port 3008
EXPOSE 3008

# Start Nuxt/Nitro production server
CMD ["node", ".output/server/index.mjs"]