FROM node:19.5.0-alpine
LABEL application=api antrian
WORKDIR /antrian

# Application config
ENV APPLICATION_PORT=7001
ENV APPLICATION_HOST=0.0.0.0

COPY . .
RUN npm install
RUN npm install -g @infisical/cli
EXPOSE $APPLICATION_PORT/tcp
CMD ["sh", "-c", "infisical run --env=development -- npm run start"]