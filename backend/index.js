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

let db = null;
let mockNotes = [];

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
        db = connection;
    } catch (err) {
        console.error('Error initializing database. Running in offline/mock mode:', err.message);
        db = null;
    }
}

// Routes
initDB();

app.get('/', async (req, res) => {
    res.json({status: "success", message: "App is live" });
});
app.get('/health', async (req, res) => {
    res.json({status: "success", message: "App is live" });
});

// Get all notes
app.get('/api/notes', async (req, res) => {
    try {
        if (db) {
            const [rows] = await db.query('SELECT * FROM notes ORDER BY created_at DESC');
            res.json(rows);
        } else {
            res.json([...mockNotes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create a note
app.post('/api/notes', async (req, res) => {
    const { title, content, color } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const newNote = {
        id: Date.now(),
        title,
        content,
        color: color || '#ffffff',
        created_at: new Date().toISOString()
    };

    try {
        if (db) {
            const [result] = await db.query(
                'INSERT INTO notes (title, content, color) VALUES (?, ?, ?)',
                [title, content, color || '#ffffff']
            );
            res.status(201).json({ id: result.insertId, title, content, color: color || '#ffffff', created_at: newNote.created_at });
        } else {
            mockNotes.push(newNote);
            res.status(201).json(newNote);
        }
    } catch (err) {
        console.error('Insert error:', err);
        // Fallback to mock even if DB was supposed to be there but failed during query
        mockNotes.push(newNote);
        res.status(201).json(newNote);
    }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (db) {
            await db.query('DELETE FROM notes WHERE id = ?', [id]);
            res.json({ message: 'Note deleted successfully' });
        } else {
            mockNotes = mockNotes.filter(n => n.id != id);
            res.json({ message: 'Note deleted successfully (from mock)' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

