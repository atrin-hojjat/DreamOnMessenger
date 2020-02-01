-- Database: DOMessenger

-- DROP DATABASE "DOMessenger";

CREATE DATABASE "DOMessenger"
    WITH 
    OWNER = atrinhojjat
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
--user DOMessenger
create table users ( 
	username varchar(32) NOT NULL primary key,
	password varchar NOT NULL);
create table chats ( 
	name varchar(32) NOT NULL,
	chat_id SERIAL PRIMARY KEY);
	
create table chat_user (
		chat_id serial primary key,
		username varchar(32) not null
	);


