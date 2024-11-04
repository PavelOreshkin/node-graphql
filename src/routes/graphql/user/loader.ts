import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export const userSubscribedToLoader = (prisma: PrismaClient) =>
  new DataLoader<string, unknown[]>(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        subscribedToUser: {
          some: {
            subscriberId: {
              in: ids as string[],
            },
          },
        },
      },
      include: {
        subscribedToUser: true,
      },
    });

    const subscribersByUserIdMap = users.reduce<Record<string, unknown[]>>(
      (result, user) => {
        user.subscribedToUser.forEach((subscription) => {
          result[subscription.subscriberId] = [];
          result[subscription.subscriberId].push(user);
        });
        return result;
      },
      {},
    );

    return ids.map((userId) => subscribersByUserIdMap[userId] || []);
  });

export const subscribedToUserLoader = (prisma: PrismaClient) =>
  new DataLoader<string, unknown[]>(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        userSubscribedTo: {
          some: {
            authorId: { in: ids as string[] },
          },
        },
      },
      include: {
        userSubscribedTo: true,
      },
    });

    const authorsByUserIdMap = users.reduce<Record<string, unknown[]>>((result, user) => {
      user.userSubscribedTo.forEach((subscription) => {
        result[subscription.authorId] = [];
        result[subscription.authorId].push(user);
      });
      return result;
    }, {});

    return ids.map((userId) => authorsByUserIdMap[userId] || []);
  });
