import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './schema.js';
import { memberTypeLoader } from './memberType/loader.js';
import { postLoader } from './post/loader.js';
import { profileLoader } from './profiles/loader.js';
import { subscribedToUserLoader, userSubscribedToLoader } from './user/loader.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, reply) {
      const documentAST = parse(req.body.query);
      const validationErrors = validate(schema, documentAST, [depthLimit(5)]);

      if (validationErrors.length > 0) {
        await reply.status(400).send({
          errors: validationErrors.map((err) => ({ message: err.message })),
        });
        return;
      }

      return graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: {
          prisma: prisma,
          loaders: {
            memberTypeLoader: memberTypeLoader(prisma),
            postLoader: postLoader(prisma),
            profileLoader: profileLoader(prisma),
            userSubscribedToLoader: userSubscribedToLoader(prisma),
            subscribedToUserLoader: subscribedToUserLoader(prisma),
          },
        },
      });
    },
  });
};

export default plugin;
