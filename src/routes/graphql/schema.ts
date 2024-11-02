import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
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

  const CreatePostInput = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
  });

  const CreateUserInput = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
    },
  });

  const CreateProfileInput = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: {
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      userId: { type: new GraphQLNonNull(UUIDType) },
      memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
    },
  });

  const ChangePostInput = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: {
      title: { type: GraphQLString },
      content: { type: GraphQLString },
    },
  });

  const ChangeProfileInput = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: {
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      memberTypeId: { type: MemberTypeId },
    },
  });

  const ChangeUserInput = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: {
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat },
    },
  });

  const GraphQLVoid = new GraphQLScalarType({
    name: 'Void',
    serialize: () => null,
    parseValue: () => null,
    parseLiteral: () => null,
  });

  const Mutations = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createPost: {
        type: new GraphQLNonNull(Post),
        args: {
          dto: { type: new GraphQLNonNull(CreatePostInput) },
        },
        async resolve(
          _,
          args: { dto: { title: string; content: string; authorId: string } },
        ) {
          return await prisma.post.create({
            data: args?.dto,
          });
        },
      },
      createUser: {
        type: new GraphQLNonNull(User),
        args: {
          dto: { type: new GraphQLNonNull(CreateUserInput) },
        },
        async resolve(_, args: { dto: { name: string; balance: number } }) {
          return await prisma.user.create({
            data: args?.dto,
          });
        },
      },
      createProfile: {
        type: new GraphQLNonNull(Profile),
        args: {
          dto: { type: new GraphQLNonNull(CreateProfileInput) },
        },
        async resolve(
          _,
          args: {
            dto: {
              isMale: boolean;
              yearOfBirth: number;
              userId: string;
              memberTypeId: string;
            };
          },
        ) {
          return await prisma.profile.create({
            data: args?.dto,
          });
        },
      },
      deletePost: {
        type: GraphQLVoid,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        async resolve(_, args: { id: string }) {
          await prisma.post.delete({
            where: {
              id: args.id,
            },
          });
        },
      },
      deleteProfile: {
        type: GraphQLVoid,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        async resolve(_, args: { id: string }) {
          await prisma.profile.delete({
            where: {
              id: args.id,
            },
          });
        },
      },
      deleteUser: {
        type: GraphQLVoid,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        async resolve(_, args: { id: string }) {
          await prisma.user.delete({
            where: {
              id: args.id,
            },
          });
        },
      },
      changePost: {
        type: new GraphQLNonNull(Post),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangePostInput) },
        },
        async resolve(_, args: { id: string; dto: { title: string; content: string } }) {
          return prisma.post.update({
            where: { id: args.id },
            data: args?.dto,
          });
        },
      },
      changeProfile: {
        type: new GraphQLNonNull(Profile),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeProfileInput) },
        },
        async resolve(
          _,
          args: {
            id: string;
            dto: { isMale: boolean; yearOfBirth: number; memberTypeId: string };
          },
        ) {
          return prisma.profile.update({
            where: { id: args.id },
            data: args?.dto,
          });
        },
      },
      changeUser: {
        type: new GraphQLNonNull(User),
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeUserInput) },
        },
        async resolve(_, args: { id: string; dto: { name: string; balance: number } }) {
          return prisma.user.update({
            where: { id: args.id },
            data: args?.dto,
          });
        },
      },
      subscribeTo: {
        type: GraphQLVoid,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        async resolve(_, args: { userId: string; authorId: string }) {
          await prisma.subscribersOnAuthors.create({
            data: {
              subscriberId: args.userId,
              authorId: args.authorId,
            },
          });
        },
      },
      unsubscribeFrom: {
        type: GraphQLVoid,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        async resolve(_, args: { userId: string; authorId: string }) {
          await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });
        },
      },
    },
  });

  const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: Mutations,
  });

  return schema;
};
