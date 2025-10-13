import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailsService } from '../emails/emails.service.js';
import { Prisma, UserType } from '@prisma/client';
import * as crypto from 'crypto';
import {
  RESET_PASSWORD_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_DAYS,
} from './constants/token';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailsService: EmailsService,
  ) { }

  async requestForgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    // Always generate token, but only send if user exists to avoid email enumeration
    const token = await this.jwtService.signAsync(
      { email },
      { expiresIn: RESET_PASSWORD_TOKEN_EXPIRES_IN },
    );

    const baseUrl = process.env.BASE_FE_URL ?? 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    await this.emailsService.sendMail({
      to: user ? email : (process.env.MAIL_DEV_REDIRECT ?? email),
      subject: 'Reset your password',
      text: `Click the link to reset your password (valid 12h): ${resetLink}`,
      html: `<!doctype html>
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                      <title>Reset your password</title>
                      <style>
                        /* Base */
                        body { margin: 0; padding: 0; background-color: #0b1220; color: #e6eaf2; }
                        a { color: #4f8cff; text-decoration: none; }
                        img { border: none; -ms-interpolation-mode: bicubic; max-width: 100%; }
                        table { border-collapse: separate; width: 100%; }
                        .container { width: 100%; background-color: #0b1220; padding: 24px 0; }
                        .content { max-width: 560px; margin: 0 auto; background: #0f172a; border: 1px solid #1f2a44; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
                        .header { padding: 24px; border-bottom: 1px solid #1f2a44; display: flex; align-items: center; gap: 12px; }
                        .brand { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; font-size: 16px; color: #e6eaf2; letter-spacing: .2px; }
                        .badge { font-size: 11px; color: #aab3c5; background: #121a30; border: 1px solid #26324f; padding: 4px 8px; border-radius: 999px; }
                        .body { padding: 28px 24px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
                        h1 { margin: 0 0 12px; font-size: 20px; line-height: 1.3; color: #f3f6fc; }
                        p { margin: 0 0 14px; font-size: 14px; color: #c9d3e0; }
                        .cta { text-align: center; margin: 26px 0; }
                        .btn { display: inline-block; background: linear-gradient(135deg,#5b8cff,#8a7bff); color: #0b1220 !important; font-weight: 700; padding: 12px 18px; border-radius: 12px; border: 0; text-decoration: none; box-shadow: 0 6px 18px rgba(79,140,255,0.35); }
                        .btn:hover { filter: brightness(1.05); }
                        .muted { font-size: 12px; color: #9aa6bd; }
                        .hr { height: 1px; background: linear-gradient(90deg, rgba(38,50,79,0), #26324f, rgba(38,50,79,0)); border: 0; margin: 24px 0; }
                        .footer { padding: 20px 24px; text-align: center; color: #8b95a9; font-size: 12px; }
                        @media only screen and (max-width: 600px) { .body { padding: 22px 18px; } .header { padding: 18px; } }
                        @media (prefers-color-scheme: light) {
                          body { background: #f6f7fb; color: #0b1220; }
                          .container { background: #f6f7fb; }
                          .content { background: #ffffff; border-color: #e5e7ef; }
                          .header { border-color: #eef0f6; }
                          .brand { color: #0b1220; }
                          .badge { background: #f3f6fc; color: #334155; border-color: #e5e7ef; }
                          h1 { color: #0b1220; }
                          p { color: #364153; }
                          .muted { color: #5b6476; }
                        }
                      </style>
                    </head>
                    <body>
                      <div style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all">Reset your password (link valid for 12 hours)</div>
                      <div class="container">
                        <table role="presentation" class="content" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="header">
                              <div class="brand" style="font-size: 18px; color: #e6eaf2; letter-spacing: .2px; font-weight: 600;">Online Vina</div>
                              <span class="badge" style="margin-left: 10px;" >Security notice</span>
                            </td>
                          </tr>
                          <tr>
                            <td class="body">
                              <h1>Reset your password</h1>
                              <p>We received a request to reset the password for your account.</p>
                              <p>This link will be valid for 12 hours. If you did not request a password reset, you can safely ignore this email.</p>
                              <div class="cta">
                                <a class="btn" href="${resetLink}" target="_blank" rel="noopener">Reset password</a>
                              </div>
                              <hr class="hr" />
                              <p class="muted">Or copy and paste this link into your browser:</p>
                              <p class="muted"><a href="${resetLink}" target="_blank" rel="noopener">${resetLink}</a></p>
                            </td>
                          </tr>
                          <tr>
                            <td class="footer">
                              <div>
                                <span class="badge" style="display:inline-block;margin-bottom:8px;">© 2025 MoveOnThings Technology</span>
                                <p style="margin:0 0 10px;">All rights reserved.</p>
                              </div>
                              <div class="muted">You are receiving this email because a password reset was requested for this address.</div>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </body>
                  </html> `,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = this.jwtService.decode(token) as { email?: string } | null;
    const emailFromToken = decoded?.email;
    if (!emailFromToken) throw new BadRequestException('Email not found');

    const user = await this.prisma.user.findFirst({
      where: { email: emailFromToken },
    });
    if (!user?.id) return;

    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
  }

  async sendWelcome(email: string): Promise<void> {
    await this.emailsService.sendMail({
      to: email,
      subject: 'Welcome to Device Management',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<p>This is a <strong>test email</strong> to verify SMTP configuration.</p>',
    });
  }

  async register(email: string, password: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Tài khoản email đã tồn tại');
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Extract name from email (part before @)
    const name = email.split('@')[0];

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        user_type: UserType.client,
      },
    });

    return user;
  }

  async createUser(params: {
    email: string;
    password: string;
    name?: string | null;
    avatar?: string | null;
    user_type?: UserType | null;
    disabled?: boolean;
  }) {
    const { email, password, name, avatar, user_type, disabled } = params;
    const existingUser = await this.prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? email.split('@')[0],
        avatar: avatar ?? null,
        user_type: user_type ?? UserType.client,
        disabled: disabled ?? false,
      },
    });

    return created;
  }

  async updateUser(
    id: string,
    params: {
      email?: string;
      name?: string | null;
      avatar?: string | null;
      user_type?: UserType | null;
      disabled?: boolean;
    },
  ) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User không tồn tại');

    const data: any = {};
    if (typeof params.email !== 'undefined' && params.email !== target.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: params.email },
      });
      if (exists && exists.id !== id)
        throw new BadRequestException('Email đã tồn tại');
      data.email = params.email;
    }
    if (typeof params.name !== 'undefined') data.name = params.name;
    if (typeof params.avatar !== 'undefined') data.avatar = params.avatar;
    if (typeof params.user_type !== 'undefined')
      data.user_type = params.user_type;
    if (typeof params.disabled !== 'undefined') data.disabled = params.disabled;

    const updated = await this.prisma.user.update({ where: { id }, data });
    return updated;
  }

  async setUserDisabled(id: string, disabled: boolean) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User không tồn tại');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { disabled } as any,
    });

    if (disabled) {
      // revoke all refresh tokens upon disabling
      await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    }

    return updated;
  }

  async deleteUser(id: string) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User không tồn tại');
    await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });
    return true;
  }

  async listUsers(params?: {
    q?: string;
    page?: number;
    page_size?: number;
    active?: boolean;
    user_type?: UserType;
  }) {
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.max(1, Math.min(200, params?.page_size ?? 20));
    const skip = (page - 1) * pageSize;

    // Build where clause with filters
    const whereConditions: Prisma.UserWhereInput[] = [];

    // Search condition
    if (params?.q) {
      whereConditions.push({
        OR: [
          {
            name: {
              contains: params.q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            email: {
              contains: params.q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      });
    }

    // Active filter
    if (params?.active !== undefined) {
      whereConditions.push({
        disabled: !params.active,
      });
    }

    // User type filter
    if (params?.user_type) {
      whereConditions.push({
        user_type: params.user_type,
      });
    }

    const where: Prisma.UserWhereInput | undefined =
      whereConditions.length > 0 ? { AND: whereConditions } : undefined;

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { email: 'asc' },
        skip,
        take: pageSize,
        include: {
          refreshTokens: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const items = users.map((u: any) => {
      const { password, ...rest } = u;
      const lastLoginAt = rest.refreshTokens?.[0]?.createdAt ?? null;
      const { refreshTokens, ...safe } = rest;
      return { ...safe, lastLoginAt };
    });

    return { total, page, page_size: pageSize, results: items };
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    const { password, ...rest } = user;
    return rest;
  }

  async getUserStats() {
    const [totalUsers, activeUsers, adminUsers, disabledUsers] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { disabled: false } }),
        this.prisma.user.count({ where: { user_type: 'admin' } }),
        this.prisma.user.count({ where: { disabled: true } }),
      ]);

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      disabledUsers,
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Sai email hoặc password');
    }

    if ((user as any).disabled) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hoá');
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai email hoặc password');
    }

    // Generate access token
    const access_token = await this.jwtService.signAsync(
      { userId: user.id, email: user.email },
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );

    // Generate refresh token
    const refreshTokenValue = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    // Save refresh token to database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      access_token,
      refresh_token: refreshTokenValue,
    };
  }

  async refreshToken(refreshToken: string) {
    // Find refresh token in database
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      // Delete expired token
      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    // Generate new access token
    const access_token = await this.jwtService.signAsync(
      { userId: tokenRecord.user.id, email: tokenRecord.user.email },
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );

    // Generate new refresh token
    const newRefreshTokenValue = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    // Save new refresh token to database
    await this.prisma.refreshToken.create({
      data: {
        token: newRefreshTokenValue,
        userId: tokenRecord.user.id,
        expiresAt,
      },
    });

    return {
      access_token,
      refresh_token: newRefreshTokenValue,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // Find refresh token in database
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    // If token exists, delete it
    if (tokenRecord) {
      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
    }

    // Always return success, even if token doesn't exist
    // This prevents information leakage about token validity
  }
}
