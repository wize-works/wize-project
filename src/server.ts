// src/server.ts

import './config/dotenv';

import express from 'express';
import { MongoClient } from 'mongodb';
import { createYoga } from 'graphql-yoga';
import {
    createServerSchema,
    createServerContext,
    registerSchemaRoutes,
    registerAdminRoutes,
} from '@wizeworks/graphql-factory-mongo';
import { logger } from './config/logger';
import { registerCors } from './config/cors';
import { useFormattedErrors } from './utils/formatError';
var cors = require('cors');

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const database = process.env.DB_NAME || 'wize-example';
const mongoClient = new MongoClient(MONGO_URI);
let currentSchemas: any = null;

const start = async () => {
    await mongoClient.connect();
    logger.info?.(`MongoDB connected ${MONGO_URI}`);
    logger.info?.(`Using database: ${database}`);

    const yoga = createYoga({
        graphqlEndpoint: '/graphql',
        schema: async ({ request }) => {
            if (!currentSchemas) {
                const apiKey: string =
                    request.headers.get('wize-api-key') || '';
                currentSchemas = await createServerSchema(
                    apiKey,
                    mongoClient,
                    database
                );
            }
            return currentSchemas;
        },
        context: async ({ request }) => {
            const baseContext = await createServerContext(request, mongoClient);
            return {
                ...baseContext,
                database,
            };
        },
        graphiql: true,
        maskedErrors: false,
        plugins: [useFormattedErrors()],
    });

    const app = express();
    app.use(express.json());

    registerCors(app);

    registerSchemaRoutes(app, mongoClient, database);
    registerAdminRoutes(app, mongoClient, currentSchemas, database);

    // Use Yoga as middleware in Express
    app.use(yoga.graphqlEndpoint, yoga);

    app.listen(port, () => {
        console.log(
            `🚀 wize-example API ready at http://localhost:${port}/graphql`
        );
    });
};

start();
