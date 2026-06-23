import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Generate a default dicebear avatar
    const avatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${userData.username}&backgroundColor=b6e3f4`;

    const user = await this.usersService.create({
      name: userData.name,
      username: userData.username,
      email: userData.email,
      password_hash: hashedPassword,
      avatar: avatar,
      bio: '',
    });

    const { password_hash, ...result } = user;
    return this.login(result);
  }
}
