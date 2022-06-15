FROM node:lts
WORKDIR /code
COPY yarn.lock package.json /code/
RUN yarn 

COPY . .
RUN yarn next build
COPY .env .
CMD yarn start