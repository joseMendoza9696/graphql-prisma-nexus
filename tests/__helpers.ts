// __ es para los snapshots
import { PrismaClient } from '@prisma/client';
import { ServerInfo } from "apollo-server";
import { execSync } from "child_process";
import getPort, { makeRange } from "get-port";
import { GraphQLClient } from "graphql-request";
import { nanoid } from "nanoid";
import { join } from "path";
import { Client } from "pg";
import { db } from "../api/db"
import { server } from "../api/server";

type TestContext = {
    client: GraphQLClient;
    db: PrismaClient;
};

export function createTestContext(): TestContext {
    let ctx = {} as TestContext;
    const graphqlCtx = graphqlTestContext();
    const prismaCtx = prismaTestContext();
    // esto es llamado antes de los tests
    beforeEach(async () => {
        const client = await graphqlCtx.before();
        const db = await prismaCtx.before();

        Object.assign(ctx, {
            client,
            db,
        });
    });
    // esto es llamado despues de los tests
    afterEach(async () => {
        await graphqlCtx.after();
        await prismaCtx.after();
    });
    return ctx;
}

function graphqlTestContext() {
    let serverInstance: ServerInfo | null = null;

    return {
        async before() {
            // obtiene un puerto aleatorio entre 4000 - 6000
            const port = await getPort({ port: makeRange(4000, 6000) });
            // inicia el servidor de graphql
            serverInstance = await server.listen({ port });
            serverInstance.server.on('close', async () => {
                db.$disconnect()
            })

            return new GraphQLClient(`http://localhost:${port}`);
        },

        async after() {
            // para el servidor graphql
            serverInstance?.server.close();
        },
    };
}

function prismaTestContext() {
    const prismaBinary = join(__dirname, "..", "node_modules", ".bin", "prisma");
    let schema = "";
    let databaseUrl = "";
    let prismaClient: null | PrismaClient = null;
    return {
        async before() {
            // Generate a unique schema identifier for this test context
            schema = `test_${nanoid()}`;
            // Generamos la cadena de conexión pg para el esquema de prueba
            databaseUrl = process.env.DATABASE_TESTING+`${schema}`;
            // Establecemos la variable de entorno requerida para contener la cadena de conexión
            // a nuestro esquema de prueba de base de datos
            process.env.DATABASE = databaseUrl;
            // Ejecutamos las migraciones para asegurarse de que nuestro esquema tenga la estructura requerida
            execSync(`${prismaBinary} db push --preview-feature`, {
                env: {
                    ...process.env,
                    DATABASE: databaseUrl,
                },
            });
            // Construimos un nuevo cliente Prisma conectado al esquema de Postgres generado
            prismaClient = new PrismaClient();
            return prismaClient;
        },

        async after() {
            // borramos la tabla despues de q los tests esten completos
            const client = new Client({
                connectionString: databaseUrl,
            });
            await client.connect();
            // borramos la tabla de la DB
            await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
            await client.end();
            // desconectamos el cliente de prisma
            await prismaClient?.$disconnect();
        },
    };
}
