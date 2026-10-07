-- Function: web_company_subscription.sql
-- Description: RPC functions for Enterprise Subscriptions, Quota Management, and Billing Invoices ledger.
-- Prefix: 'web_' (Designated for Castallio One web-app)

-- 1. GET FUNCTION: web_get_company_subscription_billing
CREATE OR REPLACE FUNCTION web_get_company_subscription_billing()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_company_id uuid;
    v_company record;
    v_sub record;
    v_plan record;
    v_txns jsonb;
    v_result jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'Not authenticated');
    END IF;

    -- 1. Resolve Company
    SELECT id, name, gst_number, office_address, email, hr_contact_email
    INTO v_company
    FROM companies
    WHERE owner_id = v_user_id
    LIMIT 1;

    IF v_company.id IS NULL THEN
        RETURN jsonb_build_object(
            'has_company', false,
            'message', 'No company profile found for user'
        );
    END IF;

    v_company_id := v_company.id;

    -- 2. Fetch Active Subscription
    SELECT cs.*, sp.name AS plan_name, sp.price_inr, sp.job_post_limit AS plan_job_limit, sp.cv_unlock_limit AS plan_cv_limit
    INTO v_sub
    FROM company_subscriptions cs
    LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
    WHERE cs.company_id = v_company_id AND cs.is_active = true
    ORDER BY cs.created_at DESC
    LIMIT 1;

    -- Always initialize v_plan so the record is never unassigned
    SELECT * INTO v_plan FROM subscription_plans WHERE id = 'free' LIMIT 1;

    -- 2. Fetch Active Subscription

    -- 3. Fetch Transaction History
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', COALESCE(st.transaction_id, 'INV-' || to_char(st.purchased_at, 'YYYY') || '-' || substr(st.id::text, 1, 4)),
                'date', to_char(COALESCE(st.purchased_at, st.created_at), 'DD Mon YYYY'),
                'year', EXTRACT(YEAR FROM COALESCE(st.purchased_at, st.created_at)),
                'plan_id', st.plan_id,
                'product_id', st.product_id,
                'amount', COALESCE((st.raw_event->>'amount')::numeric, 1499.00),
                'gst', round(COALESCE((st.raw_event->>'amount')::numeric, 1499.00) * 0.18, 2),
                'total', round(COALESCE((st.raw_event->>'amount')::numeric, 1499.00) * 1.18, 2),
                'store', st.store,
                'status', 'paid',
                'payment_mode', COALESCE(st.raw_event->>'paymentMode', 'Gateway AutoPay')
            ) ORDER BY COALESCE(st.purchased_at, st.created_at) DESC
        ),
        '[]'::jsonb
    ) INTO v_txns
    FROM subscription_transactions st
    WHERE st.company_id = v_company_id;

    -- 4. Construct Result Payload
    v_result := jsonb_build_object(
        'has_company', true,
        'company', jsonb_build_object(
            'id', v_company.id,
            'name', COALESCE(v_company.name, 'Enterprise Studio'),
            'gstin', COALESCE(v_company.gst_number, ''),
            'address', COALESCE(v_company.office_address, ''),
            'email', COALESCE(v_company.email, v_company.hr_contact_email, '')
        ),
        'subscription', jsonb_build_object(
            'plan_id', COALESCE(v_sub.plan_id, 'free'),
            'plan_name', COALESCE(v_sub.plan_name, v_plan.name, 'Free Plan'),
            'price_inr', COALESCE(v_sub.price_inr, v_plan.price_inr, 0),
            'job_post_limit', CASE WHEN COALESCE(v_sub.plan_id, 'free') = 'unlimited' THEN NULL ELSE COALESCE(v_sub.plan_job_limit, v_plan.job_post_limit, 1) END,
            'jobs_posted', COALESCE(v_sub.jobs_posted, 0),
            'cv_unlock_limit', COALESCE(v_sub.plan_cv_limit, v_plan.cv_unlock_limit, 3),
            'cvs_unlocked', COALESCE(v_sub.cvs_unlocked, 0),
            'remaining_jobs', CASE 
                WHEN COALESCE(v_sub.plan_id, 'free') = 'unlimited' THEN 999999 
                ELSE GREATEST(0, COALESCE(v_sub.plan_job_limit, v_plan.job_post_limit, 1) - COALESCE(v_sub.jobs_posted, 0)) 
            END,
            'remaining_cvs', GREATEST(0, COALESCE(v_sub.plan_cv_limit, v_plan.cv_unlock_limit, 3) - COALESCE(v_sub.cvs_unlocked, 0)),
            'started_at', v_sub.started_at,
            'expires_at', v_sub.expires_at,
            'is_active', COALESCE(v_sub.is_active, true)
        ),
        'transactions', v_txns
    );

    RETURN v_result;
END;
$$;


