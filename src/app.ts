import Fastify from "fastify";
import readXslx from "read-excel-file/node";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();
const server = Fastify({ logger: true });

async function connectMongo() {
    if (!process.env.DATABASE_URL) return;

    return await mongoose.connect(process.env.DATABASE_URL, {
        loggerLevel: "info",
    });
}

async function importPokemonsFromXlsx() {
    const conn = await connectMongo();

    const pokemonCount = await conn?.connection.db
        .collection("Pokemons")
        .count();

    if (pokemonCount && pokemonCount > 0)
        return { error: "Pokemons already imported" };

    const data = await readXslx("./data.xlsx").then((rows) => {
        const pokemonDict = rows.shift();

        if (!pokemonDict) return null;

        //remove useless "Row" column
        pokemonDict.shift();

        return rows.map((row) => {
            const pokemon: Record<string, string> = {};

            //remove useless "Row" column
            row.shift();

            row.forEach((value, index) => {
                pokemon[pokemonDict[index] as string] = value as string;
            });

            return pokemon;
        });
    });

    if (!conn || !data) return;

    const res = await conn.connection.db
        .collection("Pokemons")
        .insertMany(data);

    return res;
}

server.get("/list", async (req) => {
    const conn = await connectMongo();

    const { limit } = req.query as { limit: string };

    const res = await conn?.connection.db
        .collection("Pokemons")
        .find()
        .limit(Number(limit) ?? -1)
        .toArray();
    return res;
});

server.get("/pokemon/:nameOrPokedexNumber", async (req, res) => {
    const conn = await connectMongo();

    const { nameOrPokedexNumber } = req.params as {
        nameOrPokedexNumber: string;
    };

    if (isNaN(Number(nameOrPokedexNumber))) {
        const pokemon = await conn?.connection.db
            .collection("Pokemons")
            .findOne({ Name: nameOrPokedexNumber });

        if (!pokemon) return res.code(404).send({ error: "Pokemon not found" });

        return pokemon;
    }

    const pokemon = await conn?.connection.db
        .collection("Pokemons")
        .findOne({ "Pokedex Number": Number(nameOrPokedexNumber) });

    if (!pokemon) return res.code(404).send({ error: "Pokemon not found" });

    return pokemon;
});

const start = async () => {
    try {
        importPokemonsFromXlsx();
        await server.listen({ port: 3000 });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
