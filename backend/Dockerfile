FROM node:22-slim

RUN apt-get update && apt-get install -y \
    curl \
    ripgrep \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appgroup && useradd -r -m -s /bin/false -g appgroup appuser

RUN npm install -g @anthropic-ai/claude-code
RUN npm install -g @openai/codex

WORKDIR /usr/src/app

ENV GITHUB_CLIENT_SECRET=[GITHUB_CLIENT_SECRET]
ENV GITHUB_TOKEN=[GITHUB_TOKEN]

COPY package*.json ./

RUN npm install

COPY . .

RUN rm -f *.tsbuildinfo && \
    npm run build && \
    ls -la dist/ && \
    test -f dist/index.js || (echo "Build failed: dist/index.js not found" && exit 1)

RUN chown -R appuser:appgroup /usr/src/app
USER appuser

EXPOSE 3000

CMD [ "npm", "start" ]