# Development Guide

This guide will help you understand how to develop and extend this RBAC service.

## Development Environment Setup

### Option 1: Docker (Recommended for consistency)

```bash
# Start in development mode with hot-reload and debugging
docker-compose up -d

# Attach debugger (VS Code: F5 → "Docker: Attach to Node")
# Debug port: 9229
```

**Benefits:**
-  Consistent environment across all machines
-  Database automatically set up
-  Hot-reload enabled
-  Debug-ready on port 9229

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Make sure PostgreSQL is running locally
# Update .env: DB_HOST=localhost

# Run in dev mode
npm run start:dev

# Or with debugging
npm run start:debug
```

## Project Structure Deep Dive

src/
├── auth/                       # Authentication & Authorization
│   ├── dto/                    # Request/Response data shapes
│   │   ├── register.dto.ts     # Registration validation
│   │   ├── login.dto.ts        # Login validation
│   │   └── refresh-token.dto.ts
│   ├── guards/                 # Security checkpoints
│   │   ├── jwt-auth.guard.ts   # Validates access tokens
│   │   └── jwt-refresh.guard.ts
│   ├── strategies/             # Passport authentication strategies
│   │   ├── jwt.strategy.ts     # How to validate access tokens
│   │   └── jwt-refresh.strategy.ts
│   ├── auth.controller.ts      # API endpoints
│   ├── auth.service.ts         # Business logic
│   └── auth.module.ts          # Module configuration
│
├── users/                      # User Management
│   ├── users.controller.ts     # User endpoints
│   ├── users.service.ts        # User operations
│   └── users.module.ts
│
├── common/                     # Shared Resources
│   ├── decorators/
│   │   ├── roles.decorator.ts  # @Roles() - Mark required roles
│   │   └── get-user.decorator.ts # @GetUser() - Extract user from request
│   ├── enums/
│   │   └── user-role.enum.ts   # USER, ADMIN, MODERATOR
│   └── guards/
│       └── roles.guard.ts      # Check if user has required role
│
├── database/                   # 💾 Database Configuration
│   └── database.module.ts      # TypeORM setup
│
├── entities/                   # 📊 Database Models
│   └── user.entity.ts          # User table schema
│
├── app.module.ts               # Main app configuration
└── main.ts                     # Application bootstrap
```

## Adding a New Feature

### Example: Add a "Profile Update" Feature

**Step 1: Create a DTO**
```typescript
// src/users/dto/update-profile.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
```

**Step 2: Update the Entity**
```typescript
// src/entities/user.entity.ts
@Column({ nullable: true })
firstName: string;

@Column({ nullable: true })
lastName: string;
```

**Step 3: Add Service Method**
```typescript
// src/users/users.service.ts
async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
  await this.userRepository.update(userId, updateProfileDto);
  return this.findOne(userId);
}
```

**Step 4: Add Controller Endpoint**
```typescript
// src/users/users.controller.ts
@Patch('profile')
@UseGuards(JwtAuthGuard)
async updateProfile(
  @GetUser('id') userId: string,
  @Body() updateProfileDto: UpdateProfileDto,
) {
  return this.usersService.updateProfile(userId, updateProfileDto);
}
```


## Common Development Tasks

### Adding a New Role

1. Update the enum:
```typescript
// src/common/enums/user-role.enum.ts
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPER_ADMIN = 'super_admin', // ← New role
}
```

2. Use it in your controllers:
```typescript
@Get('super-admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
getSuperAdminStuff() {
  return { secret: 'Very secret stuff' };
}
```

### Creating a Protected Endpoint

```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)  // ← Requires valid JWT
getProtectedData(@GetUser() user: User) {
  return { message: `Hello ${user.email}!` };
}
```

### Creating a Role-Protected Endpoint

```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)  // ← Both guards needed
@Roles(UserRole.ADMIN)                 // ← Specify required role
getAdminData() {
  return { adminData: 'Secret admin stuff' };
}
```

### Multiple Allowed Roles

```typescript
@Get('staff-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)  // ← Either role works
getStaffData() {
  return { data: 'Staff data' };
}
```

## Testing Your Changes

### Manual Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Use the token
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Unit Tests (TODO)

```bash
npm run test
```

### E2E Tests (TODO)

```bash
npm run test:e2e
```

## Debugging Tips

### 1. VS Code Breakpoints
- Set breakpoints in your code (click left of line numbers)
- Attach debugger: F5 → "Docker: Attach to Node"
- Trigger the endpoint
- Code pauses at breakpoint!

### 2. Console Logging
```typescript
console.log('User data:', user);
console.log('JWT payload:', payload);
```

### 3. Database Queries
Enable query logging in `database.module.ts`:
```typescript
logging: true,  // ← See all SQL queries
```

### 4. Check Logs
```bash
docker-compose logs -f app
```

## Environment Variables

Create different `.env` files for different environments:

```bash
.env                 # Development (default)
.env.test           # Testing
.env.production     # Production
```

Load them:
```bash
NODE_ENV=production docker-compose -f docker-compose.prod.yml up
```

## Database Migrations

When you change entities:

```bash
# Auto-sync in development (already enabled)
# TypeORM will update the database automatically

# For production, use migrations:
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

## Code Style

We use Prettier and ESLint:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes and commit
git add .
git commit -m "Add amazing new feature"

# Push and create PR
git push origin feature/my-new-feature
```

## Performance Tips

1. **Use Select**: Don't fetch unnecessary fields
```typescript
const users = await this.userRepository.find({
  select: ['id', 'email', 'role'],
});
```

2. **Use Indexes**: Already on email field
```typescript
@Column({ unique: true })
@Index()
email: string;
```

3. **Pagination**: For large datasets
```typescript
const users = await this.userRepository.find({
  skip: (page - 1) * limit,
  take: limit,
});
```

## Security Checklist

- Never log sensitive data (passwords, tokens)
- Always validate input (using DTOs)
- Use parameterized queries (TypeORM does this)
- Hash passwords (bcrypt with salt)
- Use HTTPS in production
- Implement rate limiting (TODO)
- Keep dependencies updated

## Useful Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [class-validator Decorators](https://github.com/typestack/class-validator)

## Getting Help

1. Check the logs
2. Read the error message carefully
3. Google the error
4. Check GitHub issues
5. Ask the community!

