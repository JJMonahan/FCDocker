# build stage
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json .
# Configure npm for corporate networks (ZScaler, etc.) with SSL/proxy issues  
RUN npm config set strict-ssl false && \
    npm config set registry http://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 2 && \
    npm config set fetch-timeout 60000 && \
    npm install --no-audit --no-fund
COPY . .
RUN npm run build

# development stage (keeps Node.js and dev tools)
FROM node:lts-alpine AS development-stage
WORKDIR /app
COPY package*.json .
# Configure npm for corporate networks (ZScaler, etc.) with SSL/proxy issues  
RUN npm config set strict-ssl false && \
    npm config set registry http://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 2 && \
    npm config set fetch-timeout 60000 && \
    npm install --no-audit --no-fund
COPY . .
# Keep container running for development tools
CMD ["tail", "-f", "/dev/null"]

# production stage
        #FROM nginx:stable-alpine as production-stage
        #COPY --from=build-stage /app/dist /usr/share/nginx/html
        #EXPOSE 80
        #CMD ["nginx", "-g", "daemon off;"]

# Use an official Nginx image as the base image
FROM nginx AS production-stage

RUN rm /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration file into the container
COPY nginx.conf /etc/nginx

# Copy the html files to the Nginx root directory
COPY --from=build-stage /app/dist /usr/share/nginx/html
#COPY index.html /usr/share/nginx/html/index.html

# Expose the port on which Nginx will listen
EXPOSE 80

# Command to start Nginx
# CMD ["nginx", "-g", "daemon off;"]
# Display the parsed Nginx configuration when the container starts
CMD ["sh", "-c", "nginx -T && nginx -g 'daemon off;'"]