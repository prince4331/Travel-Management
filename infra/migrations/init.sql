-- Initial schema for Travel Management App
CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    photo_url TEXT,
    blood_group VARCHAR(10),
    emergency_contact VARCHAR(100),
    role VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    type VARCHAR(20),
    admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members
(
    group_id INTEGER REFERENCES groups(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(20),
    status VARCHAR(20),
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE expenses
(
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    amount NUMERIC(12,2),
    payer_id INTEGER REFERENCES users(id),
    participants INTEGER
    [],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

    CREATE TABLE documents
    (
        id SERIAL PRIMARY KEY,
        owner_type VARCHAR(20),
        owner_id INTEGER,
        file_url TEXT,
        encrypted_meta TEXT
    );

    CREATE TABLE invitations
    (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id),
        code VARCHAR(50),
        method VARCHAR(20),
        expires_at TIMESTAMP
    );
