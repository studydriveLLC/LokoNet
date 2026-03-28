// src/hooks/useServerWakeup.js
// HOOK DE SURVIE RESEAU - Confiance stricte .env & Detection 404
// CSCSM Level: Bank Grade

import { useEffect, useRef, useState } from 'react';

const useServerWakeup = () => {
  const [isServerReady, setIsServerReady] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const attemptRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let retryTimer = null;
    
    // Utilisation STRICTE de l'URL du fichier .env, sans aucune modification arbitraire
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const healthUrl = `${cleanBaseUrl}/health`;

    const pingServer = async () => {
      if (!isMounted) return;
      attemptRef.current += 1;

      // SECURITE ANTI-BLOCAGE : Forcage apres 3 echecs pour ne pas bloquer l'UI
      if (attemptRef.current > 3) {
        if (isMounted) {
          setIsServerReady(true);
          setIsWakingUp(false);
        }
        return;
      }

      // Timeout court : on veut juste savoir si la machine repond
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetch(`${healthUrl}?t=${Date.now()}`, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal 
        });

        clearTimeout(timeoutId);

        // HACK STRATEGIQUE : Si le serveur repond 404, c'est que la route n'existe pas,
        // mais cela PROUVE que le conteneur Render est allume et actif !
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