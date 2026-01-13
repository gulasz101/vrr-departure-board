FROM node:20-alpine

# Set timezone to Europe/Berlin for correct VRR API times
RUN apk add --no-cache tzdata
ENV TZ=Europe/Berlin

WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY server.js ./
COPY public ./public
EXPOSE 8080
CMD ["node", "server.js"]
