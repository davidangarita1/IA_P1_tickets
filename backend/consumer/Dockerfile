# --- Stage: development ---
FROM node:22-alpine AS development

WORKDIR /app

RUN npm install -g pnpm

COPY consumer/pnpm-lock.yaml ./
COPY consumer/package.json ./
RUN pnpm install

# Copiar código fuente (en dev, volumes sobreescriben esto)
COPY consumer/ .

CMD ["pnpm", "run", "start:dev"]

# --- Stage: build ---
FROM node:22-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY consumer/pnpm-lock.yaml ./
COPY consumer/package.json ./
RUN pnpm install

COPY consumer/ .
RUN pnpm run build

# --- Stage: production ---
FROM node:22-alpine AS production

WORKDIR /app

COPY consumer/pnpm-lock.yaml ./
COPY consumer/package.json ./
RUN npm install -g pnpm && pnpm install --prod

COPY --from=build /app/dist ./dist

# ⚕️ HUMAN CHECK - Ejecutar como usuario no-root (requerimiento de inmutabilidad)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

CMD ["node", "dist/main.js"]
