# Usar la imagen oficial de Node.js como base
FROM node:20-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto que usa la API (5000 por defecto en Vetcare)
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
