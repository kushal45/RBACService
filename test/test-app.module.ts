import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { User } from '../src/entities/user.entity';

/**
 * Test Application Module for E2E Tests
 * Uses SQLite in-memory database instead of PostgreSQL
 * This makes tests faster and eliminates external dependencies
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
      ignoreEnvFile: true, // Don't require .env.test file
      load: [
        () => ({
          // Test configuration
          JWT_SECRET: 'test-secret-key-for-e2e-tests',
          JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-e2e-tests',
          JWT_EXPIRATION: '15m',
          JWT_REFRESH_EXPIRATION: '7d',
          NODE_ENV: 'test',
        }),
      ],
    }),
    // SQLite in-memory database for tests
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [User],
      synchronize: true,
      dropSchema: true,
      logging: false,
    }),
    AuthModule,
    UsersModule,
  ],
})
export class TestAppModule {}
