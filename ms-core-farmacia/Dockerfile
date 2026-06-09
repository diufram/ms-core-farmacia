FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Run as non-root user for security (required by many enterprise container environments like ACA)
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "dist/main"]