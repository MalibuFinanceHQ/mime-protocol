FROM node:12
WORKDIR /usr/src/app

USER root

COPY . .

RUN npm install -g ts-node nodemon typescript
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start:dev"]