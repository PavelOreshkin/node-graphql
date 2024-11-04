/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';

export type ContextType = {
  loaders: any;
  prisma: PrismaClient;
};
