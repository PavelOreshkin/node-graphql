import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export const postLoader = (prisma: PrismaClient) =>
  new DataLoader<string, unknown[]>(async (ids) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: ids as string[] },
      },
    });

    const postsByUserIdMap = posts.reduce<Record<string, unknown[]>>((result, post) => {
      result[post.authorId] = [];
      result[post.authorId].push(post);
      return result;
    }, {});

    return ids.map((authorId) => postsByUserIdMap[authorId] || []);
  });
