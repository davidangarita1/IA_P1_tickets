# --- Stage: development ---
FROM node:22-alpine AS development

WORKDIR /app

COPY consumer/package*.json ./
RUN npm install

# Copiar código fuente (en dev, volumes sobreescriben esto)
COPY consumer/ .

CMD ["npm", "run", "start:dev"]

# --- Stage: build ---
FROM node:22-alpine AS build

WORKDIR /app

COPY consumer/package*.json ./
RUN npm install

COPY consumer/ .
RUN npm run build

# --- Stage: production ---
FROM node:22-alpine AS production

WORKDIR /app

COPY consumer/package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

# ⚕️ HUMAN CHECK - Ejecutar como usuario no-root (requerimiento de inmutabilidad)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

CMD ["node", "dist/main.js"]
