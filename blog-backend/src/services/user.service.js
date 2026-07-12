const prisma = require('../config/database');

class UserService {
  static async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return this.excludePassword(user);
  }

  static async updateUser(id, data) {
    // Check if username is taken
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: data.username, id: { not: id } },
      });
      if (existing) {
        throw new Error('Username is already taken');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return this.excludePassword(user);
  }

  static async followUser(followerId, authorId) {
    if (followerId === authorId) {
      throw new Error('Cannot follow yourself');
    }

    const existingFollow = await prisma.authorFollow.findFirst({
      where: { follower_id: followerId, author_id: authorId },
    });

    if (existingFollow) {
      return { message: 'Already following this author' };
    }

    await prisma.$transaction([
      prisma.authorFollow.create({
        data: { follower_id: followerId, author_id: authorId },
      }),
      prisma.user.update({
        where: { id: authorId },
        data: { followersCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      }),
    ]);

    return { message: 'Successfully followed author' };
  }

  static async unfollowUser(followerId, authorId) {
    const existingFollow = await prisma.authorFollow.findFirst({
      where: { follower_id: followerId, author_id: authorId },
    });

    if (!existingFollow) {
      return { message: 'Not following this author' };
    }

    await prisma.$transaction([
      prisma.authorFollow.delete({
        where: { id: existingFollow.id },
      }),
      prisma.user.update({
        where: { id: authorId },
        data: { followersCount: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Successfully unfollowed author' };
  }

  static excludePassword(user) {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = UserService;
