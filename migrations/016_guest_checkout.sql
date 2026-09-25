-- 016_guest_checkout.sql
-- Digital products allow guest Checkout. Preserve orders without a user account.
-- Review existing foreign-key deletion rules separately before changing them.
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
