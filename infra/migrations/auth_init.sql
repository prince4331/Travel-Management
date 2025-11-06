-- Roles table
CREATE TABLE roles
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL
);

-- Users table
CREATE TABLE users
(
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  photoUrl TEXT,
  bloodGroup VARCHAR(10),
  emergencyContact VARCHAR(100),
  role_id INTEGER REFERENCES roles(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions
(
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  refreshToken VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
