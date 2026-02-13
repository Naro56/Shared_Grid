import { useState, useEffect, useCallback } from 'react';
import { socket, connectSocket } from './socket';
import './App.css';

// Utility to generate a random user and color
const getOrGenerateUser = () => {
  const stored = localStorage.getItem('grid_user');
  if (stored) return JSON.parse(stored);

  const newUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
  };
  localStorage.setItem('grid_user', JSON.stringify(newUser));
  return newUser;
};

function App() {
  const [user] = useState(getOrGenerateUser);
  const [blocks, setBlocks] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    connectSocket(user);

    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('initial-state', (data) => {
      setBlocks(data);
    });

    socket.on('block-updated', (updatedBlock) => {
      setBlocks(prev => prev.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      ));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('initial-state');
      socket.off('block-updated');
      socket.disconnect();
    };
  }, []);

  const handleBlockClick = useCallback((blockId, currentOwner) => {
    if (currentOwner) return; // Already claimed

    socket.emit('claim-block', {
      blockId,
      userId: user.id,
      userColor: user.color
    });
  }, [user]);

  const claimedCount = blocks.filter(b => b.owner_id).length;

  return (
    <div className="app-container">
      <header>
        <h1>Shared Pixel Grid</h1>
        <div className="user-info">
          <span>Playing as <strong>{user.id}</strong></span>
          <span className="color-dot" style={{ backgroundColor: user.color, color: user.color }}></span>
        </div>
      </header>

      <div className="grid-wrapper">
        <div className="grid">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`block ${block.owner_id ? 'owned' : ''}`}
              style={{ backgroundColor: block.owner_color || undefined }}
              onClick={() => handleBlockClick(block.id, block.owner_id)}
              title={block.owner_id ? `Claimed by ${block.owner_id}` : 'Unclaimed'}
            />
          ))}
        </div>
      </div>

      <div className="status-bar">
        <span>Status: <span className="badge" style={{ color: connected ? '#4ade80' : '#f87171' }}>{connected ? 'CONNECTED' : 'DISCONNECTED'}</span></span>
        <span>•</span>
        <span>Blocks Claimed: <strong>{claimedCount} / {blocks.length}</strong></span>
      </div>
    </div>
  );
}

export default App;
