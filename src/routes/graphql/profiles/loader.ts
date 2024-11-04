import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export const profileLoader = (prisma: PrismaClient) =>
  new DataLoader<string, unknown>(async (ids) => {
    const profiles = await prisma.profile.findMany({
      where: {
        userId: { in: ids as string[] },
      },
    });

    const profilesByUserIdMap = profiles.reduce<Record<string, unknown>>(
      (result, profile) => ({ ...result, [profile.userId]: profile }),
      {},
    );

    return ids.map((userId) => profilesByUserIdMap[userId]);
  });
