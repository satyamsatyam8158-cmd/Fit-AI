import { useState, useRef, useEffect } from 'react';
import API from '../api/axios';

export default function AIChat() {
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hey! 👋 I'm your AI fitness coach. Ask me anything about workouts, nutrition, recovery, or motivation!" },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(m => [...m, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const { data } = await API.post('/chat/ask', { message: userMsg });
            setMessages(m => [...m, { role: 'bot', text: data.response }]);
        } catch {
            setMessages(m => [...m, { role: 'bot', text: "Sorry, I couldn't process that. Try again!" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>🤖 AI Fitness Coach</h1>
                <p>Ask about workouts, nutrition, supplements, motivation, and more</p>
            </div>

            <div className="glass-card chat-container">
                <div className="chat-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-bubble ${msg.role}`}>
                            {msg.text}
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-bubble bot" style={{ opacity: 0.6 }}>
                            Thinking...
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <form onSubmit={send} className="chat-input-area">
                    <input
                        className="form-input"
                        placeholder="Ask me anything about fitness..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button className="btn btn-primary" disabled={loading || !input.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </>
    );
}
