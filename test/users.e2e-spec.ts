import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppModule } from './test-app.module';
import { Repository } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Users E2E Tests (RBAC)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userToken: string;
  let adminToken: string;
  let moderatorToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.clear();

    // Create and login regular user
    await request(app.getHttpServer()).post('/api/auth/register').send({
      email: 'user@example.com',
      password: 'UserPassword123',
      role: 'user',
    });

    const userLogin = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'UserPassword123',
    });
    userToken = userLogin.body.accessToken;

    // Create and login admin user
    await request(app.getHttpServer()).post('/api/auth/register').send({
      email: 'admin@example.com',
      password: 'AdminPassword123',
      role: 'admin',
    });

    const adminLogin = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'AdminPassword123',
    });
    adminToken = adminLogin.body.accessToken;

    // Create and login moderator user
    await request(app.getHttpServer()).post('/api/auth/register').send({
      email: 'moderator@example.com',
      password: 'ModeratorPassword123',
      role: 'moderator',
    });

    const moderatorLogin = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: 'moderator@example.com',
      password: 'ModeratorPassword123',
    });
    moderatorToken = moderatorLogin.body.accessToken;
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('User profile retrieved successfully');
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toBe('user@example.com');
          expect(res.body.user.role).toBe('user');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/api/users/profile').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should work for admin users too', () => {
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.user.email).toBe('admin@example.com');
          expect(res.body.user.role).toBe('admin');
        });
    });
  });

  describe('GET /api/users/user-dashboard', () => {
    it('should allow regular user access', () => {
      return request(app.getHttpServer())
        .get('/api/users/user-dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('User dashboard accessed successfully');
          expect(res.body.user.role).toBe('user');
        });
    });

    it('should allow admin access', () => {
      return request(app.getHttpServer())
        .get('/api/users/user-dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.user.role).toBe('admin');
        });
    });

    it('should allow moderator access', () => {
      return request(app.getHttpServer())
        .get('/api/users/user-dashboard')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.user.role).toBe('moderator');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/api/users/user-dashboard').expect(401);
    });
  });

  describe('GET /api/users/admin-dashboard (Admin & Moderator Only)', () => {
    it('should allow admin access', () => {
      return request(app.getHttpServer())
        .get('/api/users/admin-dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Admin/Moderator dashboard');
          expect(res.body.user.role).toBe('admin');
          expect(res.body.dashboardData).toBeDefined();
        });
    });

    it('should allow moderator access', () => {
      return request(app.getHttpServer())
        .get('/api/users/admin-dashboard')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.user.role).toBe('moderator');
        });
    });

    it('should deny regular user access', () => {
      return request(app.getHttpServer())
        .get('/api/users/admin-dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/api/users/admin-dashboard').expect(401);
    });
  });

  describe('GET /api/users/all (Admin Only)', () => {
    it('should allow admin to get all users', () => {
      return request(app.getHttpServer())
        .get('/api/users/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('All users retrieved successfully');
          expect(res.body.users).toBeDefined();
          expect(Array.isArray(res.body.users)).toBe(true);
          expect(res.body.users.length).toBeGreaterThan(0);
          expect(res.body.currentUser.role).toBe('admin');
        });
    });

    it('should deny moderator access', () => {
      return request(app.getHttpServer())
        .get('/api/users/all')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(403);
    });

    it('should deny regular user access', () => {
      return request(app.getHttpServer())
        .get('/api/users/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/api/users/all').expect(401);
    });

    it('should return all users in database', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body.users.length).toBe(3); // user, admin, moderator
      
      const emails = response.body.users.map((u: any) => u.email);
      expect(emails).toContain('user@example.com');
      expect(emails).toContain('admin@example.com');
      expect(emails).toContain('moderator@example.com');
    });
  });

  describe('RBAC Edge Cases', () => {
    it('should not expose sensitive data in user listings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/all')
        .set('Authorization', `Bearer ${adminToken}`);

      response.body.users.forEach((user: any) => {
        expect(user.password).toBeUndefined();
        expect(user.refreshToken).toBeUndefined();
      });
    });

    it('should handle multiple role checks correctly', async () => {
      // Admin should access admin-only route
      await request(app.getHttpServer())
        .get('/api/users/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Moderator should access admin dashboard but not all users
      await request(app.getHttpServer())
        .get('/api/users/admin-dashboard')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/users/all')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(403);
    });
  });
});
