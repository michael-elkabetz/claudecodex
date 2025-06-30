FROM node:22-alpine AS build

WORKDIR /app

ENV VITE_GITHUB_CLIENT_ID=[VITE_GITHUB_CLIENT_ID]
ENV VITE_GITHUB_REDIRECT_URI=[VITE_GITHUB_REDIRECT_URI]

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]