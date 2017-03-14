Synopsis
Server which responds to REST API requests from the group which mines the unstructured data
Code Example
http://127.0.0.1:3000/entities/ - HTTP method GET fetches all the entries in the database
http://127.0.0.1:3000/entities/entity/:id  HTTP method GET fetches entry in the database whose entity id matches id
http://127.0.0.1:3000/entities/entity/:id  HTTP method GET fetches entry in the database whose entity id matches id
http://127.0.0.1:3000/entities/entity/:id  HTTP method PUT updates entry in the database whose entity id matches id
http://127.0.0.1:3000/entities/entity/ method POST fetches adds new entry in the database 
http://127.0.0.1:3000/entities/entity/:id  HTTP method DELETE deletes entry in the database whose entity id matches id

Motivation
Group 2 shall use these endpoints to filter the unstructured data .
Installation
Client.js file describes the HTTP request that Group2 should generate
