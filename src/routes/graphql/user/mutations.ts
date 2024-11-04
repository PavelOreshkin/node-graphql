import { GraphQLNonNull, GraphQLString } from 'graphql';
import { ChangeUserInput, CreateUserInput, User } from './types.js';
import { ContextType } from '../common/types.js';
import { UUIDType } from '../uuid/types.js';

export const createUser = {
  type: new GraphQLNonNull(User),
  args: {
    dto: { type: new GraphQLNonNull(CreateUserInput) },
  },
  resolve: (
    _source,
    args: { dto: { name: string; balance: number } },
    context: ContextType,
  ) => context.prisma.user.create({ data: args?.dto }),
};

export const changeUser = {
  type: new GraphQLNonNull(User),
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangeUserInput) },
  },
  resolve: (
    _source,
    args: { id: string; dto: { name: string; balance: number } },
    context: ContextType,
  ) => context.prisma.user.update({ where: { id: args.id }, data: args?.dto }),
};

export const deleteUser = {
  type: GraphQLString,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (_source, args: { id: string }, context: ContextType) => {
    await context.prisma.user.delete({ where: { id: args.id } });
  },
};

export const subscribeTo = {
  type: GraphQLString,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (
    _source,
    args: { userId: string; authorId: string },
    context: ContextType,
  ) => {
    await context.prisma.subscribersOnAuthors.create({
      data: {
        subscriberId: args.userId,
        authorId: args.authorId,
      },
    });
  },
};

export const unsubscribeFrom = {
  type: GraphQLString,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (
    _source,
    args: { userId: string; authorId: string },
    context: ContextType,
  ) => {
    await context.prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      },
    });
  },
};
