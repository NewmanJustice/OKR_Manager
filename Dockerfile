# Dockerfile for OKR Manager (Next.js) use for local development
# This Dockerfile is for local development purposes, not for production deployment.
# It uses Node.js 20 on Alpine Linux for a lightweight image.   
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
