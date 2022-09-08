#######################################################################################################################
# docker:
# docker build -f ./apps/api/Dockerfile . -t fx/project-api
# docker run -p 3333:3333 fx/project-api
#
# docker compose:
# docker compose build api
# docker compose up --build api
# docker compose up api
#######################################################################################################################

FROM node:16.17-alpine AS DEPS

ENV NEXT_TELEMETRY_DISABLED 1

RUN apk update && apk upgrade && apk --no-cache add curl bash python3 g++ make libc6-compat

USER node
WORKDIR /usr/src/app

COPY --chown=node:node .yarnrc.yml ./
COPY --chown=node:node .yarn .yarn

COPY --chown=node:node package*.json yarn.lock ./
COPY --chown=node:node nx.json workspace.json ./

RUN yarn install --immutable --inline-builds

COPY --chown=node:node . .

RUN npx dotenv -e apps/api/.env npx prisma generate --schema apps/api/prisma/schema.prisma

RUN yarn build:api:prod

# #######################################################################################################################

FROM node:16.17-alpine AS RUNNER

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apk update && apk upgrade && apk --no-cache add dumb-init

USER node
WORKDIR /usr/src/app

# approach 1) copy compiled api + node_modules + package.json
# COPY --chown=node:node --from=DEPS /usr/src/app/dist ./dist
# COPY --chown=node:node --from=DEPS /usr/src/app/node_modules ./node_modules
# COPY --chown=node:node --from=DEPS /usr/src/app/dist/apps/api/package*.json ./

# approach 2) copy compiled api + yarn + api build's package.json + yarn.lock + install prod deps only
COPY --chown=node:node --from=DEPS /usr/src/app/dist ./dist
COPY --chown=node:node --from=DEPS /usr/src/app/dist/apps/api/package*.json ./
COPY --chown=node:node --from=DEPS /usr/src/app/.yarn/plugins .yarn/plugins
COPY --chown=node:node --from=DEPS /usr/src/app/.yarn/releases .yarn/releases
COPY --chown=node:node --from=DEPS /usr/src/app/.yarnrc.yml ./
COPY --chown=node:node --from=DEPS /usr/src/app/yarn.lock ./
RUN yarn workspaces focus --all --production

EXPOSE 3333

CMD [ "dumb-init", "node", "dist/apps/api/main.js" ]
