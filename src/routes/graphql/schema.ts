import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId as MemberTypeIdEnum } from '../member-types/schemas.js';
import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';

export const getAllSchemas = (
  fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    TypeBoxTypeProvider
  >,
) => {
  const { prisma } = fastify;

  const Post = new GraphQLObjectType({
    name: 'Post',
    fields: {
      id: { type: new GraphQLNonNull(UUIDType) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
    },
  });

  const MemberTypeId = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
      BASIC: { value: 'BASIC' },
      BUSINESS: { value: 'BUSINESS' },
    },
  });

  const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: {
      id: { type: new GraphQLNonNull(MemberTypeId) },
      discount: { type: new GraphQLNonNull(GraphQLFloat) },
      postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    },
  });

  const Profile = new GraphQLObjectType({
    name: 'Profile',
    fields: {
      id: { type: new GraphQLNonNull(UUIDType) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      memberType: { type: new GraphQLNonNull(MemberType) },
    },
  });

  const User: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
      profile: { type: Profile },
      posts: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))) },
      userSubscribedTo: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
        resolve: (parent: { id: string }) => {
          return prisma.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: parent.id,
                },
              },
            },
          });
        },
      },
      subscribedToUser: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
        resolve: (parent: { id: string }) => {
          return prisma.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: parent.id,
                },
              },
            },
          });
        },
      },
    }),
  });

  const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      memberType: {
        type: MemberType,
        args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
        async resolve(_, args: { id: MemberTypeIdEnum }) {
          return await prisma.memberType.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      post: {
        type: Post,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        async resolve(_, args: { id: string }) {
          return await prisma.post.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      profile: {
        type: Profile,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        async resolve(_, args: { id: string }) {
          return await prisma.profile.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      user: {
        type: User,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        async resolve(_, args: { id: string }) {
          return await prisma.user.findUnique({
            where: {
              id: args.id,
            },
            include: {
              posts: true,
              profile: { include: { memberType: true } },
              userSubscribedTo: { include: { author: true, subscriber: true } },
              subscribedToUser: { include: { author: true, subscriber: true } },
            },
          });
        },
      },
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
        async resolve() {
          return await prisma.memberType.findMany();
        },
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
        async resolve() {
          return await prisma.user.findMany({
            include: { posts: true, profile: { include: { memberType: true } } },
          });
        },
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
        async resolve() {
          return await prisma.post.findMany();
        },
      },
      profiles: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
        async resolve() {
          return await prisma.profile.findMany();
        },
      },
    },
  });

  const schema = new GraphQLSchema({
    query: RootQueryType,
    // mutation: Mutations
  });

  return schema;
};
