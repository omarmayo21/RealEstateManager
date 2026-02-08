FROM node:22.12.0-alpine

WORKDIR /app

# 🔴 مهم: امنع Prisma من postinstall
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
