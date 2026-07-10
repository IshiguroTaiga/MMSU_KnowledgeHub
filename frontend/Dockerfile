FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5190
# Bind to all network hosts so it is accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
