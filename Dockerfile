FROM node:16
WORKDIR /app
COPY package.json ./
RUN npm install --force
COPY . .
EXPOSE 3000
ENV NODE_ENV "production"
ENV DB_URL "mongodb://mongo:27017/tsapi"
CMD [ "npm", "start" ]