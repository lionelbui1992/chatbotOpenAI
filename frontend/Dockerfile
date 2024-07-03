# Use an official node runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /app

COPY package.json package.json
# COPY package-lock.json package-lock.json
RUN npm install

ENV NODE_ENV production

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 6000

# Build the app for production
RUN npm run build

# Run the app
CMD ["npm", "start"]
