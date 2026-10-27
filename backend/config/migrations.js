import { query } from './postgres.js';

/**
 * Runs idempotent PostgreSQL schema migrations creating all 36 production entities,
 * foreign keys, check constraints, partial unique indexes, and audit logs.
 */
export async function runMigrations() {
  console.log('🔄 Executing PostgreSQL schema migrations...');

  const ddlStatements = [
    // 1. Roles
    `CREATE TABLE IF NOT EXISTS roles (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(64) UNIQUE NOT NULL,
      description TEXT,
      permissions JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 2. Users
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(32) UNIQUE,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255),
      role VARCHAR(64) DEFAULT 'customer',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 3. Customers
    `CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(32) NOT NULL,
      email VARCHAR(255),
      is_plus_member BOOLEAN DEFAULT FALSE,
      total_orders INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 4. Customer Addresses
    `CREATE TABLE IF NOT EXISTS customer_addresses (
      id VARCHAR(64) PRIMARY KEY,
      customer_id VARCHAR(64),
      customer_phone VARCHAR(32),
      label VARCHAR(64) DEFAULT 'Home',
      address_line TEXT NOT NULL,
      locality VARCHAR(128) NOT NULL,
      city VARCHAR(128) DEFAULT 'Krishnagiri',
      state VARCHAR(128) DEFAULT 'Tamil Nadu',
      postal_code VARCHAR(16),
      latitude NUMERIC(10, 6),
      longitude NUMERIC(10, 6),
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 5. Business Partners
    `CREATE TABLE IF NOT EXISTS business_partners (
      id VARCHAR(64) PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(32) UNIQUE,
      city VARCHAR(128) DEFAULT 'Krishnagiri',
      active_technicians INT DEFAULT 0,
      status VARCHAR(32) DEFAULT 'Approved',
      commission_rate NUMERIC(5, 2) DEFAULT 15.00,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 6. Workers
    `CREATE TABLE IF NOT EXISTS workers (
      id VARCHAR(64) PRIMARY KEY,
      application_id VARCHAR(64),
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(32) UNIQUE NOT NULL,
      email VARCHAR(255),
      avatar VARCHAR(512),
      trade VARCHAR(128) NOT NULL,
      experience_years INT DEFAULT 3,
      rating NUMERIC(3, 2) DEFAULT 4.90,
      status VARCHAR(32) DEFAULT 'Approved',
      online_status VARCHAR(32) DEFAULT 'online',
      verified_status BOOLEAN DEFAULT TRUE,
      operational_city VARCHAR(128) DEFAULT 'Krishnagiri',
      locality VARCHAR(128) DEFAULT 'Rayakottai Road',
      current_latitude NUMERIC(10, 6) DEFAULT 12.5200,
      current_longitude NUMERIC(10, 6) DEFAULT 78.2090,
      last_seen_at TIMESTAMPTZ DEFAULT NOW(),
      partner_id VARCHAR(64) REFERENCES business_partners(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 7. Worker Skills
    `CREATE TABLE IF NOT EXISTS worker_skills (
      id VARCHAR(64) PRIMARY KEY,
      worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE CASCADE,
      skill_name VARCHAR(128) NOT NULL,
      certification_name VARCHAR(255),
      verified BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 8. Worker Schedules
    `CREATE TABLE IF NOT EXISTS worker_schedules (
      id VARCHAR(64) PRIMARY KEY,
      worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE CASCADE,
      day_of_week INT NOT NULL,
      start_time VARCHAR(16) DEFAULT '08:00',
      end_time VARCHAR(16) DEFAULT '20:00',
      is_active BOOLEAN DEFAULT TRUE
    );`,

    // 9. Worker Availability
    `CREATE TABLE IF NOT EXISTS worker_availability (
      id VARCHAR(64) PRIMARY KEY,
      worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      slot VARCHAR(64) NOT NULL,
      is_available BOOLEAN DEFAULT TRUE,
      booking_id VARCHAR(64)
    );`,

    // 10. Partner Workers
    `CREATE TABLE IF NOT EXISTS partner_workers (
      id VARCHAR(64) PRIMARY KEY,
      partner_id VARCHAR(64) REFERENCES business_partners(id) ON DELETE CASCADE,
      worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE CASCADE,
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      status VARCHAR(32) DEFAULT 'Active'
    );`,

    // 11. Service Categories
    `CREATE TABLE IF NOT EXISTS service_categories (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) UNIQUE NOT NULL,
      slug VARCHAR(128) UNIQUE NOT NULL,
      icon VARCHAR(64),
      is_active BOOLEAN DEFAULT TRUE
    );`,

    // 12. Services
    `CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(128) NOT NULL,
      category_tab VARCHAR(128),
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      original_price NUMERIC(10, 2),
      discount VARCHAR(32),
      rating NUMERIC(3, 2) DEFAULT 4.85,
      reviews_count INT DEFAULT 120,
      duration VARCHAR(64) DEFAULT '45 mins',
      image_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 13. Service Packages
    `CREATE TABLE IF NOT EXISTS service_packages (
      id VARCHAR(64) PRIMARY KEY,
      service_id VARCHAR(64) REFERENCES services(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      includes JSONB DEFAULT '[]'::jsonb
    );`,

    // 14. Service Areas (Krishnagiri Town Service Coverage)
    `CREATE TABLE IF NOT EXISTS service_areas (
      id VARCHAR(64) PRIMARY KEY,
      city VARCHAR(128) NOT NULL,
      locality VARCHAR(128) NOT NULL,
      postal_code VARCHAR(16),
      polygon_geojson JSONB,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 15. Bookings
    `CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(64) PRIMARY KEY,
      booking_reference VARCHAR(64) UNIQUE NOT NULL,
      customer_id VARCHAR(64),
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(32) NOT NULL,
      service_id VARCHAR(64),
      service_name VARCHAR(255) NOT NULL,
      service_category VARCHAR(128),
      service_package VARCHAR(255),
      address TEXT NOT NULL,
      locality VARCHAR(128) NOT NULL,
      city VARCHAR(128) DEFAULT 'Krishnagiri',
      latitude NUMERIC(10, 6),
      longitude NUMERIC(10, 6),
      scheduled_date VARCHAR(64) NOT NULL,
      scheduled_time VARCHAR(64) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'Pending',
      subtotal NUMERIC(10, 2) DEFAULT 0,
      discount NUMERIC(10, 2) DEFAULT 0,
      tax NUMERIC(10, 2) DEFAULT 0,
      surge_fee NUMERIC(10, 2) DEFAULT 0,
      total_amount NUMERIC(10, 2) NOT NULL,
      payment_status VARCHAR(32) DEFAULT 'Pending',
      payment_method VARCHAR(64) DEFAULT 'Cash on Delivery',
      assigned_worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE SET NULL,
      assigned_worker_name VARCHAR(255),
      assigned_partner_id VARCHAR(64) REFERENCES business_partners(id) ON DELETE SET NULL,
      safety_pin VARCHAR(8) DEFAULT '4829',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT valid_booking_status CHECK (status IN (
        'Pending', 'Assigned', 'Travelling', 'En Route', 'Arrived', 'In Progress', 'Completed', 'Cancelled'
      ))
    );`,

    // 16. Booking Items
    `CREATE TABLE IF NOT EXISTS booking_items (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      service_id VARCHAR(64),
      service_name VARCHAR(255) NOT NULL,
      package_name VARCHAR(255),
      price NUMERIC(10, 2) NOT NULL,
      quantity INT DEFAULT 1
    );`,

    // 17. Booking Status History
    `CREATE TABLE IF NOT EXISTS booking_status_history (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      status VARCHAR(32) NOT NULL,
      triggered_by VARCHAR(64) DEFAULT 'system',
      actor_id VARCHAR(64),
      actor_role VARCHAR(64),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 18. Assignment Configuration
    `CREATE TABLE IF NOT EXISTS assignment_configuration (
      id VARCHAR(64) PRIMARY KEY,
      mode VARCHAR(32) DEFAULT 'AUTO_WITH_MANUAL_FALLBACK',
      auto_assign_radius_km NUMERIC(5, 2) DEFAULT 15.00,
      max_retry_count INT DEFAULT 3,
      offer_timeout_seconds INT DEFAULT 60,
      fallback_to_manual BOOLEAN DEFAULT TRUE,
      weights_json JSONB DEFAULT '{"eta": 0.35, "skills": 0.25, "availability": 0.15, "reliability": 0.10, "workload": 0.10, "rating": 0.05}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 19. Assignment Offers
    `CREATE TABLE IF NOT EXISTS assignment_offers (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE CASCADE,
      score NUMERIC(6, 2),
      travel_eta_minutes INT,
      distance_km NUMERIC(6, 2),
      status VARCHAR(32) DEFAULT 'offered',
      offered_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      responded_at TIMESTAMPTZ,
      response_reason TEXT,
      CONSTRAINT valid_offer_status CHECK (status IN (
        'offered', 'accepted', 'rejected', 'expired', 'cancelled'
      ))
    );`,

    // 20. Worker Assignments (Exclusive Assignment Enforced via Partial Unique Index)
    `CREATE TABLE IF NOT EXISTS worker_assignments (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE CASCADE,
      partner_id VARCHAR(64),
      status VARCHAR(32) DEFAULT 'active',
      assigned_by VARCHAR(64) DEFAULT 'auto_dispatch',
      assigned_at TIMESTAMPTZ DEFAULT NOW(),
      unassigned_at TIMESTAMPTZ,
      reason TEXT
    );`,

    // Partial unique index ensuring ONLY ONE active assignment per booking
    `CREATE UNIQUE INDEX IF NOT EXISTS uq_active_worker_assignment
     ON worker_assignments (booking_id)
     WHERE status = 'active';`,

    // 21. Assignment Events (Durable Event Stream)
    `CREATE TABLE IF NOT EXISTS assignment_events (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      worker_id VARCHAR(64),
      event_type VARCHAR(64) NOT NULL,
      payload_json JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 22. Tracking Sessions
    `CREATE TABLE IF NOT EXISTS tracking_sessions (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
      worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE SET NULL,
      customer_coords_lat NUMERIC(10, 6) NOT NULL,
      customer_coords_lng NUMERIC(10, 6) NOT NULL,
      current_coords_lat NUMERIC(10, 6),
      current_coords_lng NUMERIC(10, 6),
      speed NUMERIC(5, 2) DEFAULT 0,
      heading NUMERIC(5, 2) DEFAULT 0,
      accuracy NUMERIC(5, 2) DEFAULT 5,
      remaining_distance_km NUMERIC(6, 2) DEFAULT 0,
      remaining_eta_minutes INT DEFAULT 0,
      status VARCHAR(32) DEFAULT 'assigned',
      safety_pin VARCHAR(8) DEFAULT '4829',
      route_polyline_json JSONB,
      last_ping_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 23. Worker Location Events (Immutable Telemetry Ledger)
    `CREATE TABLE IF NOT EXISTS worker_location_events (
      id VARCHAR(64) PRIMARY KEY,
      tracking_session_id VARCHAR(64) REFERENCES tracking_sessions(id) ON DELETE CASCADE,
      worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE CASCADE,
      booking_id VARCHAR(64),
      latitude NUMERIC(10, 6) NOT NULL,
      longitude NUMERIC(10, 6) NOT NULL,
      speed NUMERIC(5, 2),
      heading NUMERIC(5, 2),
      accuracy NUMERIC(5, 2),
      device_timestamp TIMESTAMPTZ NOT NULL,
      server_timestamp TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 24. Chat Conversations
    `CREATE TABLE IF NOT EXISTS chat_conversations (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      assignment_id VARCHAR(64),
      customer_id VARCHAR(64) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      worker_id VARCHAR(64) NOT NULL,
      worker_name VARCHAR(255) NOT NULL,
      status VARCHAR(32) DEFAULT 'active',
      closure_reason VARCHAR(64),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      closed_at TIMESTAMPTZ
    );`,

    // 25. Chat Messages
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id VARCHAR(64) PRIMARY KEY,
      conversation_id VARCHAR(64) REFERENCES chat_conversations(id) ON DELETE CASCADE,
      client_message_id VARCHAR(64),
      sender_id VARCHAR(64) NOT NULL,
      sender_role VARCHAR(32) NOT NULL,
      sender_name VARCHAR(255) NOT NULL,
      message_text TEXT NOT NULL,
      message_type VARCHAR(32) DEFAULT 'text',
      attachment_url TEXT,
      status VARCHAR(32) DEFAULT 'delivered',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      read_at TIMESTAMPTZ
    );`,

    // 26. Chat Receipts
    `CREATE TABLE IF NOT EXISTS chat_receipts (
      id VARCHAR(64) PRIMARY KEY,
      message_id VARCHAR(64) REFERENCES chat_messages(id) ON DELETE CASCADE,
      conversation_id VARCHAR(64) REFERENCES chat_conversations(id) ON DELETE CASCADE,
      recipient_id VARCHAR(64) NOT NULL,
      delivered_at TIMESTAMPTZ DEFAULT NOW(),
      read_at TIMESTAMPTZ
    );`,

    // 27. Call Sessions (Privacy-Protected Masked Telephony Ledger)
    `CREATE TABLE IF NOT EXISTS call_sessions (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      caller_id VARCHAR(64) NOT NULL,
      caller_role VARCHAR(32) NOT NULL,
      recipient_id VARCHAR(64) NOT NULL,
      recipient_role VARCHAR(32) NOT NULL,
      provider_name VARCHAR(64) DEFAULT 'masked_telephony_bridge',
      provider_reference VARCHAR(128),
      call_status VARCHAR(32) DEFAULT 'initiated',
      duration_seconds INT DEFAULT 0,
      initiated_at TIMESTAMPTZ DEFAULT NOW(),
      connected_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ
    );`,

    // 28. Payments
    `CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      order_id VARCHAR(128) UNIQUE,
      payment_id VARCHAR(128),
      signature VARCHAR(255),
      amount NUMERIC(10, 2) NOT NULL,
      currency VARCHAR(8) DEFAULT 'INR',
      status VARCHAR(32) DEFAULT 'pending',
      payment_method VARCHAR(64) DEFAULT 'UPI',
      gateway_provider VARCHAR(64) DEFAULT 'Razorpay',
      error_code VARCHAR(64),
      error_description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 29. Payment Events
    `CREATE TABLE IF NOT EXISTS payment_events (
      id VARCHAR(64) PRIMARY KEY,
      payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
      event_type VARCHAR(64) NOT NULL,
      idempotency_key VARCHAR(128) UNIQUE,
      raw_payload JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 30. Invoices
    `CREATE TABLE IF NOT EXISTS invoices (
      id VARCHAR(64) PRIMARY KEY,
      invoice_number VARCHAR(64) UNIQUE NOT NULL,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      customer_id VARCHAR(64),
      subtotal NUMERIC(10, 2) NOT NULL,
      tax_gst NUMERIC(10, 2) NOT NULL,
      platform_fee NUMERIC(10, 2) DEFAULT 49.00,
      total_amount NUMERIC(10, 2) NOT NULL,
      invoice_pdf_url TEXT,
      issued_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 31. Commissions
    `CREATE TABLE IF NOT EXISTS commissions (
      id VARCHAR(64) PRIMARY KEY,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
      partner_id VARCHAR(64) REFERENCES business_partners(id) ON DELETE SET NULL,
      worker_id VARCHAR(64) REFERENCES workers(id) ON DELETE CASCADE,
      booking_amount NUMERIC(10, 2) NOT NULL,
      platform_commission_pct NUMERIC(5, 2) DEFAULT 15.00,
      platform_commission_amount NUMERIC(10, 2) NOT NULL,
      partner_commission_amount NUMERIC(10, 2) DEFAULT 0,
      worker_earning_amount NUMERIC(10, 2) NOT NULL,
      status VARCHAR(32) DEFAULT 'accrued',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 32. Payouts
    `CREATE TABLE IF NOT EXISTS payouts (
      id VARCHAR(64) PRIMARY KEY,
      recipient_type VARCHAR(32) NOT NULL,
      recipient_id VARCHAR(64) NOT NULL,
      amount NUMERIC(10, 2) NOT NULL,
      currency VARCHAR(8) DEFAULT 'INR',
      status VARCHAR(32) DEFAULT 'processed',
      bank_reference VARCHAR(128),
      payout_method VARCHAR(64) DEFAULT 'IMPS_BANK_TRANSFER',
      processed_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 33. Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(64) PRIMARY KEY,
      recipient_id VARCHAR(64) NOT NULL,
      recipient_role VARCHAR(32) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      notification_type VARCHAR(64) DEFAULT 'order_update',
      entity_id VARCHAR(64),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 34. Support Tickets
    `CREATE TABLE IF NOT EXISTS support_tickets (
      id VARCHAR(64) PRIMARY KEY,
      ticket_number VARCHAR(64) UNIQUE NOT NULL,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
      customer_id VARCHAR(64),
      subject VARCHAR(255) NOT NULL,
      category VARCHAR(64) DEFAULT 'Service Quality',
      priority VARCHAR(32) DEFAULT 'Medium',
      status VARCHAR(32) DEFAULT 'Open',
      assigned_agent VARCHAR(255) DEFAULT 'Dispatch Operations Team',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 35. Audit Logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      actor_id VARCHAR(64) NOT NULL,
      actor_role VARCHAR(64) NOT NULL,
      action VARCHAR(128) NOT NULL,
      entity_type VARCHAR(64) NOT NULL,
      entity_id VARCHAR(64) NOT NULL,
      before_state JSONB,
      after_state JSONB,
      ip_address VARCHAR(64),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // 36. Transactional Outbox Events (Durable Event Publishing Pattern)
    `CREATE TABLE IF NOT EXISTS outbox_events (
      id VARCHAR(64) PRIMARY KEY,
      event_name VARCHAR(128) NOT NULL,
      aggregate_type VARCHAR(64) NOT NULL,
      aggregate_id VARCHAR(64) NOT NULL,
      payload JSONB NOT NULL,
      status VARCHAR(32) DEFAULT 'pending',
      retry_count INT DEFAULT 0,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Default Krishnagiri Town coverage polygon in service_areas
    `INSERT INTO service_areas (id, city, locality, postal_code, is_active)
     VALUES
      ('AREA-KRI-01', 'Krishnagiri', 'Rayakottai Road', '635001', TRUE),
      ('AREA-KRI-02', 'Krishnagiri', 'Bangalore Road', '635001', TRUE),
      ('AREA-KRI-03', 'Krishnagiri', 'Gandhi Nagar', '635001', TRUE),
      ('AREA-KRI-04', 'Krishnagiri', 'TNHB Colony', '635001', TRUE),
      ('AREA-KRI-05', 'Krishnagiri', 'Old Pet (Pazhaya Pettai)', '635001', TRUE),
      ('AREA-KRI-06', 'Krishnagiri', 'New Pet (Pudhu Pettai)', '635001', TRUE),
      ('AREA-KRI-07', 'Krishnagiri', 'Roundana & Bus Stand', '635001', TRUE),
      ('AREA-KRI-08', 'Krishnagiri', 'Collectorate & Master Plan', '635001', TRUE),
      ('AREA-KRI-09', 'Krishnagiri', 'Kattiganapalli', '635002', TRUE),
      ('AREA-KRI-10', 'Krishnagiri', 'Londonpet', '635001', TRUE)
     ON CONFLICT (id) DO NOTHING;`,

    // Default Assignment Configuration
    `INSERT INTO assignment_configuration (id, mode, auto_assign_radius_km, max_retry_count, offer_timeout_seconds, fallback_to_manual)
     VALUES ('CONFIG-DEFAULT', 'AUTO_WITH_MANUAL_FALLBACK', 15.00, 3, 60, TRUE)
     ON CONFLICT (id) DO NOTHING;`,

    // Default Partner
    `INSERT INTO business_partners (id, company_name, contact_person, email, phone, city, active_technicians, status, commission_rate)
     VALUES ('PTR-KRI-501', 'Krishnagiri Native Home Care LLP', 'R. Anbarasan', 'anbarasan@krishnagiripartners.in', '+91 94431 88200', 'Krishnagiri', 8, 'Approved', 15.00)
     ON CONFLICT (id) DO NOTHING;`,

    // Default Workers in Krishnagiri Town
    `INSERT INTO workers (id, name, phone, email, trade, experience_years, rating, status, online_status, verified_status, operational_city, locality, current_latitude, current_longitude, partner_id)
     VALUES
      ('WRK-KRI-101', 'V. Saravanan', '+91 94432 10850', 'saravanan.ac@krishnagirihomeservices.in', 'AC & Appliance Repair', 7, 4.95, 'Approved', 'online', TRUE, 'Krishnagiri', 'Rayakottai Road', 12.5200, 78.2090, 'PTR-KRI-501'),
      ('WRK-KRI-102', 'M. Prakash', '+91 98421 77312', 'prakash.electrician@krishnagirihomeservices.in', 'Electrician & Quick Repairs', 6, 4.90, 'Approved', 'online', TRUE, 'Krishnagiri', 'Gandhi Nagar', 12.5230, 78.2195, 'PTR-KRI-501'),
      ('WRK-KRI-103', 'S. Rajesh', '+91 97891 44521', 'rajesh.plumber@krishnagirihomeservices.in', 'Plumber & Sanitary Specialist', 5, 4.88, 'Approved', 'online', TRUE, 'Krishnagiri', 'Bangalore Road', 12.5400, 78.2050, 'PTR-KRI-501')
     ON CONFLICT (id) DO NOTHING;`
  ];

  for (const sql of ddlStatements) {
    try {
      await query(sql);
    } catch (e) {
      console.error(`Migration error on statement:\n${sql}\nError: ${e.message}`);
      throw e;
    }
  }

  console.log('✅ PostgreSQL schema migrations complete: 36 tables, indexes, constraints, and initial Krishnagiri coverage configured.');
}
