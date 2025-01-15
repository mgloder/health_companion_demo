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

## Docker Setup

### Building and Running with Docker

1. Build the Docker image:
```bash
docker build -t trustxai-app .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env trustxai-app
```

Or with environment variables:
```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY="your-api-key" \
  -e HTTPS_PROXY="http://host.docker.internal:1087" \
  -e HTTP_PROXY="http://host.docker.internal:1087" \
  trustxai-app
```

Note: If you're using a proxy on your host machine, use `host.docker.internal` instead of `127.0.0.1` to access the host machine from within the container.

_Note:_ The `server.js` file uses [@fastify/vite](https://fastify-vite.dev/) to build and serve the Astro frontend contained in the `/client` folder. You can find the configuration in the [`vite.config.js` file](./vite.config.js)

## Previous WebSockets version

The previous version of this application that used WebSockets on the client (not recommended in client-side browsers) [can be found here](https://github.com/openai/openai-realtime-console/tree/websockets).

## License

MIT
