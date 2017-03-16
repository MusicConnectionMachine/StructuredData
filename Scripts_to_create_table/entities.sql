CREATE SEQUENCE entities_seq;
CREATE TYPE entitytype AS ENUM ('composer', 'musician','band','release','recording','work');
CREATE TABLE entities(
   entity_id integer PRIMARY KEY default nextval('entities_seq'),
   entity_name text NOT NULL,
   entity_type entitytype NOT NULL,
   UNIQUE(entity_name,entity_type)
);
