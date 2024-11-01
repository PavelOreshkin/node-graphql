import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { getAllSchemas } from './schema.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const schema = getAllSchemas(fastify);

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
      });
    },
  });
};

export default plugin;