-- 2. CHECKOUT FUNCTION: web_process_subscription_checkout
CREATE OR REPLACE FUNCTION web_process_subscription_checkout(
    p_plan_id text,
    p_payment_mode text DEFAULT 'razorpay',
    p_gstin text DEFAULT NULL,
    p_razorpay_payment_id text DEFAULT NULL,
    p_razorpay_order_id text DEFAULT NULL,
    p_razorpay_signature text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_company_id uuid;
    v_plan record;
    v_existing_sub record;
    v_new_sub_id uuid;
    v_txn_id text;
    v_expires_at timestamp with time zone;
    v_is_cv_addon boolean;
    v_result jsonb;
    v_store text := 'razorpay';
    v_env text := 'SANDBOX';
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Resolve Company
    SELECT id INTO v_company_id
    FROM companies
    WHERE owner_id = v_user_id
    LIMIT 1;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'No company profile found for authenticated user';
    END IF;

    -- 2. Validate Selected Plan
    SELECT * INTO v_plan
    FROM subscription_plans
    WHERE id = p_plan_id AND is_active = true
    LIMIT 1;

    IF v_plan.id IS NULL THEN
        RAISE EXCEPTION 'Plan not found or inactive: %', p_plan_id;
    END IF;

    v_expires_at := now() + interval '1 month';
    v_is_cv_addon := (p_plan_id IN ('starter_cv', 'professional_cv'));

    -- Determine transaction ID & environment
    IF p_razorpay_payment_id IS NOT NULL AND length(trim(p_razorpay_payment_id)) > 0 THEN
        v_txn_id := trim(p_razorpay_payment_id);
        IF v_txn_id LIKE 'pay_%' AND v_txn_id NOT LIKE 'pay_test_%' THEN
            v_env := 'PRODUCTION';
        ELSE
            v_env := 'SANDBOX';
        END IF;
    ELSE
        v_txn_id := 'TXN_RZP_' || floor(extract(epoch from now()))::text || '_' || floor(random() * 9000 + 1000)::text;
        v_env := 'SANDBOX';
    END IF;

    -- 3. Update Company GSTIN if provided
    IF p_gstin IS NOT NULL AND length(trim(p_gstin)) > 0 THEN
        UPDATE companies
        SET gst_number = upper(trim(p_gstin)),
            updated_at = now()
        WHERE id = v_company_id;
    END IF;

    -- 4. Subscription State Transition
    IF v_is_cv_addon THEN
        -- Add-on: Stack CV unlocks onto current active subscription if one exists
        SELECT * INTO v_existing_sub
        FROM company_subscriptions
        WHERE company_id = v_company_id AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1;

        IF v_existing_sub.id IS NOT NULL THEN
            UPDATE company_subscriptions
            SET updated_at = now(),
                payment_gateway = 'razorpay',
                razorpay_payment_id = COALESCE(p_razorpay_payment_id, v_existing_sub.razorpay_payment_id)
            WHERE id = v_existing_sub.id;
        ELSE
            INSERT INTO company_subscriptions (
                company_id, plan_id, started_at, expires_at, is_active,
                usage_month, cvs_unlocked, jobs_posted, store, auto_renew,
                payment_gateway, razorpay_payment_id, razorpay_plan_id
            ) VALUES (
                v_company_id, p_plan_id, now(), v_expires_at, true,
                to_char(now(), 'YYYY-MM'), 0, 0, v_store, true,
                'razorpay', p_razorpay_payment_id, v_plan.razorpay_plan_id
            ) RETURNING id INTO v_new_sub_id;
        END IF;
    ELSE
        -- Primary Job Posting Plan: Deactivate previous plans and activate new tier
        UPDATE company_subscriptions
        SET is_active = false,
            updated_at = now()
        WHERE company_id = v_company_id AND is_active = true;

        INSERT INTO company_subscriptions (
            company_id, plan_id, started_at, expires_at, is_active,
            usage_month, cvs_unlocked, jobs_posted, store, auto_renew,
            payment_gateway, razorpay_payment_id, razorpay_plan_id
        ) VALUES (
            v_company_id, p_plan_id, now(), v_expires_at, true,
            to_char(now(), 'YYYY-MM'), 0, 0, v_store, true,
            'razorpay', p_razorpay_payment_id, v_plan.razorpay_plan_id
        ) RETURNING id INTO v_new_sub_id;
    END IF;

    -- 5. Record Transaction in subscription_transactions
    INSERT INTO subscription_transactions (
        company_id,
        plan_id,
        product_id,
        transaction_id,
        revenuecat_event_id,
        event_type,
        purchased_at,
        expires_at,
        store,
        environment,
        period_type,
        razorpay_payment_id,
        raw_event
    ) VALUES (
        v_company_id,
        p_plan_id,
        'castallio_' || p_plan_id,
        v_txn_id,
        'rzp_evt_' || v_txn_id,
        'INITIAL_PURCHASE',
        now(),
        v_expires_at,
        v_store,
        v_env,
        'MONTHLY',
        p_razorpay_payment_id,
        jsonb_build_object(
            'plan_id', p_plan_id,
            'plan_name', v_plan.name,
            'amount', v_plan.price_inr,
            'gst18Percent', round(v_plan.price_inr * 0.18, 2),
            'totalPaid', round(v_plan.price_inr * 1.18, 2),
            'paymentMode', p_payment_mode,
            'gstin', COALESCE(p_gstin, 'UNREGISTERED'),
            'currency', 'INR',
            'razorpay_payment_id', p_razorpay_payment_id,
            'razorpay_order_id', p_razorpay_order_id,
            'razorpay_signature', p_razorpay_signature,
            'gateway', 'Razorpay'
        )
    );

    -- 6. Return Updated Overview
    SELECT web_get_company_subscription_billing() INTO v_result;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_txn_id,
        'plan_name', v_plan.name,
        'price_inr', v_plan.price_inr,
        'total_paid', round(v_plan.price_inr * 1.18, 2),
        'overview', v_result
    );
END;
$$;
