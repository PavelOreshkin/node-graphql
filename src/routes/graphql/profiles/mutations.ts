import { GraphQLNonNull, GraphQLString } from 'graphql';
import { ChangeProfileInput, CreateProfileInput, Profile } from './types.js';
import { ContextType } from '../common/types.js';
import { UUIDType } from '../uuid/types.js';

export const createProfile = {
  type: new GraphQLNonNull(Profile),
  args: {
    dto: { type: new GraphQLNonNull(CreateProfileInput) },
  },
  resolve: (
    _source,
    args: {
      dto: {
        isMale: boolean;
        yearOfBirth: number;
        userId: string;
        memberTypeId: string;
      };
    },
    context: ContextType,
  ) => context.prisma.profile.create({ data: args.dto }),
};

export const changeProfile = {
  type: new GraphQLNonNull(Profile),
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangeProfileInput) },
  },
  resolve: (
    _source,
    args: {
      id: string;
      dto: { isMale: boolean; yearOfBirth: number; memberTypeId: string };
    },
    context: ContextType,
  ) => context.prisma.profile.update({ where: { id: args.id }, data: args?.dto }),
};

export const deleteProfile = {
  type: GraphQLString,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (_source, args: { id: string }, context: ContextType) => {
    await context.prisma.profile.delete({ where: { id: args.id } });
  },
};
