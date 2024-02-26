CREATE TABLE Songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    year INTEGER NOT NULL,
    playUrl TEXT NOT NULL,
    createdAt DATETIME NOT NULL,
    source TEXT NOT NULL,
    UNIQUE(title, artist, year)
)
