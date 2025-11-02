# RBAC Service - Your Complete Authentication & Authorization Solution

Hey there! 👋 Welcome to this NestJS-powered backend service that takes care of all your user authentication and role-based authorization needs. Think of it as your security guard, bouncer, and identity manager all rolled into one neat package.

## What's This All About?

Ever needed to build a system where some users can do certain things while others can't? That's exactly what this project does! It's a complete authentication system with:

- **User Registration** - Let people sign up with just an email and password (we make sure they're legit!)
- **Secure Password Storage** - No plain text passwords here! We use bcrypt to keep everything locked down tight
- **Smart Authentication** - JWT tokens that work like digital backstage passes
- **Auto-Refresh Magic** - Tokens expire? No problem! We've got auto-refresh built in
- **Role-Based Access** - Users, Admins, and Moderators - everyone gets the right level of access
- **Protected Routes** - Some doors are VIP only, and we make sure it stays that way
- **PostgreSQL Database** - All your data stored safely and efficiently
- **Dockerized** - One command and you're up and running, no hassle!

## How It's Built

Here's what's under the hood:

```
src/
├── auth/                       # The authentication brain 🧠
│   ├── dto/                    # Data validation helpers
│   ├── guards/                 # Security checkpoints
│   ├── strategies/             # JWT magic happens here
│   ├── auth.controller.ts      # Login/Register endpoints
│   ├── auth.service.ts         # All the authentication logic
│   └── auth.module.ts
├── users/                      # User management 👥
│   ├── users.controller.ts     # User-related endpoints
│   ├── users.service.ts        # User business logic
│   └── users.module.ts
├── common/                     # Shared goodies 🎁
│   ├── decorators/             # Custom decorators (@Roles, @GetUser)
│   ├── enums/                  # User roles and such
│   └── guards/                 # Access control guards
├── database/                   # Database setup
├── entities/                   # Your data models
└── main.ts                     # Where it all begins
```

## 🛠️ Tech Stack (The Cool Stuff We're Using)

- **Framework**: NestJS 10.x - Because TypeScript deserves a solid framework
- **Language**: TypeScript - JavaScript's cooler, type-safe cousin
- **Database**: PostgreSQL 16 - Reliable, powerful, and open-source
- **ORM**: TypeORM - Makes talking to databases feel natural
- **Authentication**: JWT with Passport - Industry-standard security
- **Validation**: class-validator - No bad data gets through
- **Password Hashing**: bcrypt - Cryptographic-grade security
- **Containerization**: Docker - Runs anywhere, every time
## 📋 What You'll Need

Before we dive in, make sure you've got:

- **Node.js** (version 20 or newer) - The JavaScript runtime
- **Docker & Docker Compose** - For containerization magic
- **npm or yarn** - Package managers (npm comes with Node.js)

That's it! Docker will handle the rest.

## 🚀 Let's Get This Running!

### Step 1: Get the Code

You're already here, so you're good! But if someone else wants to try this:

```bash
cd RBACService
```

### Step 2: Set Up Your Environment

First, let's configure your environment variables:

```bash
cp .env.example .env
```

Now, **super important** ⚠️ - Open that `.env` file and change these secrets (especially for production):

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

Pro tip: Use a password generator for these! The longer and more random, the better.

### Step 3: Fire It Up! 🔥

**Using Docker (Recommended - It Just Works™)**

```bash
docker-compose up -d
```

That's it! Seriously. Docker will:
- 🐘 Spin up a PostgreSQL database
- 🚀 Start your NestJS application in **debug mode** (perfect for development!)
- 🔌 Connect everything together
- ✨ Make it all available at `http://localhost:3000/api`

Want to see what's happening? Check the logs:
```bash
docker-compose logs -f app
```

Need to stop everything?
```bash
docker-compose down
```

**Want to Run It Locally Instead?**

Sure thing! First, make sure PostgreSQL is running on your machine, then:

```bash
# Install dependencies
npm install

# Update your .env to point to localhost
# Change DB_HOST=postgres to DB_HOST=localhost

# Start the dev server with hot-reload
npm run start:dev

# Or start with debugging enabled
npm run start:debug
```

The app will be live at `http://localhost:${PORT}/api` with hot-reloading enabled!

### Step 3.5: Explore the Interactive API Docs 📘

Once the server is running, head over to [http://localhost:${PORT}/api/docs](http://localhost:${PORT}/api/docs) to play with the automatically generated Swagger UI.

- Try out any endpoint directly from the browser
- Review request/response schemas and validation rules
- Use the **Authorize** button to paste your JWT access token (Bearer scheme)

Swagger stays in sync with the codebase, so you always see exactly what the API expects.

### Step 4: Debug Like a Pro 🐛

When running with Docker, the app starts in **debug mode** automatically. You can attach your debugger on port **9229**:

**VS Code Debug Configuration:**
Add this to your `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "attach",
  "name": "Docker: Attach to Node",
  "port": 9229,
  "address": "localhost",
  "localRoot": "${workspaceFolder}",
  "remoteRoot": "/usr/src/app",
  "protocol": "inspector",
  "restart": true
}
```

Now you can set breakpoints, inspect variables, and debug in real-time! 🎯

## API Endpoints - Your Playbook

All endpoints are available at: `http://localhost:3000/api`

### Authentication Stuff 

#### Register a New User
Time to create an account! Here's how:

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "role": "user"  // Optional: "user", "admin", or "moderator" (defaults to "user")
}
```

**What you get back:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-10-31T12:00:00.000Z"
  }
}
```

#### Login Time! 🚪
Already have an account? Let's log you in:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**You'll get your golden tickets:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Pro tip**: The `accessToken` is your main pass (expires in 15 minutes), and the `refreshToken` lets you get a new pass without logging in again (lasts 7 days).

#### Refresh Your Token 
Token expired? No worries, just refresh it:

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

**Fresh tokens, coming right up:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout 
Time to go? Log out securely:

```bash
POST /api/auth/logout
Authorization: Bearer <your-access-token>
```

### User Endpoints (Protected Territory) 

From here on, you'll need to include your access token in the header:
```
Authorization: Bearer your-access-token-here
```

#### Get Your Profile
Check out your own profile:

```bash
GET /api/users/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-10-31T12:00:00.000Z"
  }
}
```

#### User Dashboard (Everyone Welcome)
Your personal dashboard:

```bash
GET /api/users/user-dashboard
Authorization: Bearer <access_token>
```

Works for all roles - users, moderators, and admins alike!

#### Admin Dashboard (VIP Only) 👑
This one's special - only admins and moderators can enter:

```bash
GET /api/users/admin-dashboard
Authorization: Bearer <access_token>
```

**Requires**: Admin or Moderator role

#### List All Users (Admins Only) 📋
Want to see everyone? You'll need admin privileges:

```bash
GET /api/users/all
Authorization: Bearer <access_token>
```

**Requires**: Admin role only

## 🔒 Security - We Take This Seriously

### Password Protection 🛡️
- **Bcrypt hashing** with 10 salt rounds - Your passwords are scrambled like a Rubik's cube
- **Never stored in plain text** - Not even we can see them!
- **Minimum 8 characters** - Because "password" isn't cutting it anymore

### JWT Token Magic 🎫
- **Access Token**: Quick passes that last 15 minutes (like a parking meter)
- **Refresh Token**: Long-term passes that last 7 days (your season ticket)
- **Refresh tokens are hashed** before we store them - security all the way down
- **Tokens include user info**: ID, email, and role baked right in

### Role System 👥
We've got three levels of access:

- **USER** 👤 - The standard account, can access basic features
- **MODERATOR** 🛡️ - Trusted folks who get access to the admin dashboard
- **ADMIN** 👑 - The boss, full access to everything including user management

### Input Validation ✅
- **class-validator** checks everything coming in
- **DTOs** (Data Transfer Objects) keep data clean and type-safe
- **Whitelist mode** - Unknown fields? Rejected!
- **Auto-transform** - Numbers stay numbers, strings stay strings

## 🧪 Let's Test This Thing!

Want to take it for a spin? Here are some quick tests:

### Using cURL (Terminal/Command Line)

**Create an admin account:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123",
    "role": "admin"
  }'
