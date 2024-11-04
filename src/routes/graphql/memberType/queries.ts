import { GraphQLList, GraphQLNonNull } from 'graphql';
import { MemberType, MemberTypeId } from './types.js';
import { MemberTypeId as MemberTypeIdEnum } from '../../member-types/schemas.js';
import { ContextType } from '../common/types.js';

export const memberTypeQuery = {
  type: MemberType,
  args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
  resolve: (_source, args: { id: MemberTypeIdEnum }, context: ContextType) =>
    context.prisma.memberType.findUnique({ where: { id: args.id } }),
};

export const memberTypesQuery = {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
  resolve: (_source, _args, context: ContextType) => context.prisma.memberType.findMany(),
};
