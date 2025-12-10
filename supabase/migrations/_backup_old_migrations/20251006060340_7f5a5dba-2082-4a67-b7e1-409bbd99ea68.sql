-- Fix security issues from linter

-- Fix 1: Make view use SECURITY INVOKER instead of implicitly SECURITY DEFINER
DROP VIEW IF EXISTS v_user_dashboard;

CREATE OR REPLACE VIEW v_user_dashboard
WITH (security_invoker = true) AS
  SELECT 
    p.id AS user_id,
    u.email,
    COALESCE(w.balance, 0) AS balance,
    (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = p.id) AS courses_enrolled,
    (SELECT COALESCE(AVG(progress), 0) FROM enrollments e WHERE e.user_id = p.id) AS avg_progress,
    (SELECT COUNT(*) FROM prayer_journal pr WHERE pr.user_id = p.id AND pr.is_answered = true) AS prayers_answered,
    (SELECT COUNT(*) FROM prayer_journal pr WHERE pr.user_id = p.id) AS total_prayers
  FROM profiles p 
  LEFT JOIN auth.users u ON u.id = p.id
  LEFT JOIN wallets w ON w.user_id = p.id;

-- Fix 2: Add search_path to earn_ScrollGold function
CREATE OR REPLACE FUNCTION earn_ScrollGold(p_user_id UUID, p_amount NUMERIC, p_desc TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update wallet balance
  UPDATE wallets 
  SET balance = balance + p_amount, updated_at = NOW() 
  WHERE user_id = p_user_id;
  
  -- If wallet doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, balance) VALUES (p_user_id, p_amount);
  END IF;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, description) 
  VALUES (p_user_id, 'earned', p_amount, p_desc);
END;
$$;

-- Fix 3: Add search_path to spend_ScrollGold function
CREATE OR REPLACE FUNCTION spend_ScrollGold(p_user_id UUID, p_amount NUMERIC, p_desc TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has enough balance
  IF (SELECT balance FROM wallets WHERE user_id = p_user_id) >= p_amount THEN
    UPDATE wallets 
    SET balance = balance - p_amount, updated_at = NOW() 
    WHERE user_id = p_user_id;
    
    INSERT INTO transactions (user_id, type, amount, description) 
    VALUES (p_user_id, 'spent', p_amount, p_desc);
  ELSE
    RAISE EXCEPTION 'Insufficient ScrollGold balance';
  END IF;
END;
$$;