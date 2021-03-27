# DreamOnMessenger
[DreamOnMessenger](https://old.dom.atrin-hojjat.com/index.htm), aka DOM, is a Socket based messenger built using Nodejs jquery and bootstrap

# Running Locally
## Using docker (Only Linux at the moment)
You can Run and build the docker image using the provided docker compose file.
```
PG_DATA=postgres docker-compose up -d --build
```
You can now access the server on [127.0.0.1:8075/index.htm](127.0.0.1:8075/index.htm)

## Using Node
### Cloning
Just run:
```
git clone https://github.com/atrin-hojjat/DreamOnMessenger.git
cd DreamOnMessenger
```
### Setting up database
To run the server locally, you'll need a postgresql database created using file in `./back/PG/DOM_DB.sql`.
```
psql -d postgres -f ./back/PG/DOM_DB.sql
```

### Running the server
The database credentials need to be provided via environment variables as described below.
the SECRET variable needs to be provided and should be a long, random string.
```
npm install

PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres PGDATABASE=dom PGPORT=5432 SECRET=thisshouldbearandomstring npm start
```

### You're done!
You can now access the server on [127.0.0.1:8080/index.htm](127.0.0.1:8080/index.htm)
