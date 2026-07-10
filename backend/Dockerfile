FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Note: The data directory will be mapped via volume in docker-compose for easy updates.
EXPOSE 5191
CMD ["npm", "start"]
