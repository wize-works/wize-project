// src/server.ts

import './config/dotenv';

import express from 'express';
import { MongoClient } from 'mongodb';
import { createYoga } from 'graphql-yoga';
import { createServerSchema, createServerContext, registerSchemaRoutes, registerAdminRoutes } from '@wizeworks/graphql-factory-mongo';
import { logger } from './config/logger';
var cors = require('cors');

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const database = process.env.DB_NAME || 'wize-example';
const mongoClient = new MongoClient(MONGO_URI);
let currentSchemas: any = null;

const allowedOrigins = [
    'https://app.jobsight.co',
    'https://jobsight.co',
    'https://kzmpro8otme7p0t8em3m.lite.vusercontent.net'
];

const start = async () => {
    await mongoClient.connect();
    logger.info?.('MongoDB connected');
    logger.info?.(`Using database: ${database}`);

    const yoga = createYoga({
        graphqlEndpoint: '/graphql',
        schema: async ({ request }) => {
            if (!currentSchemas) {
                const apiKey: string = request.headers.get('wize-api-key') || '';
                currentSchemas = await createServerSchema(apiKey, mongoClient, database);
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
        graphiql: true
    });

    const app = express();
    app.use(express.json());

    const corsOptionsDelegate = function (req: { header: (arg0: string) => any; }, callback: (arg0: null, arg1: { origin: boolean; methods?: string[]; allowedHeaders?: string[]; credentials?: boolean; }) => void) {
        const origin = req.header('Origin');
        if (allowedOrigins.includes(origin)) {
            callback(null, {
                origin: true, // Reflect the request origin
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true
            });
        } else {
            callback(null, { origin: false }); // Disallow other origins
        }
    };
    app.use(cors(corsOptionsDelegate));

    registerSchemaRoutes(app, mongoClient, database);
    registerAdminRoutes(app, mongoClient, currentSchemas, database);

    // Use Yoga as middleware in Express
    app.use(yoga.graphqlEndpoint, yoga);

    app.listen(port, () => {
        console.log(`🚀 wize-example API ready at http://localhost:${port}/graphql`);
    });
};

start();
