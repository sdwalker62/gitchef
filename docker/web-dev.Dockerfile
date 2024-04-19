FROM node:21.7.1-bookworm

LABEL authors="Samuel Walker"
LABEL org.opencontainers.image.source=https://github.com/sdwalker/gitchef

WORKDIR /app
COPY package.json /app/

RUN npm install

CMD ["npm", "run", "dev"]