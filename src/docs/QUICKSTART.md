#  Quick Start Guide

Welcome! Here's how to get up and running in less than 5 minutes.

## Prerequisites Check

Make sure you have:
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Git (you probably already have this)

That's it! Docker will handle everything else.

## Step-by-Step Setup

### 1. Environment Setup (30 seconds)

```bash
# Copy the example environment file
cp .env.example .env
```

**Important**: Open `.env` and change these secrets:
```env
JWT_SECRET=your-unique-secret-here
JWT_REFRESH_SECRET=your-unique-refresh-secret-here
```

**Tip**: Use a password generator for production!

### 2. Start the Application (2 minutes)

```bash
# Start everything with Docker
docker-compose up -d

# Watch it start up (optional)
docker-compose logs -f app
```

Wait for the message: `Application is running on: http://localhost:3000/api`

### 3. Test It Out! (2 minutes)

**Create an admin user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!"
  }'
```

Copy the `accessToken` from the response and test a protected route:

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**You're all set!**

## Debug Mode (For Developers)

The app runs in debug mode by default when using Docker Compose.

**VS Code Debugging:**
1. Open the project in VS Code
2. Go to Run & Debug (Cmd/Ctrl + Shift + D)
3. Select "Docker: Attach to Node"
4. Press F5
5. Set breakpoints and debug! 🐛

**Debug Port**: `localhost:9229`

## Common Commands

```bash
# View logs
docker-compose logs -f app

# Restart the app
docker-compose restart app

# Stop everything
docker-compose down

# Stop and remove database
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

## Troubleshooting

**Port already in use?**
```bash
# Change the port in .env
PORT=3001
```

**Database connection issues?**
```bash
# Check if PostgreSQL is healthy
docker-compose ps

# Restart everything
docker-compose down && docker-compose up -d
```

**Need to reset everything?**
```bash
# Nuclear option - fresh start
docker-compose down -v
docker-compose up --build
```

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Check out the [API endpoints](README.md#-api-endpoints---your-playbook)
- Explore the code structure in `src/`
- Add your own features!

## Need Help?

- Check the logs: `docker-compose logs -f`
- Read the README.md
- Open an issue on GitHub

