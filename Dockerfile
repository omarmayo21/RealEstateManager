FROM node:22.12.0-alpine

WORKDIR /app

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

COPY package*.json ./
RUN npm install

COPY . .

# 👇 build لازم يحصل قبل NODE_ENV=production
RUN npm run build

ENV NODE_ENV=production

EXPOSE 5000
CMD ["npm", "start"]
