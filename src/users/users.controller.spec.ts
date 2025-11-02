import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: '123',
    email: 'test@example.com',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser: Partial<User> = {
    id: '456',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const result = controller.getProfile(mockUser as User);

      expect(result.message).toBe('User profile retrieved successfully');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
    });

    it('should not include sensitive data', () => {
      const result = controller.getProfile(mockUser as User);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshToken');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users for admin', async () => {
      const mockUsers = [mockUser, mockAdminUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers(mockAdminUser as User);

      expect(result.message).toBe('All users retrieved successfully');
      expect(result.users).toEqual(mockUsers);
      expect(result.currentUser.role).toBe(UserRole.ADMIN);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getAdminDashboard', () => {
    it('should return admin dashboard for admin user', () => {
      const result = controller.getAdminDashboard(mockAdminUser as User);

      expect(result.message).toContain('Admin/Moderator dashboard');
      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(result.dashboardData).toBeDefined();
    });

    it('should return admin dashboard for moderator user', () => {
      const mockModeratorUser = { ...mockUser, role: UserRole.MODERATOR };
      const result = controller.getAdminDashboard(mockModeratorUser as User);

      expect(result.user.role).toBe(UserRole.MODERATOR);
      expect(result.dashboardData).toBeDefined();
    });
  });

  describe('getUserDashboard', () => {
    it('should return user dashboard', () => {
      const result = controller.getUserDashboard(mockUser as User);

      expect(result.message).toContain('User dashboard accessed successfully');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.dashboardData).toBeDefined();
      expect(result.dashboardData.personalData).toBeDefined();
    });
  });
});
