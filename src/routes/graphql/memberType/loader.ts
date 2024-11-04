import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export const memberTypeLoader = (prisma: PrismaClient) =>
  new DataLoader((ids) =>
    prisma.memberType.findMany({
      where: {
        profiles: {
          some: {
            memberTypeId: { in: ids as string[] },
          },
        },
      },
    }),
  );
