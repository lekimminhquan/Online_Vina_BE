import {
  Body,
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RequestForgotPasswordDto } from './dto/request-forgot-password.dto';
import { SendWelcomeDto } from './dto/send-welcome.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { ListPaginatedResponse } from '../../utils/types/list-api';
import type { UserListItemDto } from './dto/user-list-item.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DisableUserDto } from './dto/disable-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('request-forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yêu cầu reset mật khẩu' })
  @ApiBody({ type: RequestForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Nếu email tồn tại, link reset đã được gửi',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'If the email exists, a reset link has been sent.',
        },
      },
    },
  })
  async requestForgotPassword(@Body() body: RequestForgotPasswordDto) {
    await this.usersService.requestForgotPassword(body.email);
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset mật khẩu' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Đổi mật khẩu thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
        },
      },
    },
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.usersService.resetPassword(body.token, body.newPassword);
    return {
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
    };
  }

  @Post('welcome')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi email welcome (test)' })
  @ApiBody({ type: SendWelcomeDto })
  @ApiResponse({
    status: 200,
    description: 'Đã gửi mail test',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Đã gửi mail test (nếu cấu hình SMTP đúng).',
        },
      },
    },
  })
  async sendWelcome(@Body() body: SendWelcomeDto) {
    await this.usersService.sendWelcome(body.email);
    return { message: 'Đã gửi mail test (nếu cấu hình SMTP đúng).' };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Đăng ký thành công' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string', nullable: true },
          },
        },
      },
    },
  })
  async register(@Body() body: RegisterDto) {
    const user = await this.usersService.register(body.email, body.password);
    return {
      message: 'Đăng ký thành công',
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Đăng nhập thành công' },
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  async login(@Body() body: LoginDto) {
    const result = await this.usersService.login(body.email, body.password);
    return {
      message: 'Đăng nhập thành công',
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Refresh token thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Refresh token thành công' },
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  async refreshToken(@Body() body: RefreshTokenDto) {
    const result = await this.usersService.refreshToken(body.refresh_token);
    return {
      message: 'Refresh token thành công',
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin user thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Lấy thông tin user thành công' },
        user: { type: 'object', description: 'Thông tin user' },
      },
    },
  })
  async getMe(@CurrentUser() user: User) {
    return {
      message: 'Lấy thông tin user thành công',
      user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Đăng xuất thành công' },
      },
    },
  })
  async logout(@Body() body: LogoutDto) {
    await this.usersService.logout(body.refresh_token);
    return {
      message: 'Đăng xuất thành công',
    };
  }

  // CRUD APIs
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo user thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tạo user thành công' },
        user: { type: 'object', description: 'Thông tin user đã tạo' },
      },
    },
  })
  async create(@Body() body: CreateUserDto) {
    const user = await this.usersService.createUser(body);
    return { message: 'Tạo user thành công', user };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách users' })
  @ApiQuery({ name: 'q', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang' })
  @ApiQuery({
    name: 'page_size',
    required: false,
    description: 'Số lượng bản ghi mỗi trang',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Lọc theo trạng thái active',
  })
  @ApiQuery({
    name: 'user_type',
    required: false,
    description: 'Lọc theo loại user',
    enum: ['admin', 'client', 'collaborator'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách user thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Lấy danh sách user thành công' },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            page_size: { type: 'number', example: 20 },
            results: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
  async list(
    @Query() query: UserListQueryDto,
  ): Promise<ListPaginatedResponse<UserListItemDto>> {
    const data = await this.usersService.listUsers({
      q: query.q,
      page: query.page,
      page_size: query.page_size,
      active: query.active,
      user_type: query.user_type,
    });
    return { message: 'Lấy danh sách user thành công', data };
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thống kê users' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê user thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Lấy thống kê user thành công' },
        data: { type: 'object', description: 'Thống kê users' },
      },
    },
  })
  async getStats() {
    const stats = await this.usersService.getUserStats();
    return { message: 'Lấy thống kê user thành công', data: stats };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy chi tiết user' })
  @ApiParam({
    name: 'id',
    description: 'ID của user (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết user thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Lấy chi tiết user thành công' },
        user: { type: 'object', description: 'Thông tin chi tiết user' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async detail(@Param('id') id: string) {
    const user = await this.usersService.getUserDetail(id);
    return { message: 'Lấy chi tiết user thành công', user };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật user' })
  @ApiParam({
    name: 'id',
    description: 'ID của user (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật user thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Cập nhật user thành công' },
        user: { type: 'object', description: 'Thông tin user đã cập nhật' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, body);
    return { message: 'Cập nhật user thành công', user };
  }

  @Patch(':id/disabled')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật trạng thái disabled của user' })
  @ApiParam({
    name: 'id',
    description: 'ID của user (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: DisableUserDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái user thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Cập nhật trạng thái user thành công',
        },
        user: { type: 'object', description: 'Thông tin user đã cập nhật' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async setDisabled(@Param('id') id: string, @Body() body: DisableUserDto) {
    const user = await this.usersService.setUserDisabled(id, body.disabled);
    return { message: 'Cập nhật trạng thái user thành công', user };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa user' })
  @ApiParam({
    name: 'id',
    description: 'ID của user (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa user thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Xóa user thành công' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async remove(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return { message: 'Xóa user thành công' };
  }
}