```

**Login and grab your tokens:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123"
  }'
```

**Check your profile (replace YOUR_ACCESS_TOKEN):**
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Try the admin-only route:**
```bash
curl -X GET http://localhost:3000/api/users/all \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

### Using Postman or Insomnia

1. **Import** the endpoints above
2. **Set up environment variables** for `access_token` and `refresh_token`
3. **Choose Bearer Token** auth type
4. **Play around** with different roles - create a regular user, try accessing admin routes, see what happens!

### Quick Test Scenario 🎬

1. Register a regular user
2. Register an admin user
3. Login as regular user → try to access `/api/users/all` → Should be denied! ❌
4. Login as admin → access `/api/users/all` → Should work! ✅
5. Wait 15 minutes (or change the expiry to 30 seconds for testing)
6. Try using the old token → Should fail
7. Use refresh token → Get new access token → Back in business! 🎉

## 🐳 Docker Commands Cheat Sheet

Here are all the Docker commands you might need:

**Start everything (build if needed):**
```bash
docker-compose up --build
```

**Start in the background:**
```bash
docker-compose up -d
```

**Watch the logs (like Netflix but for your app):**
```bash
docker-compose logs -f app
```

**See what's running:**
```bash
docker-compose ps
```

**Stop everything:**
```bash
docker-compose down
```

**Nuclear option (remove database too):**
```bash
docker-compose down -v
```

**Production mode (optimized and secure):**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Restart just the app:**
```bash
docker-compose restart app
```

**Get a shell inside the container:**
```bash
docker-compose exec app sh
```

## Development vs Production

### Development Mode (Default with docker-compose.yml)
- **Debug mode enabled** on port 9229
- **Hot reload** - Change code, see it update instantly
- **Volume mounting** - Your local code syncs with the container
- **All dev dependencies** included
- **Detailed logging** for debugging
- **TypeScript source maps** for better error traces

### Production Mode (docker-compose.prod.yml)
- 🚀 **Optimized build** - Smaller, faster Docker images
- 🚀 **Production dependencies only** - Smaller attack surface
- 🚀 **Running as non-root user** - Better security
- 🚀 **Compiled JavaScript** - No TypeScript runtime overhead
- 🚀 **No volume mounting** - Immutable containers
- 🚀 **Minimal logging** - Just what you need

**Switch to production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Project Structure Explained

Let's break down what everything does:

### Decorators - The Helpers 🎨
- **`@Roles(UserRole.ADMIN)`**: Mark which roles can access an endpoint
- **`@GetUser()`**: Grab the logged-in user from the request (like magic! ✨)

### Guards - The Bouncers 💪
- **`JwtAuthGuard`**: Checks if you have a valid access token
- **`JwtRefreshGuard`**: Validates refresh tokens
- **`RolesGuard`**: Makes sure you have the right role to enter

### Strategies - The Validators 🔍
- **`JwtStrategy`**: Validates access tokens and fetches the user
- **`JwtRefreshStrategy`**: Handles refresh token validation

## 🔧 Environment Variables Reference

| Variable | What It Does | Default Value |
|----------|-------------|---------------|
| `NODE_ENV` | Sets the environment (dev/prod) | `development` |
| `PORT` | Which port the app runs on | `3000` |
| `DB_HOST` | Where's the database? | `postgres` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `rbac_user` |
| `DB_PASSWORD` | Database password | `rbac_password` |
| `DB_DATABASE` | Database name | `rbac_db` |
| `JWT_SECRET` | Secret for access tokens | **Change this!** |
| `JWT_EXPIRATION` | How long access tokens last | `15m` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | **Change this!** |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifetime | `7d` |

## � Best Practices We're Following

1. **Separation of Concerns** - Everything has its place: modules, services, controllers
2. **DTOs for Validation** - Type-safe data coming in and out
3. **Environment Config** - No hardcoded secrets (please change those defaults!)
4. **Password Hashing** - bcrypt with proper salt rounds
5. **Token Rotation** - Refresh tokens keep you secure and logged in
6. **Role-Based Auth** - Flexible system that's easy to extend
7. **Input Validation** - class-validator catches bad data before it causes problems
8. **Error Handling** - Proper HTTP exceptions with meaningful messages
9. **Database Abstraction** - TypeORM makes database operations clean
10. **Containerization** - Docker for consistent environments everywhere

## 📝 Handy Scripts

```bash
# Development with hot reload (changes update automatically)
npm run start:dev

