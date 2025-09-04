import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import EnvironmentComp from './EnvironmentComp';
import { initializeSocket } from '../utils/socketUtils';

const SEAT_POSITIONS = [
  { position: [-0.8, 0.2, 1.9], rotation: [0, -Math.PI / 2, 0] },
  { position: [-0.8, 0.2, -1.8], rotation: [0, -Math.PI / 2, 0] },
  { position: [-0.8, 0.2, 0], rotation: [0, -Math.PI / 2, 0] },
];

function Room() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [mySeatIndex, setMySeatIndex] = useState(-1);
  const [userName, setUserName] = useState('');
  const [character, setCharacter] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [roomStats, setRoomStats] = useState({ userCount: 0, maxUsers: 20 });

  useEffect(() => {
    // Redirect if state is missing (user refreshes or comes directly)
    if (!state?.userName || !state?.character) {
      navigate('/');
      return;
    }

    setUserName(state.userName);
    setCharacter(state.character);
    
    const newSocket = initializeSocket(roomId);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      setConnectionStatus('connected');

      // Send user info to server
      newSocket.emit('joinRoom', {
        name: state.userName,
        character: state.character,
      });

      newSocket.emit('requestSeat');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      setConnectionStatus('disconnected');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionStatus('error');
    });

    newSocket.on('seatAssigned', (seatData) => {
      setMySeatIndex(seatData.seatIndex);
    });

    newSocket.on('updateUsers', (updatedUsers) => {
      setUsers(updatedUsers);
      setRoomStats(prev => ({ ...prev, userCount: updatedUsers.length }));
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [roomId, state, navigate]);

  // Update local user information in the users array
  useEffect(() => {
    if (mySeatIndex >= 0 && character && userName) {
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        const myUserIndex = updatedUsers.findIndex(u => u.seatIndex === mySeatIndex);
  
        if (myUserIndex >= 0) {
          updatedUsers[myUserIndex] = {
            ...updatedUsers[myUserIndex],
            name: userName,
            character: character
          };
        } else {
          updatedUsers.push({
            id: 'local-user',
            name: userName,
            character: character,
            seatIndex: mySeatIndex
          });
        }
  
        return updatedUsers;
      });
    }
  }, [mySeatIndex, character, userName]);
  
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleInfo = () => {
    setShowInfo(prev => !prev);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 z-20 w-full bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 text-white p-4 flex justify-between items-center shadow-2xl backdrop-blur-md border-b border-gray-700/50">
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Virtual Classroom
          </h2>
          <div className="flex items-center bg-gray-700/80 rounded-xl px-4 py-2 border border-gray-600/50">
            <span className="mr-3 text-gray-300 font-medium">Room ID:</span>
            <span className="font-mono text-blue-300 font-semibold">{roomId}</span>
            <button 
              onClick={copyRoomId} 
              className="ml-3 p-2 hover:bg-gray-600/80 rounded-lg transition-all duration-200 hover:scale-105"
              title="Copy Room ID"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-gray-300" />}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-gray-300">{roomStats.userCount}/{roomStats.maxUsers} users</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-300 ${
            connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            connectionStatus === 'disconnected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              connectionStatus === 'disconnected' ? 'bg-red-400' :
              'bg-gray-400'
            }`}></span>
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'connecting' ? 'Connecting...' :
             connectionStatus === 'disconnected' ? 'Disconnected' : 'Error'}
          </div>
          <button 
            onClick={toggleInfo}
            className="bg-gray-700/80 hover:bg-gray-600/80 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 border border-gray-600/50"
          >
            {showInfo ? 'Hide Info' : 'Show Info'}
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-red-500/25"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* User Info Panel */}
      {showInfo && (
        <div className="absolute top-20 left-4 z-10 p-6 bg-gray-800/90 backdrop-blur-md text-white rounded-2xl shadow-2xl max-w-sm border border-gray-700/50 transition-all duration-300">
          <div className="border-b border-gray-600/50 pb-3 mb-4">
            <h3 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Your Profile</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300 font-medium">Name:</span>
              <span className="font-semibold text-blue-300">{userName}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300 font-medium">Character:</span>
              <span className="font-semibold text-purple-300">{character}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300 font-medium">Seat:</span>
              <span className="font-semibold text-green-300">{mySeatIndex >= 0 ? `#${mySeatIndex + 1}` : 'Not assigned'}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-600/50 pt-4">
            <h3 className="font-bold mb-3 text-lg bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Other Users ({users.length - 1 >= 0 ? users.length - 1 : 0})
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {users.filter(user => user.id !== 'local-user').map((user, index) => (
                <div key={user.id || index} className="flex justify-between items-center p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                  <span className="font-medium text-white">{user.name}</span>
                  <span className="text-sm text-gray-400 bg-gray-600/50 px-2 py-1 rounded">Seat #{user.seatIndex + 1}</span>
                </div>
              ))}
              {users.filter(user => user.id !== 'local-user').length === 0 && (
                <div className="text-center p-4 bg-gray-700/20 rounded-lg border border-gray-600/30">
                  <p className="text-sm text-gray-400 italic">No other users in the room</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-full">
        <EnvironmentComp
          users={users}
          socket={socket}
          mySeatIndex={mySeatIndex}
          seatPositions={SEAT_POSITIONS}
        />
      </div>
    </div>
  );
}

export default Room;