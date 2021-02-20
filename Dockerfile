FROM node:14.5.0-alpine3.11
RUN apk add  --no-cache ffmpeg python

WORKDIR /usr/src/app

COPY . .
RUN npm install

RUN npm run build

CMD [ "npm", "start" ]
