FROM node:15.12.0-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /usr/src/dreamonmessenger
COPY ./ ./

RUN npm install

RUN psql --host $PGHOST --port $PGPORT --username $PGUSER --password $PGPASSWORD -d postgresql -f ./back/PG/DOM_DB.sql

EXPOSE 8080
CMD ['npm', 'start']
