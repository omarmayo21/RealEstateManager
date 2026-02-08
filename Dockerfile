FROM node:22.12.0-alpine

WORKDIR /app

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV NODE_ENV=production

COPY package*.json ./

# 👇 هنا من غير --omit=dev
RUN npm install

COPY . .

# 👇 build محتاج vite
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
