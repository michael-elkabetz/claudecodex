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
RUN rm -f package-lock.json && npm install --verbose
COPY backend/src ./src
COPY backend/tsconfig.json ./
# Build with verbose output and verification
RUN npm run build && \
    echo "Build completed, checking output..." && \
    ls -la dist/ && \
    test -f dist/index.js || (echo "Backend build failed: dist/index.js not found" && exit 1)

# Copy and build frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN rm -f package-lock.json && npm install --verbose
COPY frontend/ ./
# Build with verification
RUN npm run build && \
    echo "Frontend build completed, checking output..." && \
    ls -la dist/ && \
    test -f dist/index.html || (echo "Frontend build failed: dist/index.html not found" && exit 1)

WORKDIR /app/backend
RUN mkdir -p public
RUN cp -r ../frontend/dist/* public/

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
