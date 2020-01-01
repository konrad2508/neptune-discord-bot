FROM node:8.17.0-alpine3.11
RUN apk add  --no-cache ffmpeg python

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "start" ]
