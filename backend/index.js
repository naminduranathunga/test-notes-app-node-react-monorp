import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection configuration
const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
};

async function initDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_NAME || 'notes_db'}\``);
        await connection.query(`USE \`${process.env.MYSQL_NAME || 'notes_db'}\``);

        // Create notes table if not exists
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        color VARCHAR(20) DEFAULT '#ffffff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
        await connection.query(createTableQuery);
        console.log('Database and table initialized successfully');
        return connection;
    } catch (err) {
        console.error('Error initializing database:', err);
        // log all env variables
        console.log('Environment variables:', process.env);
        process.exit(1);
    }
}

// Routes
const db = await initDB();

// Get all notes
app.get('/api/notes', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM notes ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a note
app.post('/api/notes', async (req, res) => {
    const { title, content, color } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO notes (title, content, color) VALUES (?, ?, ?)',
            [title, content, color || '#ffffff']
        );
        res.status(201).json({ id: result.insertId, title, content, color: color || '#ffffff' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM notes WHERE id = ?', [id]);
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
