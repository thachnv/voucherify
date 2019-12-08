# base image
FROM node:10-alpine as builder

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
RUN npm install

COPY . /usr/src/app

RUN npm run build

# install nginx and use my nginx config
FROM nginx:1.13.9-alpine
RUN rm -rf /etc/nginx/conf.d
COPY nginx/conf /etc/nginx

COPY --from=builder /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

# start app
CMD ["nginx", "-g", "daemon off;"]