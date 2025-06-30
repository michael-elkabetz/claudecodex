FROM node:22-slim

RUN apt-get update && apt-get install -y \
    curl \
    ripgrep \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appgroup && useradd -r -m -s /bin/false -g appgroup appuser

RUN npm install -g @anthropic-ai/claude-code
RUN npm install -g @openai/codex

WORKDIR /app

#ENV VITE_GITHUB_CLIENT_ID=[VITE_GITHUB_CLIENT_ID]
#ENV VITE_GITHUB_REDIRECT_URI=[VITE_GITHUB_REDIRECT_URI]
#ENV GITHUB_CLIENT_SECRET=[GITHUB_CLIENT_SECRET]
#ENV GITHUB_TOKEN=[GITHUB_TOKEN]
# ENV API_KEY

# Copy and build backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN rm -f package-lock.json && npm install
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

# Copy and build frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN rm -f package-lock.json && npm install
COPY frontend/ ./
RUN npm run build

WORKDIR /app/backend
RUN mkdir -p public
RUN cp -r ../frontend/dist/* public/

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
