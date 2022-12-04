# Pokemon Go API

## Simple fastify server to get Pokemon Go data from a excel file and serve it as a REST API with mongodb.

This is just a simple backend learning project to get Pokemon Go data from a excel file and serve it as a REST API with mongodb. Feel free to improve it and use it as you wish.

## How to use

- Install dependencies

```bash
pnpm install
```

- Add the mongodb connection string to the `.env` file

```bash
DATABASE_URL=[YOUR CONNECTION STRING]
```

- Now you can run the server 

```bash
pnpm dev # for development
pnpm build | start # for production
```

### The endpoints are
- `/list` - List all the pokemons
- `/pokemon/:PokedexNumberOrName` - Get a pokemon by its pokedex number or name
