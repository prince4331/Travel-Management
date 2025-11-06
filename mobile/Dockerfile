# Dockerfile for React Native Metro bundler
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 8081
CMD ["npx", "react-native", "start"]