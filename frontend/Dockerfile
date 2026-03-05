# ⚕️ HUMAN CHECK - Dockerfile del Frontend
# Asegurarse de usar una versión LTS de Node.js

# --- Stage: development ---
FROM node:20-slim AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev", "--", "-p", "3001", "-H", "0.0.0.0"]

# --- Stage: build ---
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage: production ---
# ⚕️ HUMAN CHECK - Imagen ligera y usuario no-root para producción
FROM node:20-slim AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./

# ⚕️ HUMAN CHECK - Ejecutar como usuario no-root (requerimiento de inmutabilidad)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# ⚕️ HUMAN CHECK - Puerto expuesto
# Verificar que coincida con la variable de entorno FRONTEND_PORT
EXPOSE 3001

CMD ["npm", "run", "start"]
