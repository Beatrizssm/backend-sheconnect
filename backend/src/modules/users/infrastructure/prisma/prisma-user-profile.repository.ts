import { Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus as PrismaVerificationStatus } from '@prisma/client';
import { Role } from '../../../../domains/user/enums/role.enum';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { VerificationStatus } from '../../domain/enums/verification-status.enum';
import {
  RequestVerificationInput,
  UpdateUserProfileInput,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository';

@Injectable()
export class PrismaUserProfileRepository implements UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserProfileEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async update(id: string, data: UpdateUserProfileInput): Promise<UserProfileEntity> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined ? { name: data.fullName } : {}),
        ...(data.professionalName !== undefined ? { professionalName: data.professionalName } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.area !== undefined ? { area: data.area } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.state !== undefined ? { state: data.state } : {}),
        ...(data.linkedin !== undefined ? { linkedin: data.linkedin } : {}),
        ...(data.instagram !== undefined ? { instagram: data.instagram } : {}),
        ...(data.website !== undefined ? { website: data.website } : {}),
        ...(data.profileImage !== undefined ? { profileImage: data.profileImage } : {}),
      },
    });

    return this.toEntity(updated);
  }

  async submitVerificationRequest(id: string, data: RequestVerificationInput): Promise<UserProfileEntity> {
    const current = await this.prisma.user.findUnique({ where: { id } });

    if (!current) {
      throw new NotFoundException('User profile not found.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        verificationStatus: PrismaVerificationStatus.PENDING,
        verificationReason: null,
        ...(data.linkedin ? { linkedin: data.linkedin } : {}),
        ...(data.professionalInstagram ? { instagram: data.professionalInstagram } : {}),
        ...(data.companyWebsite ? { website: data.companyWebsite } : {}),
        ...(data.notes ? { verificationNotes: data.notes } : {}),
      },
    });

    return this.toEntity(updated);
  }

  async approveVerification(userId: string, adminId: string): Promise<UserProfileEntity> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: PrismaVerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: adminId,
        verificationReason: null,
      },
    });

    return this.toEntity(updated);
  }

  async rejectVerification(userId: string, adminId: string, reason: string): Promise<UserProfileEntity> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: PrismaVerificationStatus.REJECTED,
        verifiedAt: null,
        verifiedBy: adminId,
        verificationReason: reason,
      },
    });

    return this.toEntity(updated);
  }

  async listPendingVerifications(): Promise<UserProfileEntity[]> {
    const users = await this.prisma.user.findMany({
      where: { verificationStatus: PrismaVerificationStatus.PENDING },
      orderBy: { updatedAt: 'desc' },
    });

    return users.map((user) => this.toEntity(user));
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async getVerificationStatus(id: string): Promise<VerificationStatus | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { verificationStatus: true },
    });

    if (!user) {
      return null;
    }

    return user.verificationStatus as VerificationStatus;
  }

  private toEntity(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    professionalName: string | null;
    bio: string | null;
    area: string | null;
    city: string | null;
    state: string | null;
    linkedin: string | null;
    instagram: string | null;
    website: string | null;
    profileImage: string | null;
    verificationStatus: PrismaVerificationStatus;
    verifiedAt: Date | null;
    verifiedBy: string | null;
    verificationReason: string | null;
    verificationNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfileEntity {
    return UserProfileEntity.create({
      id: user.id,
      email: user.email,
      role: user.role as Role,
      fullName: user.name,
      professionalName: user.professionalName,
      bio: user.bio,
      area: user.area,
      city: user.city,
      state: user.state,
      linkedin: user.linkedin,
      instagram: user.instagram,
      website: user.website,
      profileImage: user.profileImage,
      verificationStatus: user.verificationStatus as VerificationStatus,
      verifiedAt: user.verifiedAt,
      verifiedBy: user.verifiedBy,
      verificationReason: user.verificationReason,
      verificationNotes: user.verificationNotes,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
