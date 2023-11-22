-- Migration number: 0002 	 2023-11-22T08:02:53.212Z
ALTER TABLE PitchDeck ADD company_type TEXT NOT NULL;
ALTER TABLE PitchDeck ADD company_name TEXT NOT NULL;
ALTER TABLE PitchDeck DROP slide_data;
ALTER TABLE PitchDeck DROP title;