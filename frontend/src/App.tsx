import { useState, useEffect } from 'react';

interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  created_at: string;
}

const COLORS = [
  { name: 'Default', value: '#1e293b' },
  { name: 'Blue', value: '#1e3a8a' },
  { name: 'Green', value: '#064e3b' },
  { name: 'Purple', value: '#4c1d95' },
  { name: 'Red', value: '#7f1d1d' },
  { name: 'Amber', value: '#78350f' },
];

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, color: selectedColor }),
      });

      if (response.ok) {
        setTitle('');
        setContent('');
        setSelectedColor(COLORS[0].value);
        fetchNotes();
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== id));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          MindFlow Notes
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Capture your thoughts, anytime, anywhere.</p>
      </header>

      <form onSubmit={handleSubmit} className="create-note">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Take a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          required
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: color.value,
                border: selectedColor === color.value ? '2px solid white' : '2px solid transparent',
                padding: 0
              }}
              title={color.name}
            />
          ))}
        </div>
        <button type="submit" className="btn-primary">Add Note</button>
      </form>

      {loading ? (
        <div className="empty-state">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p>No notes yet. Start by creating one above!</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div
              key={note.id}
              className="note-card"
              style={{ backgroundColor: note.color || 'var(--glass)' }}
            >
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-footer">
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="btn-delete"
                  title="Delete note"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
