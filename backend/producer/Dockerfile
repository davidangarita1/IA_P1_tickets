# ⚕️ HUMAN CHECK - Dockerfile del Producer
# Asegurarse de usar una versión LTS de Node.js

# --- Build-time knobs for npm ---
ARG NPM_FETCH_TIMEOUT=600000
ARG NPM_FETCH_RETRIES=5
ARG NPM_FETCH_RETRY_FACTOR=10

# --- Stage: development ---
FROM node:20-alpine AS development
ARG NPM_FETCH_TIMEOUT
ARG NPM_FETCH_RETRIES
ARG NPM_FETCH_RETRY_FACTOR
ENV NPM_CONFIG_FETCH_TIMEOUT=${NPM_FETCH_TIMEOUT}
ENV NPM_CONFIG_FETCH_RETRIES=${NPM_FETCH_RETRIES}
ENV NPM_CONFIG_FETCH_RETRY_FACTOR=${NPM_FETCH_RETRY_FACTOR}

WORKDIR /app

COPY producer/package*.json ./
RUN npm install --legacy-peer-deps \
    --fetch-retries=${NPM_FETCH_RETRIES} \
    --fetch-timeout=${NPM_FETCH_TIMEOUT}

# Copiar código fuente (en dev, volumes sobreescriben esto)
COPY producer/ .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# --- Stage: build ---
FROM node:20-alpine AS build
ARG NPM_FETCH_TIMEOUT
ARG NPM_FETCH_RETRIES
ARG NPM_FETCH_RETRY_FACTOR
ENV NPM_CONFIG_FETCH_TIMEOUT=${NPM_FETCH_TIMEOUT}
ENV NPM_CONFIG_FETCH_RETRIES=${NPM_FETCH_RETRIES}
ENV NPM_CONFIG_FETCH_RETRY_FACTOR=${NPM_FETCH_RETRY_FACTOR}

WORKDIR /app

COPY producer/package*.json ./
RUN npm install --legacy-peer-deps \
    --fetch-retries=${NPM_FETCH_RETRIES} \
    --fetch-timeout=${NPM_FETCH_TIMEOUT}

COPY producer/ .
RUN npm run build

# --- Stage: production ---
FROM node:20-alpine AS production
ARG NPM_FETCH_TIMEOUT
ARG NPM_FETCH_RETRIES
ARG NPM_FETCH_RETRY_FACTOR
ENV NPM_CONFIG_FETCH_TIMEOUT=${NPM_FETCH_TIMEOUT}
ENV NPM_CONFIG_FETCH_RETRIES=${NPM_FETCH_RETRIES}
ENV NPM_CONFIG_FETCH_RETRY_FACTOR=${NPM_FETCH_RETRY_FACTOR}

WORKDIR /app

COPY producer/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps \
    --fetch-retries=${NPM_FETCH_RETRIES} \
    --fetch-timeout=${NPM_FETCH_TIMEOUT}

COPY --from=build /app/dist ./dist

# ⚕️ HUMAN CHECK - Ejecutar como usuario no-root (requerimiento de inmutabilidad)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# ⚕️ HUMAN CHECK - Puerto expuesto
# Verificar que coincida con la variable de entorno PRODUCER_PORT
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
