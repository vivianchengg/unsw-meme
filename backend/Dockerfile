FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3234

EXPOSE $PORT

CMD ["npm", "start"]