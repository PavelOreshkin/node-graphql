import { GraphQLList, GraphQLNonNull } from 'graphql';
import { Post } from './types.js';
import { ContextType } from '../common/types.js';
import { UUIDType } from '../uuid/types.js';

export const postQuery = {
  type: Post,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_source, args: { id: string }, context: ContextType) =>
    context.prisma.post.findUnique({ where: { id: args.id } }),
};

export const postsQuery = {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
  resolve: (_source, _args, context: ContextType) => context.prisma.post.findMany(),
};
