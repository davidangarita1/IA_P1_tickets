# ⚕️ HUMAN CHECK - Dockerfile del Producer
# Asegurarse de usar una versión LTS de Node.js

# --- Stage: development ---
FROM node:22-alpine AS development

WORKDIR /app

RUN npm install -g pnpm

COPY producer/pnpm-lock.yaml ./
COPY producer/package.json ./
RUN pnpm install --legacy-peer-deps

# Copiar código fuente (en dev, volumes sobreescriben esto)
COPY producer/ .

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]

# --- Stage: build ---
FROM node:22-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY producer/pnpm-lock.yaml ./
COPY producer/package.json ./
RUN pnpm install --legacy-peer-deps

COPY producer/ .
RUN pnpm run build

# --- Stage: production ---
FROM node:22-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY producer/pnpm-lock.yaml ./
COPY producer/package.json ./
RUN pnpm install --legacy-peer-deps --prod

COPY --from=build /app/dist ./dist

# ⚕️ HUMAN CHECK - Ejecutar como usuario no-root (requerimiento de inmutabilidad)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# ⚕️ HUMAN CHECK - Puerto expuesto
# Verificar que coincida con la variable de entorno PRODUCER_PORT
EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
