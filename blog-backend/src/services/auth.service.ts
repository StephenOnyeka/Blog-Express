import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import env from '../config/env';

class AuthService {
  static async register({ name, username, email, password }: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password_hash,
      },
    });

    const token = this.generateToken(user.id);
    return { user: this.excludePassword(user), token };
  }

  static async validateCredentials({ email, password }: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password_hash) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    return user;
  }

  static async login({ email, password }: { email: string; password: string }) {
    const user = await this.validateCredentials({ email, password });
    const token = this.generateToken(user.id);
    return { user: this.excludePassword(user), token };
  }

  static async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    const existingByGoogle = await prisma.user.findUnique({
      where: { google_id: profile.googleId },
    });
    if (existingByGoogle) {
      return existingByGoogle;
    }

    // Link Google to an existing local account with the same email
    const existingByEmail = await prisma.user.findUnique({
      where: { email: profile.email },
    });
    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: { google_id: profile.googleId },
      });
    }

    return prisma.user.create({
      data: {
        name: profile.name,
        username: await this.generateUniqueUsername(profile.email),
        email: profile.email,
        google_id: profile.googleId,
        provider: 'google',
        avatar: profile.avatar,
      },
    });
  }

  static async generateUniqueUsername(email: string) {
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40) || 'user';
    let candidate = base;
    let suffix = 0;
    // Loop until we find a free username
    while (await prisma.user.findUnique({ where: { username: candidate } })) {
      suffix += 1;
      candidate = `${base}${suffix}`;
    }
    return candidate;
  }

  static generateToken(userId: string) {
    return jwt.sign({ id: userId, sub: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  static excludePassword(user: Record<string, any>) {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default AuthService;
