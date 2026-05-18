FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


RUN npm install -g static-server
EXPOSE 3000
CMD ["static-server", "-p", "3000", "dist"]
