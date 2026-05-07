CREATE TABLE IF NOT EXISTS incidents (
    id          SERIAL           PRIMARY KEY,                         
    title       TEXT             NOT NULL,                             
    description TEXT             NOT NULL,                             
    lvl         SMALLINT         NOT NULL CHECK (lvl BETWEEN 1 AND 3), 
    lat         DOUBLE PRECISION NOT NULL CHECK (lat  BETWEEN -90  AND 90),  
    lng         DOUBLE PRECISION NOT NULL CHECK (lng  BETWEEN -180 AND 180),
    image_url   TEXT             NOT NULL DEFAULT '',                  
    color       TEXT             NOT NULL CHECK (color IN ('green', 'yellow', 'red')), 
    status      TEXT  NOT NULL DEFAULT 'review',            
    reason      TEXT             NOT NULL DEFAULT '',                  
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW()                
);