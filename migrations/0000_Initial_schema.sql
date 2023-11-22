-- Migration number: 0000 	 2023-11-22T02:02:25.631Z
CREATE TABLE IF NOT EXISTS PitchDeck (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  slide_data TEXT NOT NULL,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pitch_deck_public_id ON PitchDeck(public_id);