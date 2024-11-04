import { GraphQLList, GraphQLNonNull } from 'graphql';
import { Profile } from './types.js';
import { ContextType } from '../common/types.js';
import { UUIDType } from '../uuid/types.js';

export const profileQuery = {
  type: Profile,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_source, args: { id: string }, context: ContextType) =>
    context.prisma.profile.findUnique({ where: { id: args.id } }),
};

export const profilesQuery = {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
  resolve: (_source, _args, context: ContextType) => context.prisma.profile.findMany(),
};
