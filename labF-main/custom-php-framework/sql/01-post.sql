CREATE TABLE films (
                       id INTEGER NOT NULL CONSTRAINT film_pk PRIMARY KEY AUTOINCREMENT,
                       title TEXT NOT NULL,
                       description TEXT NOT NULL,
                       duration INTEGER NOT NULL
);
