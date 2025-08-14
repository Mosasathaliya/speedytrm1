-- Create test user Hassan with proper password hash
-- ID: 2124994969, Password: 123456789

-- First delete any existing user with this ID
DELETE FROM users WHERE id_number = '2124994969';

-- Insert test user with plain password (worker will handle verification)
INSERT INTO users (
    id,
    full_name,
    id_number,
    password,
    phone_number,
    term_enrolled,
    created_at,
    is_active,
    term1_paid
) VALUES (
    'user_test_hassan_' || strftime('%s', 'now'),
    'Hassan',
    '2124994969',
    '123456789', -- Plain password for now, worker supports legacy plain text
    '0000000000',
    'Term 1',
    CURRENT_TIMESTAMP,
    1,
    1
);

-- User progress will be initialized by the worker on first login
