-- Add missing columns to users table
-- This migration adds the comprehensive user information fields

-- Add email column
ALTER TABLE users ADD COLUMN email TEXT;

-- Add phone column
ALTER TABLE users ADD COLUMN phone TEXT;

-- Add country column
ALTER TABLE users ADD COLUMN country TEXT;

-- Add city column
ALTER TABLE users ADD COLUMN city TEXT;

-- Add timezone column
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';

-- Add language_preference column
ALTER TABLE users ADD COLUMN language_preference TEXT DEFAULT 'ar';

-- Add date_of_birth column
ALTER TABLE users ADD COLUMN date_of_birth DATE;

-- Add gender column
ALTER TABLE users ADD COLUMN gender TEXT;

-- Add education_level column
ALTER TABLE users ADD COLUMN education_level TEXT;

-- Add occupation column
ALTER TABLE users ADD COLUMN occupation TEXT;

-- Add company column
ALTER TABLE users ADD COLUMN company TEXT;

-- Add profile_picture_url column
ALTER TABLE users ADD COLUMN profile_picture_url TEXT;

-- Add bio column
ALTER TABLE users ADD COLUMN bio TEXT;

-- Add term1_payment_date column
ALTER TABLE users ADD COLUMN term1_payment_date TIMESTAMP;

-- Add term1_payment_amount column
ALTER TABLE users ADD COLUMN term1_payment_amount DECIMAL(10,2);

-- Add term1_payment_method column
ALTER TABLE users ADD COLUMN term1_payment_method TEXT;

-- Add subscription_status column
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';

-- Add subscription_expires_at column
ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP;

-- Add created_at column (if not exists)
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT (unixepoch());

-- Add updated_at column (if not exists)
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT (unixepoch());

-- Add last_login_at column
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;

-- Add is_active column (if not exists)
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Add email_verified column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Add phone_verified column
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;

-- Add two_factor_enabled column
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;

-- Add preferences column
ALTER TABLE users ADD COLUMN preferences JSON;

-- Add metadata column
ALTER TABLE users ADD COLUMN metadata JSON;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_term1_paid ON users(term1_paid);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);
