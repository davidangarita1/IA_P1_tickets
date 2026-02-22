# --- Stage: development ---
FROM node:20-slim AS development

WORKDIR /app

COPY consumer/package*.json ./
RUN npm install

# Copiar código fuente (en dev, volumes sobreescriben esto)
COPY consumer/ .

CMD ["npm", "run", "start:dev"]

# --- Stage: build ---
FROM node:20-slim AS build

WORKDIR /app

COPY consumer/package*.json ./
RUN npm install

COPY consumer/ .
RUN npm run build

# --- Stage: production ---
FROM node:20-slim AS production

WORKDIR /app

COPY consumer/package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

CMD ["node", "dist/main.js"]
