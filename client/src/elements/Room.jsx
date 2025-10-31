import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

function Room() {
  const { code } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [user, setUser] = useState('');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const bottomRef = useRef(null);

  const socket = useMemo(() => io('/', { transports: ['websocket'] }), []);

  // Fetch classroom details and previous messages
  useEffect(() => {
    axios
      .get(`/classrooms/${code}`)
      .then((res) => setClassroom(res.data))
      .catch(() => setClassroom({ name: 'Unknown', code }));

    axios
      .get(`/classrooms/${code}/messages?limit=50`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [code]);

  // Generate random username
  useEffect(() => {
    if (!user) {
      const rnd = `User-${Math.floor(Math.random() * 9000 + 1000)}`;
      setUser(rnd);
    }
  }, [user]);

  // Handle socket connection and events
  useEffect(() => {
    if (!code || !user) return;

    socket.emit('join_room', { code, user });
    socket.on('room_history', (hist) => setMessages(hist));
    socket.on('chat_message', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('system', (note) =>
      setMessages((prev) => [
        ...prev,
        { user: 'System', text: note, ts: Date.now() },
      ])
    );
    socket.on('typing', ({ user: who, typing }) =>
      setTypingUser(typing ? who : '')
    );

    return () => {
      socket.emit('leave_room', { code });
      socket.off();
    };
  }, [code, user, socket]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    socket.emit('chat_message', { code, text: trimmed });
    setText('');
  }

  function handleTyping(val) {
    setText(val);
    socket.emit('typing', { code, typing: !!val });
  }

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">
          Room: {classroom ? `${classroom.name} (${classroom.code})` : code}
        </h4>
        <Link to="/classrooms" className="btn btn-outline-primary">
          Back
        </Link>
      </div>

      <div className="card p-3" style={{ height: '70vh', display: 'flex' }}>
        <div
          className="flex-grow-1 overflow-auto mb-3"
          style={{ border: '1px solid #eee', borderRadius: 6, padding: 12 }}
        >
          {messages.map((m, idx) => (
            <div key={idx} className="mb-2">
              <small className="text-muted">
                {new Date(m.ts).toLocaleTimeString()}
              </small>
              <div>
                <strong>{m.user}:</strong> {m.text}
              </div>
            </div>
          ))}
          {typingUser && (
            <div className="text-muted">
              <em>{typingUser} is typing…</em>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Type a message"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Room;
