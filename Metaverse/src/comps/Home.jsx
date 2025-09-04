import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomCode } from '../utils/roomUtils';

function Home() {
  const [joinCode, setJoinCode] = useState('');
  const [name, setName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const navigate = useNavigate();

  const characters = [
    { id: 'Student1', name: 'Student1', image: 'https://res.cloudinary.com/dhdmbwnak/image/upload/v1745084597/Screenshot_2025-04-19_231245_tj1brw.png' },
    { id: 'Student2', name: 'Student2', image: 'https://res.cloudinary.com/dhdmbwnak/image/upload/v1745084597/Screenshot_2025-04-19_231152_s1kt1t.png' },
    { id: 'Student3', name: 'Student3', image: 'https://res.cloudinary.com/dhdmbwnak/image/upload/v1745084597/Screenshot_2025-04-19_231226_zh9ysk.png' },
  ];

  const handleCreateRoom = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!selectedCharacter) {
      alert('Please select a character');
      return;
    }
    
    const roomCode = generateRoomCode();
    navigate(`/room/${roomCode}`, { 
      state: { userName: name, character: selectedCharacter } 
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!selectedCharacter) {
      alert('Please select a character');
      return;
    }
    
    if (joinCode.trim()) {
      navigate(`/room/${joinCode}`, { 
        state: { userName: name, character: selectedCharacter } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 relative z-10">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent mb-8">
          Virtual Classroom
        </h1>
        
        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-white/90">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 text-white placeholder-white/60 backdrop-blur-sm"
              required
            />
          </div>
          
          {/* Character Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/90">
              Choose Character
            </label>
            <div className="grid grid-cols-3 gap-3">
              {characters.map((character) => (
                <div
                  key={character.id}
                  onClick={() => setSelectedCharacter(character.id)}
                  className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                    selectedCharacter === character.id
                      ? 'border-indigo-400 bg-indigo-500/30 ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/25'
                      : 'border-white/30 hover:border-indigo-300 hover:bg-white/10'
                  }`}
                >
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-16 h-16 rounded-full mb-2 border-2 border-white/20"
                  />
                  <span className="text-sm font-medium text-white">{character.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleCreateRoom} 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 transform hover:scale-105"
          >
            Create Room
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-white/70">
              <span className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-3 text-sm">or join existing</span>
            </div>
          </div>
          
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter Room Code"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 text-white placeholder-white/60 backdrop-blur-sm"
              required
            />
            <button 
              type="submit" 
              className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm hover:scale-105"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
      
      <p className="mt-6 text-sm text-white/70 relative z-10">
        Connect with your classroom virtually, anywhere.
      </p>
    </div>
  );
}

export default Home;