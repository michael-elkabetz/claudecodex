FROM node:22-alpine AS build

WORKDIR /app

# Environment variables for Vite build - these should be set by the deployment platform
ARG VITE_API_URL
ARG VITE_GITHUB_CLIENT_ID
ARG VITE_GITHUB_REDIRECT_URI

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GITHUB_CLIENT_ID=${VITE_GITHUB_CLIENT_ID}
ENV VITE_GITHUB_REDIRECT_URI=${VITE_GITHUB_REDIRECT_URI}

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]