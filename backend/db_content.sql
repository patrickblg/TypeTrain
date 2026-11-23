--Strg + Alt + l reformate
--TODO: add Keytable etc.
DROP TABLE levels;
CREATE TABLE IF NOT EXISTS levels
(
    levelID     INTEGER PRIMARY KEY,
    levelString TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS level_types
(
    levelID INTEGER NOT NULL,
    type    TEXT    NOT NULL,

    PRIMARY KEY (levelID, type),

    FOREIGN KEY (levelID)
        REFERENCES levels (levelID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users
(
    userID      INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,

    textSize    INTEGER NOT NULL DEFAULT 100,
    isOnAudio   INTEGER NOT NULL DEFAULT 1,

    usesLThumb  INTEGER NOT NULL DEFAULT 1,
    usesLIndex  INTEGER NOT NULL DEFAULT 1,
    usesLMiddle INTEGER NOT NULL DEFAULT 1,
    usesLRing   INTEGER NOT NULL DEFAULT 1,
    usesLLittle INTEGER NOT NULL DEFAULT 0,

    usesRThumb  INTEGER NOT NULL DEFAULT 0,
    usesRIndex  INTEGER NOT NULL DEFAULT 0,
    usesRMiddle INTEGER NOT NULL DEFAULT 0,
    usesRRing   INTEGER NOT NULL DEFAULT 0,
    usesRLittle INTEGER NOT NULL DEFAULT 0,

    CHECK (isOnAudio IN (0, 1))
);

CREATE TABLE IF NOT EXISTS attempts
(
    attemptID      INTEGER PRIMARY KEY AUTOINCREMENT,

    levelID        INTEGER NOT NULL,
    userID         INTEGER NOT NULL,

    isCompleted    INTEGER NOT NULL DEFAULT 0,
    stars          INTEGER NOT NULL DEFAULT 0,

    time           INTEGER NOT NULL,
    nMistakes      INTEGER NOT NULL,
    percentCorrect REAL    NOT NULL,

    timeDateStamp  INTEGER NOT NULL,

    FOREIGN KEY (levelID)
        REFERENCES levels (levelID),

    FOREIGN KEY (userID)
        REFERENCES users (userID),

    CHECK (isCompleted IN (0, 1)),
    CHECK (stars BETWEEN 0 AND 3)
);


INSERT OR IGNORE INTO levels (levelID, levelString)
VALUES (1, 'asasasdasdfaffdaassd'),
       (2, 'ghjklgjkhglkghjjgljkgjhgk'),
       (3, 'qwertzwetzq677qwet648wetzeqtweqewr4q2'),
       (4, 'Hallo du. Ja, du! Du schreibst gerade einen schönen Text bla Bla BLA ....'),
       (5, 'wqoeui czcd7ew VGGgh jwd742hj djdhsdfk vgrh');

INSERT OR IGNORE INTO level_types (levelID, type)
VALUES (1, 'asdf'),
       (2, 'ghjkl'),
       (3, 'qwertz'),
       (3, '12345'),
       (4, 'Sätze'),
       (5, '.,;:'),
       (5, 'Wörter'),
       (5, 'Sätze');

INSERT OR IGNORE INTO users (userID, name)
VALUES (1, 'miri'),
       (2, 'hermine'),
       (3, 'patrick'),
       (4, 'robert');
