-- Function: web_company_profile
-- Description: RPC functions for retrieving and atomically upserting company profile data.
-- Prefix: 'web_' (Designated for Castallio One web-app)

-- 1. GET FUNCTION
CREATE OR REPLACE FUNCTION web_get_company_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_result jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT to_jsonb(c) INTO v_result
    FROM companies c
    WHERE c.owner_id = v_user_id
    LIMIT 1;

    RETURN v_result;
END;
$$;

-- 2. UPSERT FUNCTION
CREATE OR REPLACE FUNCTION web_upsert_company_profile(
    p_name text,
    p_size text DEFAULT NULL,
    p_website text DEFAULT NULL,
    p_email text DEFAULT NULL,
    p_hr_contact_email text DEFAULT NULL,
    p_establishment_year integer DEFAULT NULL,
    p_office_address text DEFAULT NULL,
    p_linkedin_url text DEFAULT NULL,
    p_description text DEFAULT NULL,
    p_logo_url text DEFAULT NULL,
    p_gst_number text DEFAULT NULL,
    p_certificate_type text DEFAULT 'MSME',
    p_certificate_link text DEFAULT NULL,
    p_pan_card_link text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_company_id uuid;
    v_is_complete boolean;
    v_result jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF p_name IS NULL OR trim(p_name) = '' THEN
        RAISE EXCEPTION 'Company name is required';
    END IF;

    -- Determine completeness: core contact & descriptive fields filled
    v_is_complete := (
        COALESCE(trim(p_name), '') != '' AND
        COALESCE(trim(p_email), '') != '' AND
        COALESCE(trim(p_website), '') != '' AND
        COALESCE(trim(p_office_address), '') != '' AND
        COALESCE(trim(p_description), '') != ''
    );

    -- Atomic Upsert into public.companies
    INSERT INTO companies (
        owner_id,
        name,
        size,
        website,
        email,
        hr_contact_email,
        establishment_year,
        office_address,
        linkedin_url,
        description,
        logo_url,
        gst_number,
        certificate_type,
        certificate_link,
        pan_card_link,
        is_profile_complete,
        is_draft,
        updated_at
    )
    VALUES (
        v_user_id,
        trim(p_name),
        p_size,
        trim(p_website),
        trim(p_email),
        trim(p_hr_contact_email),
        p_establishment_year,
        trim(p_office_address),
        trim(p_linkedin_url),
        trim(p_description),
        p_logo_url,
        NULLIF(trim(p_gst_number), ''),
        COALESCE(p_certificate_type, 'MSME'),
        p_certificate_link,
        p_pan_card_link,
        v_is_complete,
        false,
        now()
    )
    ON CONFLICT (owner_id) DO UPDATE SET
        name = EXCLUDED.name,
        size = EXCLUDED.size,
        website = EXCLUDED.website,
        email = EXCLUDED.email,
        hr_contact_email = EXCLUDED.hr_contact_email,
        establishment_year = EXCLUDED.establishment_year,
        office_address = EXCLUDED.office_address,
        linkedin_url = EXCLUDED.linkedin_url,
        description = EXCLUDED.description,
        logo_url = EXCLUDED.logo_url,
        gst_number = EXCLUDED.gst_number,
        certificate_type = EXCLUDED.certificate_type,
        certificate_link = EXCLUDED.certificate_link,
        pan_card_link = EXCLUDED.pan_card_link,
        is_profile_complete = EXCLUDED.is_profile_complete,
        is_draft = false,
        updated_at = now()
    RETURNING id INTO v_company_id;

    -- Synchronize user_profiles onboarding status
    IF v_is_complete THEN
        UPDATE user_profiles
        SET onboarding_complete = true
        WHERE id = v_user_id;
    END IF;

    -- Return the updated company record as jsonb
    SELECT to_jsonb(c) INTO v_result
    FROM companies c
    WHERE c.id = v_company_id;

    RETURN v_result;
END;
$$;
