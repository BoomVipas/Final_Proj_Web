-- MedCare seed data (idempotent)
-- Run after schema.sql

-- Wards
insert into wards (id, name, floor, room_range, caregiver_name)
values
  ('10000000-0000-0000-0000-000000000001', 'วอร์ด A', 1, 'A-101 ถึง A-120', 'คุณเมย์'),
  ('10000000-0000-0000-0000-000000000002', 'วอร์ด B', 2, 'B-201 ถึง B-220', 'คุณแนน')
on conflict (id) do update
set
  name = excluded.name,
  floor = excluded.floor,
  room_range = excluded.room_range,
  caregiver_name = excluded.caregiver_name;

-- Residents
insert into residents (
  id,
  name,
  name_en,
  room,
  ward_id,
  allergies,
  chronic_conditions,
  flags,
  doctor_contact,
  line_user_id,
  is_active
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'นางสาว สมใจ ใจดี',
    'Somjai Jaidee',
    'A-102',
    '10000000-0000-0000-0000-000000000001',
    '{เพนิซิลลิน}',
    '{เบาหวาน,ความดันโลหิตสูง}',
    '{"crush": true, "liquid": false, "needs_assistance": true}',
    '081-111-1111',
    'line_somjai_family',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'นาย ประยูร แสงทอง',
    'Prayoon Sangthong',
    'A-105',
    '10000000-0000-0000-0000-000000000001',
    '{}',
    '{หัวใจ}',
    '{"crush": false, "liquid": false, "needs_assistance": false}',
    '081-222-2222',
    'line_prayoon_family',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'นาง พิมพ์ใจ สุขสันต์',
    'Pimjai Suksan',
    'B-203',
    '10000000-0000-0000-0000-000000000002',
    '{ซัลฟา}',
    '{ไตเรื้อรัง}',
    '{"crush": false, "liquid": true, "needs_assistance": true}',
    '081-333-3333',
    'line_pimjai_family',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'นาย ศรัณย์ สุขเกษม',
    'Saran Sukkasem',
    'B-206',
    '10000000-0000-0000-0000-000000000002',
    '{}',
    '{พาร์กินสัน}',
    '{"crush": true, "liquid": false, "needs_assistance": true}',
    '081-444-4444',
    'line_saran_family',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'นางสาว อรทัย ทองสุข',
    'Orathai Thongsuk',
    'A-110',
    '10000000-0000-0000-0000-000000000001',
    '{ไอโอดีน}',
    '{ไขมันในเลือดสูง}',
    '{"crush": false, "liquid": false, "needs_assistance": false}',
    '081-555-5555',
    'line_orathai_family',
    true
  )
on conflict (id) do update
set
  name = excluded.name,
  name_en = excluded.name_en,
  room = excluded.room,
  ward_id = excluded.ward_id,
  allergies = excluded.allergies,
  chronic_conditions = excluded.chronic_conditions,
  flags = excluded.flags,
  doctor_contact = excluded.doctor_contact,
  line_user_id = excluded.line_user_id,
  is_active = excluded.is_active;

-- Medications
insert into medications (id, name, name_en, form, dosage_unit, notes, is_active)
values
  ('30000000-0000-0000-0000-000000000001', 'Metformin', 'Metformin', 'tablet', 'mg', 'รับประทานหลังอาหาร', true),
  ('30000000-0000-0000-0000-000000000002', 'Aspirin', 'Aspirin', 'tablet', 'mg', 'หลีกเลี่ยงท้องว่าง', true),
  ('30000000-0000-0000-0000-000000000003', 'Omeprazole', 'Omeprazole', 'capsule', 'mg', 'ก่อนอาหารเช้า', true),
  ('30000000-0000-0000-0000-000000000004', 'Furosemide', 'Furosemide', 'tablet', 'mg', 'ติดตามปริมาณปัสสาวะ', true),
  ('30000000-0000-0000-0000-000000000005', 'Risperidone', 'Risperidone', 'tablet', 'mg', 'อาจทำให้ง่วง', true),
  ('30000000-0000-0000-0000-000000000006', 'Vitamin B Complex', 'Vitamin B Complex', 'tablet', 'เม็ด', 'หลังอาหารเช้า', true)
on conflict (id) do update
set
  name = excluded.name,
  name_en = excluded.name_en,
  form = excluded.form,
  dosage_unit = excluded.dosage_unit,
  notes = excluded.notes,
  is_active = excluded.is_active;

