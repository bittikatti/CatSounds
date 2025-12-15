DROP TABLE IF EXISTS CatSounds;

CREATE TABLE IF NOT EXISTS CatSounds (
    CatSoundID     INTEGER PRIMARY KEY AUTOINCREMENT,
    Transcript     TEXT,
    SoundGroup     TEXT,
    SoundFileLink  TEXT,
    SoundLicence   TEXT,
    OriginalLink   TEXT
);
