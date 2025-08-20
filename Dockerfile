FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "start"]

