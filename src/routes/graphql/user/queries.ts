import { GraphQLList, GraphQLNonNull } from 'graphql';
import { User } from './types.js';
import { ContextType } from '../common/types.js';
import { UUIDType } from '../uuid/types.js';

export const userQuery = {
  type: User,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_source, args: { id: string }, context: ContextType) =>
    context.prisma.user.findUnique({ where: { id: args.id } }),
};

export const usersQuery = {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
  resolve: (_source, _args, context: ContextType) => context.prisma.user.findMany(),
};
