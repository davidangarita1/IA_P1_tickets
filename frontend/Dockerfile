# ⚕️ HUMAN CHECK - Dockerfile del Frontend
# Asegurarse de usar una versión LTS de Bun

# --- Stage: development ---
FROM oven/bun:latest AS development

WORKDIR /app

COPY bun.lockb ./
COPY package.json ./
RUN bun install

COPY . .

EXPOSE 3001

CMD ["bun", "run", "dev", "--", "-p", "3001", "-H", "0.0.0.0"]

# --- Stage: build ---
FROM oven/bun:latest AS build

WORKDIR /app

# ⚕️ HUMAN CHECK - Build args para variables públicas de Next.js
# Estos deben especificarse en docker-compose o CLI
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
ARG NEXT_PUBLIC_WS_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

COPY bun.lockb ./
COPY package.json ./
RUN bun install

COPY . .

RUN bun run build

# --- Stage: production ---
# ⚕️ HUMAN CHECK - Imagen ligera y usuario no-root para producción
FROM oven/bun:latest AS production

WORKDIR /app

COPY bun.lockb ./
COPY package.json ./
RUN bun install --production

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./

# ⚕️ HUMAN CHECK - Ejecutar como usuario no-root (requerimiento de inmutabilidad)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# ⚕️ HUMAN CHECK - Puerto expuesto
# Verificar que coincida con la variable de entorno FRONTEND_PORT
EXPOSE 3001

CMD ["bun", "run", "start"]
