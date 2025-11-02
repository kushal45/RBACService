import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get the currently authenticated user profile' })
  @ApiOkResponse({ description: 'Profile retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  getProfile(@GetUser() user: User) {
    return {
      message: 'User profile retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiOkResponse({ description: 'List of users returned successfully' })
  @ApiForbiddenResponse({ description: 'Requires admin role' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  async getAllUsers(@GetUser() currentUser: User) {
    const users = await this.usersService.findAll();
    return {
      message: 'All users retrieved successfully',
      currentUser: {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      },
      users,
    };
  }

  @Get('admin-dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Access admin/moderator dashboard' })
  @ApiOkResponse({ description: 'Dashboard data returned successfully' })
  @ApiForbiddenResponse({ description: 'Requires admin or moderator role' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  getAdminDashboard(@GetUser() user: User) {
    return {
      message: 'Admin/Moderator dashboard accessed successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      dashboardData: {
        statistics: 'Admin statistics here',
        permissions: 'Full access granted',
      },
    };
  }

  @Get('user-dashboard')
  @ApiOperation({ summary: 'Access user dashboard' })
  @ApiOkResponse({ description: 'Dashboard data returned successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  getUserDashboard(@GetUser() user: User) {
    return {
      message: 'User dashboard accessed successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      dashboardData: {
        personalData: 'User specific data here',
      },
    };
  }
}
