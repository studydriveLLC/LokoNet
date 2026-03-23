import { io } from 'socket.io-client';
import { getToken } from '../store/secureStoreAdapter';

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || '';

// Extraction securisee de l'origine (ex: http://192.168.1.10:5000)
const getBaseOrigin = (url) => {
  const match = url.match(/^(https?:\/\/[^\/]+)/);
  return match ? match[1] : url;
};

const socketUrl = getBaseOrigin(rawBaseUrl);
let socket = null;

const socketService = {
  connect: async () => {
    if (socket) return socket;
    
    const token = await getToken('accessToken');
    
    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });
    
    socket.on('connect', () => console.log('[Socket] Connecte au serveur avec succes'));
    socket.on('connect_error', (err) => console.log('[Socket] Erreur:', err.message));
    
    return socket;
  },
  
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('[Socket] Deconnecte');
    }
  },
  
  updateToken: (token) => {
    if (socket) {
      socket.auth = { token };
      socket.disconnect().connect();
    }
  }
};

export default socketService;