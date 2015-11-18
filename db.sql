# primitive db layout
CREATE TABLE users2
(
  user_id serial NOT NULL,
  username text,
  password text,
  email text,
  active integer
)
CREATE TABLE tokens
(
  id serial NOT NULL,
  token text,
  user_id integer,
  logged_out integer
)

CREATE TABLE movies
(
  id serial NOT NULL,
  name text,
  description text,
  actors integer[],
  user_id integer
)