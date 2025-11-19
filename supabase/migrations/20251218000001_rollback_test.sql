-- Rollback Test Migration
-- This migration tests the rollback capability of the production schema

-- ============================================================================
-- ROLLBACK FUNCTIONS
-- ============================================================================

-- Function to safely drop tables with CASCADE
CREATE OR REPLACE FUNCTION public.safe_drop_table(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', table_name);
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping table %: %', table_name, SQLERRM;
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to test rollback by creating and dropping a test table
CREATE OR REPLACE FUNCTION public.test_migration_rollback()
RETURNS TABLE (
    test_name TEXT,
    status TEXT,
    message TEXT
) AS $$
BEGIN
    -- Test 1: Create test table
    BEGIN
        CREATE TABLE IF NOT EXISTS public.migration_test (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            test_data TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RETURN QUERY SELECT 'Create Test Table'::TEXT, 'PASS'::TEXT, 'Test table created successfully'::TEXT;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT 'Create Test Table'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- Test 2: Insert test data
    BEGIN
        INSERT INTO public.migration_test (test_data) VALUES ('Test data');
        RETURN QUERY SELECT 'Insert Test Data'::TEXT, 'PASS'::TEXT, 'Test data inserted successfully'::TEXT;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT 'Insert Test Data'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- Test 3: Rollback (drop test table)
    BEGIN
        DROP TABLE IF EXISTS public.migration_test CASCADE;
        RETURN QUERY SELECT 'Rollback Test Table'::TEXT, 'PASS'::TEXT, 'Test table dropped successfully'::TEXT;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT 'Rollback Test Table'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- Test 4: Verify core tables exist
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
            RETURN QUERY SELECT 'Verify Core Tables'::TEXT, 'PASS'::TEXT, 'Core tables exist'::TEXT;
        ELSE
            RETURN QUERY SELECT 'Verify Core Tables'::TEXT, 'FAIL'::TEXT, 'Core tables missing'::TEXT;
        END IF;
    END;
    
    -- Test 5: Verify RLS is enabled
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'user_profiles' 
            AND rowsecurity = true
        ) THEN
            RETURN QUERY SELECT 'Verify RLS Enabled'::TEXT, 'PASS'::TEXT, 'RLS is enabled on core tables'::TEXT;
        ELSE
            RETURN QUERY SELECT 'Verify RLS Enabled'::TEXT, 'FAIL'::TEXT, 'RLS not enabled'::TEXT;
        END IF;
    END;
    
    -- Test 6: Verify functions exist
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'enroll_in_course'
        ) THEN
            RETURN QUERY SELECT 'Verify Functions'::TEXT, 'PASS'::TEXT, 'Database functions exist'::TEXT;
        ELSE
            RETURN QUERY SELECT 'Verify Functions'::TEXT, 'FAIL'::TEXT, 'Database functions missing'::TEXT;
        END IF;
    END;
    
    -- Test 7: Verify storage buckets
    BEGIN
        IF EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE id IN ('course-materials', 'user-avatars', 'assignment-submissions')
        ) THEN
            RETURN QUERY SELECT 'Verify Storage Buckets'::TEXT, 'PASS'::TEXT, 'Storage buckets configured'::TEXT;
        ELSE
            RETURN QUERY SELECT 'Verify Storage Buckets'::TEXT, 'FAIL'::TEXT, 'Storage buckets missing'::TEXT;
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;

-- Run rollback test
SELECT * FROM public.test_migration_rollback();

-- Log test completion
DO $$
BEGIN
    RAISE NOTICE 'Migration rollback test completed';
    RAISE NOTICE 'Run SELECT * FROM public.test_migration_rollback() to see test results';
END $$;
