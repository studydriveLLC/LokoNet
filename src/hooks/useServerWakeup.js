// src/hooks/useServerWakeup.js
// HOOK DE SURVIE RESEAU - Synchronisation Socket.io & Route LokoNet V1
// CSCSM Level: Bank Grade

import { useEffect, useRef, useState } from 'react';
import socketService from '../services/socketService';

const useServerWakeup = () => {
  const [isServerReady, setIsServerReady] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const attemptRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let retryTimer = null;
    
    // Bypass absolu : Si le Socket est connecte, le backend est deja operationnel
    if (socketService.isConnected) {
       setIsServerReady(true);
       return;
    }

    const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // LokoNet exige le prefixe /v1 pour ses routes
    const healthUrl = `${cleanBaseUrl}/v1/health`;

    const pingServer = async () => {
      if (!isMounted) return;
      
      // Seconde verification au cas ou le Socket se connecte pendant le delai
      if (socketService.isConnected) {
        setIsServerReady(true);
        setIsWakingUp(false);
        return;
      }

      attemptRef.current += 1;

      if (attemptRef.current > 3) {
        if (isMounted) {
          setIsServerReady(true);
          setIsWakingUp(false);
        }
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetch(`${healthUrl}?t=${Date.now()}`, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal 
        });

        clearTimeout(timeoutId);

        if (response.ok || response.status === 404) {
          if (isMounted) {
            setIsServerReady(true);
            setIsWakingUp(false);
          }
        } else {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
      } catch (error) {
        if (isMounted) {
          setIsWakingUp(true);
          retryTimer = setTimeout(pingServer, 2000);
        }
      }
    };

    pingServer();

    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  return { isServerReady, isWakingUp };
};

export default useServerWakeup;