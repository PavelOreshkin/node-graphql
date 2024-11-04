import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { memberTypeQuery, memberTypesQuery } from './memberType/queries.js';
import { postQuery, postsQuery } from './post/queries.js';
import { profileQuery, profilesQuery } from './profiles/queries.js';
import { userQuery, usersQuery } from './user/queries.js';
import { changePost, createPost, deletePost } from './post/mutations.js';
import {
  changeUser,
  createUser,
  deleteUser,
  subscribeTo,
  unsubscribeFrom,
} from './user/mutations.js';
import { changeProfile, createProfile, deleteProfile } from './profiles/mutations.js';

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    memberType: memberTypeQuery,
    post: postQuery,
    profile: profileQuery,
    user: userQuery,
    memberTypes: memberTypesQuery,
    users: usersQuery,
    posts: postsQuery,
    profiles: profilesQuery,
  },
});

const Mutations = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost,
    createUser,
    createProfile,
    deletePost,
    deleteProfile,
    deleteUser,
    changePost,
    changeProfile,
    changeUser,
    subscribeTo,
    unsubscribeFrom,
  },
});

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutations,
});
