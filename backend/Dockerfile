FROM node:18-alpine

# create app directory
WORKDIR /usr/src/app

# install deps (only production)
COPY package.json package-lock.json* ./
RUN npm install --only=production

# copy app source
COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
