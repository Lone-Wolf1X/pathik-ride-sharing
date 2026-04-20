import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(phoneNumber: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { phoneNumber } });
    if (!user) {
      // For Pathik Simulation: Overboarding new users as CUSTOMER by default
      user = this.userRepository.create({
        phoneNumber,
        role: UserRole.CUSTOMER,
        isActive: true,
      });
      await this.userRepository.save(user);
    }
    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, phoneNumber: user.phoneNumber, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async switchRole(userId: string, newRole: UserRole) {
    await this.userRepository.update(userId, { role: newRole });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.login(user);
  }
}