-- Resident medications
insert into resident_medications (
  id,
  resident_id,
  medication_id,
  dose_amount,
  dose_unit,
  schedule,
  special_instructions,
  requires_crushing,
  is_active
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    1,
    'เม็ด',
    '{after_breakfast,after_dinner}',
    'รับประทานพร้อมน้ำเปล่า',
    true,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    1,
    'แคปซูล',
    '{before_breakfast}',
    'ก่อนอาหารอย่างน้อย 30 นาที',
    false,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    1,
    'เม็ด',
    '{after_breakfast}',
    null,
    false,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000004',
    1,
    'เม็ด',
    '{after_breakfast,after_dinner}',
    'ติดตามความดันโลหิต',
    false,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000005',
    0.5,
    'เม็ด',
    '{bedtime}',
    'รับประทานก่อนนอน',
    true,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000005',
    '30000000-0000-0000-0000-000000000006',
    1,
    'เม็ด',
    '{after_breakfast}',
    null,
    false,
    true
  )
on conflict (id) do update
set
  resident_id = excluded.resident_id,
  medication_id = excluded.medication_id,
  dose_amount = excluded.dose_amount,
  dose_unit = excluded.dose_unit,
  schedule = excluded.schedule,
  special_instructions = excluded.special_instructions,
  requires_crushing = excluded.requires_crushing,
  is_active = excluded.is_active,
  updated_at = now();

-- Stock
insert into stock (
  id,
  medication_id,
  quantity,
  unit,
  threshold_warn,
  threshold_critical,
  daily_consumption,
  updated_at
)
values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 420, 'เม็ด', 14, 7, 12, now()),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 90, 'เม็ด', 14, 7, 5, now()),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 140, 'แคปซูล', 14, 7, 5, now()),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 70, 'เม็ด', 14, 7, 6, now()),
  ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 28, 'เม็ด', 14, 7, 4, now()),
  ('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 350, 'เม็ด', 14, 7, 8, now())
on conflict (medication_id) do update
set
  quantity = excluded.quantity,
  unit = excluded.unit,
  threshold_warn = excluded.threshold_warn,
  threshold_critical = excluded.threshold_critical,
  daily_consumption = excluded.daily_consumption,
  updated_at = now();

-- Users
insert into users (id, email, role, display_name, resident_id)
values
  ('60000000-0000-0000-0000-000000000001', 'admin@medcare.local', 'admin', 'ผู้ดูแลระบบ', null),
  ('60000000-0000-0000-0000-000000000002', 'nurse.bus@medcare.local', 'nurse', 'พยาบาลบุษ', null),
  ('60000000-0000-0000-0000-000000000003', 'caregiver.a@medcare.local', 'caregiver', 'ผู้ดูแลวอร์ด A', null),
  ('60000000-0000-0000-0000-000000000004', 'family.somjai@medcare.local', 'family', 'ญาติคุณสมใจ', '20000000-0000-0000-0000-000000000001')
on conflict (email) do update
set
  role = excluded.role,
  display_name = excluded.display_name,
  resident_id = excluded.resident_id;

-- Weekly fill status for current week
insert into weekly_fill_status (id, resident_id, week_start, is_filled, filled_at, filled_by)
values
  (
    '70000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    date_trunc('week', now())::date,
    false,
    null,
    null
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    date_trunc('week', now())::date,
    true,
    now() - interval '1 day',
    '60000000-0000-0000-0000-000000000002'
  ),
  (
    '70000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    date_trunc('week', now())::date,
    false,
    null,
    null
  ),
  (
    '70000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000004',
    date_trunc('week', now())::date,
    false,
    null,
    null
  ),
  (
    '70000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000005',
    date_trunc('week', now())::date,
    false,
    null,
    null
  )
on conflict (resident_id, week_start) do update
set
  is_filled = excluded.is_filled,
  filled_at = excluded.filled_at,
  filled_by = excluded.filled_by;

-- Sample immutable dispense event
insert into dispense_events (
  id,
  resident_id,
  meal,
  day_of_week,
  medications_json,
  total_pills,
  staff_id,
  dispensed_at,
  outcome
)
values
  (
    '80000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'after_breakfast',
    'monday',
    '[{"medication_id":"30000000-0000-0000-0000-000000000002","name":"Aspirin","dose_amount":1,"dose_unit":"เม็ด"}]'::jsonb,
    1,
    '60000000-0000-0000-0000-000000000002',
    now() - interval '1 day',
    'success'
  )
on conflict (id) do nothing;
