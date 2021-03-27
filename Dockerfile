FROM node:15.12.0-alpine

ARG PGHOST
ARG PGDATABASE
ARG PGUSER
ARG PGPASSWORD
ARG PGPORT
ARG SECRET


ENV PGHOST $PGHOST
ENV PGDATABASE $PGDATABASE
ENV PGUSER $PGUSER
ENV PGPASSWORD $PGPASSWORD
ENV PGPORT $PGPORT
ENV SECRET $SECRET


RUN apk add --no-cache postgresql-client

WORKDIR /usr/src/dreamonmessenger
COPY ./ ./

RUN npm install

RUN psql --host $PGHOST --port $PGPORT --username $PGUSER --password $PGPASSWORD -d postgresql -f ./back/PG/DOM_DB.sql

EXPOSE 8080
CMD ['npm', 'start']
