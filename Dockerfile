FROM node:24-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production


FROM node:24-alpine AS builder
WORKDIR /app

COPY . .
RUN npm install && npm run build


FROM gcr.io/distroless/nodejs24-debian12 AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

USER nonroot

EXPOSE 3020

CMD ["dist/server.js"]