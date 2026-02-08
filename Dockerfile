FROM node:22.12.0-alpine

WORKDIR /app

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# 👈 السطر الحاسم
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
