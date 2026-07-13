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

  static async login({ email, password }: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id);
    return { user: this.excludePassword(user), token };
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
