FROM node:22-alpine AS build
WORKDIR /app
# Optional: pass with `fly deploy --build-arg PUBLIC_SITE_URL=https://your-domain` to
# bake a different canonical hostname into the prerendered pages and client bundle.
# Falls back to the default in config/siteConfig.mjs (https://harba.fly.dev) if unset.
ARG PUBLIC_SITE_URL
ARG GOOGLE_SITE_VERIFICATION
ARG BING_SITE_VERIFICATION
ARG GA_MEASUREMENT_ID
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL
ENV GOOGLE_SITE_VERIFICATION=$GOOGLE_SITE_VERIFICATION
ENV BING_SITE_VERIFICATION=$BING_SITE_VERIFICATION
ENV GA_MEASUREMENT_ID=$GA_MEASUREMENT_ID
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY config ./config
COPY server ./server
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "server/index.js"]
