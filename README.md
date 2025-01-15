# AI Health Companion Demo

## Installation and usage

```bash
cp .env.example .env
```

Running this application locally requires [Node.js](https://nodejs.org/) to be installed. Install dependencies for the application with:

```bash
npm install
```

Start the application server with:

```bash
npm run dev
```

This should start the console application on [http://localhost:3000](http://localhost:3000).

_Note:_ The `server.js` file uses [@fastify/vite](https://fastify-vite.dev/) to build and serve the Astro frontend contained in the `/client` folder. You can find the configuration in the [`vite.config.js` file](./vite.config.js)

## Previous WebSockets version

The previous version of this application that used WebSockets on the client (not recommended in client-side browsers) [can be found here](https://github.com/openai/openai-realtime-console/tree/websockets).

## License

MIT
