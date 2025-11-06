-- Seed data for Travel Management App
INSERT INTO users
    (name, email, phone, blood_group, emergency_contact, role)
VALUES
    ('Alice Admin', 'alice@travel.com', '1234567890', 'O+', 'Bob:9876543210', 'admin'),
    ('Bob Member', 'bob@travel.com', '2345678901', 'A-', 'Alice:1234567890', 'member');

INSERT INTO groups
    (title, type, admin_id)
VALUES
    ('Europe Trip', 'private', 1),
    ('Asia Adventure', 'public', 1);

INSERT INTO group_members
    (group_id, user_id, role, status)
VALUES
    (1, 1, 'admin', 'active'),
    (1, 2, 'member', 'active'),
    (2, 1, 'admin', 'active');
