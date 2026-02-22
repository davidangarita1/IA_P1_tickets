# ⚕️ HUMAN CHECK - Dockerfile del Producer
# Build context = ./backend (para acceder a shared/)
# Asegurarse de usar una versión LTS de Node.js

# --- Stage: development ---
FROM node:20-slim AS development

WORKDIR /app

COPY producer/package*.json ./
RUN npm install --legacy-peer-deps

# Copiar código fuente (en dev, volumes sobreescriben esto)
COPY producer/ .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# --- Stage: build ---
FROM node:20-slim AS build

WORKDIR /app

COPY producer/package*.json ./
RUN npm install --legacy-peer-deps

COPY producer/ .
RUN npm run build

# --- Stage: production ---
FROM node:20-slim AS production

WORKDIR /app

# ⚕️ HUMAN CHECK - En producción, shared se copia para resolver el symlink file:../shared
COPY shared/ ./shared/
COPY producer/package*.json ./producer/
WORKDIR /workspace/producer
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=build /workspace/producer/dist ./dist

# ⚕️ HUMAN CHECK - Puerto expuesto
# Verificar que coincida con la variable de entorno PRODUCER_PORT
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
