-- Add foreign key relationships for live sessions participants and chat to profiles table

-- Add user_id foreign key to live_sessions_participants
ALTER TABLE live_sessions_participants
ADD CONSTRAINT live_sessions_participants_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add user_id foreign key to live_sessions_chat
ALTER TABLE live_sessions_chat
ADD CONSTRAINT live_sessions_chat_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;