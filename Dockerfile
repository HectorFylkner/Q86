# Q86 — single-container deployment. Mount a persistent volume at /app/data;
# the entrypoint provisions the schema and seed bank on every boot (both are
# idempotent), so a fresh volume comes up ready to train.
FROM node:22-slim

WORKDIR /app
RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
