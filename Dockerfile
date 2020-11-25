FROM node:13-alpine AS build

WORKDIR /app
COPY . /app

RUN apk add git
RUN npm install
RUN npm run build
RUN npm prune --production

FROM node:13

ARG APP_VERSION=undefined
ENV APP_VERSION $APP_VERSION
ENV ACCESS_LOG stdout

WORKDIR /app

COPY --from=build /app /app

EXPOSE 4000
USER node

CMD ["npx", "node", "./dist/index.js"]


