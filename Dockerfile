FROM node:25-alpine3.22
LABEL application="api antrian"
WORKDIR /antrian

# Application config
ENV APPLICATION_PORT=8082
ENV APPLICATION_HOST=0.0.0.0

COPY . .
RUN npm install
EXPOSE $APPLICATION_PORT/tcp
CMD ["npm", "run", "start"]