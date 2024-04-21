#Используем образ линукс Alpine с версией 19.5.0
FROM node:19.5.0-alpine

#Устанавливаем рабочую директорию
WORKDIR /app

#Копируем package.json и package-lock.json внутрь контейнера
COPY package*.json ./

#Устанавливаем зависимости
RUN npm install

#Копируем исходный код внутрь контейнера
COPY . .

#Установить Prisma
RUN npm install -g prisma

#Генерируем Prisma client
RUN prisma generate

#Запускаем prisma schema
COPY prisma/schema.prisma ./prisma/

#Открыть порт в нашем контейнере
EXPOSE 3000

#Запуск приложения
CMD ["npm", "start"]