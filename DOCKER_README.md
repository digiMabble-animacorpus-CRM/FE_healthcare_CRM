# Docker Setup for Real Estate AI Application

This document provides instructions for running the Real Estate AI application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### 1. Development Mode

For development with hot reload:

```bash
# Build and run in development mode
docker-compose --profile dev up --build

# Or run in detached mode
docker-compose --profile dev up --build -d
```

### 2. Production Mode

For production deployment:

```bash
# Build and run in production mode
docker-compose --profile prod up --build

# Or run in detached mode
docker-compose --profile prod up --build -d
```

## Manual Docker Commands

### Build the Image

```bash
# Build production image
docker build -t real-estate-ai .

# Build development image
docker build -f Dockerfile.dev -t real-estate-ai:dev .
```

### Run the Container

```bash
# Run production container
docker run -p 3000:3000 real-estate-ai

# Run development container
docker run -p 3000:3000 -v $(pwd):/app real-estate-ai:dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Next.js
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-url.com

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database (if applicable)
DATABASE_URL=your-database-url

# External Services
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Docker Compose Profiles

### Development Profile (`dev`)
- Uses development Dockerfile
- Includes volume mounts for hot reload
- Runs `npm run dev`

### Production Profile (`prod`)
- Uses optimized production build
- No volume mounts
- Runs standalone Next.js server

## Monitoring and Logs

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app-prod

# Follow logs in real-time
docker-compose logs -f
```

### Health Check

```bash
# Check if the application is running
curl http://localhost:3000
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Build Failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Performance Optimization

1. **Multi-stage Build**: The production Dockerfile uses multi-stage builds to reduce image size
2. **Standalone Output**: Next.js is configured with `output: 'standalone'` for optimal Docker deployment
3. **Alpine Linux**: Uses lightweight Alpine Linux base image
4. **Layer Caching**: Optimized layer ordering for better cache utilization

## Production Deployment

### Using Docker Compose

```bash
# Deploy to production
docker-compose --profile prod up --build -d

# Scale the application
docker-compose --profile prod up --scale app-prod=3 -d
```

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml real-estate-ai
```

### Using Kubernetes

Create Kubernetes manifests based on the Docker Compose configuration:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: real-estate-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: real-estate-ai
  template:
    metadata:
      labels:
        app: real-estate-ai
    spec:
      containers:
      - name: app
        image: real-estate-ai:latest
        ports:
        - containerPort: 3000
```

## Security Considerations

1. **Non-root User**: The production container runs as a non-root user
2. **Environment Variables**: Sensitive data should be passed via environment variables
3. **Image Scanning**: Regularly scan Docker images for vulnerabilities

## Maintenance

### Update Dependencies

```bash
# Update npm packages
npm update

# Rebuild Docker image
docker-compose build --no-cache
```

### Backup and Restore

```bash
# Backup application data (if any)
docker run --rm -v real-estate-ai_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Restore application data
docker run --rm -v real-estate-ai_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

## Support

For issues related to Docker setup, check:

1. Docker logs: `docker-compose logs`
2. Application logs: `docker-compose logs app-prod`
3. System resources: `docker stats` 