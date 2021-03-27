-- Database: DOMessenger
 -- DROP DATABASE "DOMessenger";

CREATE DATABASE dom WITH ENCODING = 'UTF8' --  LC_COLLATE = 'C'
 --  LC_CTYPE = 'C'
 TABLESPACE = pg_default CONNECTION
LIMIT = -1;

--user DOMessenger
\connect dom
create table if not exists users (username varchar(32) NOT NULL primary key, password varchar NOT NULL);


create table if not exists chats (name varchar(32) NOT NULL, chat_id SERIAL PRIMARY KEY);


create table if not exists chat_user (chat_id serial, username varchar(32) not null);
