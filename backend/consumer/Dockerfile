# ⚕️ HUMAN CHECK - Dockerfile del Consumer
# Build context = ./backend (para acceder a shared/)
# Asegurarse de usar una versión LTS de Node.js compartida con el Producer

# --- Stage: development ---
# ⚕️ HUMAN CHECK - Stage de desarrollo para uso con docker-compose (hot-reload)
FROM node:20-slim AS development

# Estructura /workspace/consumer + /workspace/shared replica backend/ local
# para que "file:../shared" en package.json resuelva correctamente
WORKDIR /workspace

# Copiar shared primero (dependencia local del consumer)
COPY shared/ ./shared/
WORKDIR /workspace/shared
RUN npm run build

# Volver a /workspace antes de copiar consumer
WORKDIR /workspace

# Instalar dependencias del consumer
COPY consumer/package.json ./consumer/
COPY consumer/package-lock.json ./consumer/
WORKDIR /workspace/consumer
RUN npm install

# Copiar código fuente (en dev, volumes sobreescriben esto)
COPY consumer/ .

CMD ["npm", "run", "start:dev"]

# --- Stage: build ---
FROM node:20-slim AS build

WORKDIR /workspace

COPY shared/ ./shared/
WORKDIR /workspace/shared
RUN npm run build

# Volver a /workspace antes de copiar consumer
WORKDIR /workspace

COPY consumer/package.json ./consumer/
COPY consumer/package-lock.json ./consumer/
WORKDIR /workspace/consumer
RUN npm install

COPY consumer/ .
RUN npm run build

# --- Stage: production ---
FROM node:20-slim AS production

WORKDIR /workspace

# ⚕️ HUMAN CHECK - Compilar shared primero, luego copiar dist compilado
COPY shared/ ./shared/
WORKDIR /workspace/shared
RUN npm run build

# Volver a /workspace antes de copiar consumer
WORKDIR /workspace

COPY consumer/package.json ./consumer/
COPY consumer/package-lock.json ./consumer/
WORKDIR /workspace/consumer
RUN npm install --only=production

COPY --from=build /workspace/consumer/dist ./dist

# ⚕️ HUMAN CHECK - Variables de Entorno
# El Consumer no expone puerto HTTP necesariamente, pero se puede monitorear
# EXPOSE 3000

CMD ["node", "dist/main.js"]
