# AI Health Companion Demo

AI Health Companion is an interactive web application that provides personalized health and wellness guidance. It combines advanced AI technology with health expertise to offer:

- Personalized exercise recommendations
- Health and wellness chat assistance
- Insurance guidance and information
- Workout tracking and analysis

This demo showcases the integration of OpenAI's API with a modern web application stack built using Node.js, Fastify, and React.

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

### Using Pre-built Image from Azure Container Registry

Pull and run the pre-built image:
```bash
docker pull <azure-registry-server>/health-companion:latest
docker run -p 3000:3000 --env-file .env <azure-registry-server>/health-companion:latest
```

### Building Locally

1. Build the Docker image:
```bash
docker build -t health-companion .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env health-companion
```

Or with environment variables:
```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY="your-api-key" \
  -e HTTPS_PROXY="http://host.docker.internal:1087" \
  -e HTTP_PROXY="http://host.docker.internal:1087" \
  health-companion
```

Note: If you're using a proxy on your host machine, use `host.docker.internal` instead of `127.0.0.1` to access the host machine from within the container.

_Note:_ The `server.js` file uses [@fastify/vite](https://fastify-vite.dev/) to build and serve the Astro frontend contained in the `/client` folder. You can find the configuration in the [`vite.config.js` file](./vite.config.js)

## License

MIT