# Development with debugger attached
npm run start:debug

# Build for production
npm run build

# Run in production mode
npm run start:prod

# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode (great for development!)
npm run test:watch

# Run E2E tests
npm run test:e2e

# Quick test script (runs all tests)
./run-tests.sh

# Check code quality
npm run lint

# Format your code nicely
npm run format
```

## 🧪 Testing

We've got comprehensive automated tests to ensure everything works perfectly!




Just run `npm test` and everything works! The production app still uses PostgreSQL - SQLite is only for testing.

### Test Coverage
- **~70 automated tests** covering all critical functionality
- **Unit tests** for services, guards, and strategies
- **E2E tests** for complete user flows and RBAC (using SQLite)
- **>90% code coverage** on critical paths

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage report
npm run test:cov

# Run E2E tests
npm run test:e2e

# Watch mode (auto-rerun on changes)
npm run test:watch

# Use the test runner script
./run-tests.sh all      # Run all tests
./run-tests.sh unit     # Unit tests only
./run-tests.sh e2e      # E2E tests only
./run-tests.sh cov      # With coverage
./run-tests.sh watch    # Watch mode
```

### What's Tested?

**Authentication Flow**
- User registration (valid/invalid data, duplicates)
- Login (correct/incorrect credentials)
- Token refresh mechanism
- Logout functionality

**Authorization (RBAC)**
- Admin-only routes (deny users/moderators)
- Admin & Moderator routes (deny regular users)
- Public authenticated routes (allow all logged-in users)
- Unauthenticated access (properly denied)

**Security**
- Password hashing
- Token validation
- Sensitive data not exposed
- Input validation

**Business Logic**
- User data management
- Role checks
- JWT strategy validation
- Service methods





Here's how to contribute:

1. **Fork** this repository
2. **Create a branch** (`git checkout -b feature/awesome-feature`)
3. **Make your changes** and test them
4. **Commit** your work (`git commit -m 'Add some awesome feature'`)
5. **Push** to your branch (`git push origin feature/awesome-feature`)
6. **Open a Pull Request** and describe what you've done


## License

This project is under the MIT License - basically, do what you want with it, just don't blame us if things go sideways!

## Questions? Issues?

- **Found a bug?** Open an issue!
- **Have a question?** Open a discussion!
- **Want a feature?** Let us know!

## Credits

Built with using:
- [NestJS](https://nestjs.com/) - The amazing framework
- [TypeORM](https://typeorm.io/) - Database ORM that doesn't make you cry
- [Passport](http://www.passportjs.org/) - Authentication middleware
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Keeping passwords safe

---

**Remember**: This is a demonstration project to show you how to build a secure auth system. While it follows best practices, always get a security expert to review your code before handling real user data in production. Stay safe out there!
