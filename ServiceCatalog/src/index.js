const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3001;

app.use(express.json());

// Pool mot Postgres (schema = servicecatalog)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'servicesystem',
  password: 'password',
  port: 5432
});

// CREATE
app.post('/services', async (req, res) => {
  const { id, name } = req.body;
  try {
    await pool.query(
      'INSERT INTO servicecatalog.services (id, name) VALUES ($1, $2)',
      [id, name]
    );
    res.status(201).json({ id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all
app.get('/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servicecatalog.services');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one
app.get('/services/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM servicecatalog.services WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Service not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put('/services/:id', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE servicecatalog.services SET name = $1 WHERE id = $2 RETURNING *',
      [name, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Service not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/services/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM servicecatalog.services WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Service not found" });
    res.json({ deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ ServiceCatalog API at http://localhost:${port}`);
});
