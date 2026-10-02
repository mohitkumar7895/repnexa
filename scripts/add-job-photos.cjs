const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'repnexa'
  });

  const [cols] = await conn.query('SHOW COLUMNS FROM jobs');
  const existing = cols.map(c => c.Field);

  if (!existing.includes('before_photo_url')) {
    await conn.query('ALTER TABLE jobs ADD COLUMN before_photo_url TEXT NULL');
    console.log('✅ Added before_photo_url column to jobs');
  } else {
    console.log('before_photo_url already exists');
  }

  if (!existing.includes('after_photo_url')) {
    await conn.query('ALTER TABLE jobs ADD COLUMN after_photo_url TEXT NULL');
    console.log('✅ Added after_photo_url column to jobs');
  } else {
    console.log('after_photo_url already exists');
  }

  // Update sample photos for existing demo job
  await conn.query(
    "UPDATE jobs SET before_photo_url = ?, after_photo_url = ? WHERE job_code = 'JOB-2026-101'",
    [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80"
    ]
  );
  console.log('✅ Seeded demo before & after photos for JOB-2026-101');

  await conn.end();
}

migrate().catch(console.error);
