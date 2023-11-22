-- Migration number: 0001 	 2023-11-22T03:17:53.446Z
CREATE TABLE IF NOT EXISTS Slide (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pitch_deck_id INTEGER REFERENCES PitchDeck(id) ON UPDATE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_location TEXT
);