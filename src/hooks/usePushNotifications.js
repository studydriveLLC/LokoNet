//src/hooks/usePushNotifications.js
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';
import { useRegisterPushTokenMutation } from '../store/api/notificationApiSlice';

export const usePushNotifications = () => {
  const { user } = useSelector((state) => state.auth);
  const [registerToken] = useRegisterPushTokenMutation();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!user) return; 

    const registerForPushNotificationsAsync = async () => {
      try {
        if (Constants.appOwnership === 'expo') {
          console.log('[Push] Mode Expo Go detecte. Generation du token FCM ignoree pour eviter le crash.');
          return;
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('[Push] Permission refusee pour les notifications');
          return;
        }

        const tokenData = await Notifications.getDevicePushTokenAsync();
        const token = tokenData.data;

        if (token) {
          await registerToken(token).unwrap();
          console.log('[Push] Token FCM enregistre avec succes en BDD');
        }
      } catch (error) {
        console.log('[Push] Erreur lors de la recuperation du token push :', error);
      }
    };

    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification recu au premier plan', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification cliquee', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user, registerToken]);
};