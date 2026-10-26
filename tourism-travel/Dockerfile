FROM node:22-alpine

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json* ./

# Install npm dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite development port
EXPOSE 5175

# Start Vite dev server accessible from host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5175"]
