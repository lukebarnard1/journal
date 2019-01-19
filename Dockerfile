FROM node:8

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production

COPY . .
RUN npm run-script build

EXPOSE 3000
CMD [ "npm", "run-script", "start" ]
