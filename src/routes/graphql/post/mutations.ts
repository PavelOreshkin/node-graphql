import { GraphQLNonNull, GraphQLString } from 'graphql';
import { ChangePostInput, CreatePostInput, Post } from './types.js';
import { ContextType } from '../common/types.js';
import { UUIDType } from '../uuid/types.js';

export const createPost = {
  type: new GraphQLNonNull(Post),
  args: {
    dto: { type: new GraphQLNonNull(CreatePostInput) },
  },
  resolve: (
    _source,
    args: { dto: { title: string; content: string; authorId: string } },
    context: ContextType,
  ) => context.prisma.post.create({ data: args.dto }),
};

export const changePost = {
  type: new GraphQLNonNull(Post),
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangePostInput) },
  },
  resolve: (
    _source,
    args: { id: string; dto: { title: string; content: string } },
    context: ContextType,
  ) => context.prisma.post.update({ where: { id: args.id }, data: args.dto }),
};

export const deletePost = {
  type: GraphQLString,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (_source, args: { id: string }, context: ContextType) => {
    await context.prisma.post.delete({ where: { id: args.id } });
  },
};
