FROM node:22-alpine

WORKDIR /app
COPY . .

RUN npm i
RUN npx tsc
CMD ["npm", "start"]