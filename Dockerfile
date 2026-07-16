FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock ./
COPY frontend/package.json ./frontend/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN yarn install --frozen-lockfile

FROM deps AS build
COPY shared ./shared
COPY server ./server
RUN yarn workspace @agrospace/shared build && yarn workspace server build

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app/server

COPY package.json yarn.lock /app/
COPY server/package.json /app/server/
COPY shared/package.json /app/shared/
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/shared/dist /app/shared/dist
COPY --from=build /app/server/dist /app/server/dist

EXPOSE 3001
CMD ["node", "dist/index.js"]