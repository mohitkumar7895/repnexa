const mysql = require('mysql2/promise');

async function dedupeServices() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'repnexa'
  });

  const [dupes] = await conn.query(
    'SELECT title, MIN(id) as keep_id, GROUP_CONCAT(id) as all_ids FROM services GROUP BY title HAVING COUNT(*) > 1'
  );
  console.log(`Found ${dupes.length} duplicated service titles.`);

  for (const d of dupes) {
    const keepId = d.keep_id;
    const allIds = d.all_ids.split(',').map(Number);
    const deleteIds = allIds.filter(id => id !== keepId);

    if (deleteIds.length > 0) {
      for (const delId of deleteIds) {
        try {
          await conn.query('UPDATE leads SET service_id = ? WHERE service_id = ?', [keepId, delId]);
        } catch(e) {}
        try {
          await conn.query('UPDATE partner_services SET service_id = ? WHERE service_id = ?', [keepId, delId]);
        } catch(e) {}
      }

      await conn.query('DELETE FROM services WHERE id IN (?)', [deleteIds]);
      console.log(`Kept ID ${keepId} for "${d.title}", deleted duplicates: ${deleteIds.join(', ')}`);
    }
  }

  try {
    await conn.query('ALTER TABLE services ADD UNIQUE KEY uq_service_title (title)');
    console.log('✅ Added UNIQUE constraint on services(title)');
  } catch(e) {
    console.log('Unique key note:', e.message);
  }

  const [remaining] = await conn.query('SELECT COUNT(*) as total FROM services');
  console.log(`Remaining clean unique services count: ${remaining[0].total}`);

  await conn.end();
}

dedupeServices().catch(console.error);
