FROM node:20-alpine

WORKDIR /app

# Copy package descriptors and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm install
RUN npx prisma generate

# Copy source code and build TypeScript project
COPY . .
RUN npm run build

# Expose backend API port
EXPOSE 5000

# Start production server with auto schema push
CMD ["sh", "-c", "npx prisma db push --skip-generate || true; node dist/index.js"]
