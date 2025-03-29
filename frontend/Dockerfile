# build stage
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

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