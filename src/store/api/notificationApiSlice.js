//src/store/api/notificationApiSlice.js
import { apiSlice } from '../slices/apiSlice';
import socketService from '../../services/socketService';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, limit = 50 } = {}) => ({
        url: `/v1/notifications?page=${page}&limit=${limit}`,
      }),
      providesTags: (result) => {
        const notifs = result?.data?.notifications || result?.notifications;
        return notifs
          ? [
              ...notifs.map(({ _id }) => ({ type: 'Notification', id: String(_id) })),
              { type: 'Notification', id: 'LIST' }
            ]
          : [{ type: 'Notification', id: 'LIST' }];
      }
    }),
    
    getUnreadCount: builder.query({
      query: () => ({ url: '/v1/notifications/unread-count' }),
      providesTags: ['NotificationCount'],
      async onCacheEntryAdded(arg, { dispatch, updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded.catch(() => {}); 
          
          const handleNewNotification = () => {
            updateCachedData((draft) => {
              if (draft?.data !== undefined && typeof draft.data.count === 'number') {
                draft.data.count += 1;
              } else if (typeof draft?.count === 'number') {
                draft.count += 1;
              } else if (draft) {
                draft.count = 1;
              }
            });
            
            dispatch(notificationApiSlice.util.invalidateTags([{ type: 'Notification', id: 'LIST' }]));
          };

          if (socketService && typeof socketService.on === 'function') {
            socketService.on('new_notification', handleNewNotification);
          }

          await cacheEntryRemoved;
          
          if (socketService && typeof socketService.off === 'function') {
            socketService.off('new_notification', handleNewNotification);
          }
        } catch (e) {
          // Securite
        }
      }
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/v1/notifications/${id}/read`,
        method: 'PATCH',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const stringId = String(id);
        const patchResult = dispatch(
          notificationApiSlice.util.updateQueryData('getNotifications', { page: 1, limit: 50 }, (draft) => {
            const notifs = draft?.data?.notifications || draft?.notifications;
            if (notifs) {
              const notif = notifs.find(n => String(n._id) === stringId);
              if (notif) notif.isRead = true;
            }
          })
        );
        try {
          await queryFulfilled;
          dispatch(notificationApiSlice.util.invalidateTags(['NotificationCount']));
        } catch {
          patchResult.undo();
        }
      }
    }),

    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/v1/notifications/read-all',
        method: 'PATCH',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApiSlice.util.updateQueryData('getNotifications', { page: 1, limit: 50 }, (draft) => {
            const notifs = draft?.data?.notifications || draft?.notifications;
            if (notifs) {
              notifs.forEach(n => { n.isRead = true; });
            }
          })
        );
        
        const patchCount = dispatch(
          notificationApiSlice.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            if (draft?.data !== undefined) draft.data.count = 0;
            else if (draft) draft.count = 0;
          })
        );

        try {
          await queryFulfilled;
          dispatch(notificationApiSlice.util.invalidateTags(['NotificationCount']));
        } catch {
          patchResult.undo();
          patchCount.undo();
        }
      }
    }),

    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/v1/notifications/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const stringId = String(id);
        const patchResult = dispatch(
          notificationApiSlice.util.updateQueryData('getNotifications', { page: 1, limit: 50 }, (draft) => {
            if (draft?.data?.notifications) {
              draft.data.notifications = draft.data.notifications.filter(n => String(n._id) !== stringId);
            } else if (draft?.notifications) {
              draft.notifications = draft.notifications.filter(n => String(n._id) !== stringId);
            }
          })
        );
        try {
          await queryFulfilled;
          dispatch(notificationApiSlice.util.invalidateTags(['NotificationCount']));
        } catch {
          patchResult.undo();
        }
      }
    }),

    deleteMultipleNotifications: builder.mutation({
      query: (notificationIds) => ({
        url: '/v1/notifications/bulk-delete',
        method: 'POST',
        body: { notificationIds },
      }),
      async onQueryStarted(notificationIds, { dispatch, queryFulfilled }) {
        const stringIds = notificationIds.map(id => String(id));
        const patchResult = dispatch(
          notificationApiSlice.util.updateQueryData('getNotifications', { page: 1, limit: 50 }, (draft) => {
            if (draft?.data?.notifications) {
              draft.data.notifications = draft.data.notifications.filter(n => !stringIds.includes(String(n._id)));
            } else if (draft?.notifications) {
              draft.notifications = draft.notifications.filter(n => !stringIds.includes(String(n._id)));
            }
          })
        );
        try {
          await queryFulfilled;
          dispatch(notificationApiSlice.util.invalidateTags(['NotificationCount']));
        } catch {
          patchResult.undo();
        }
      }
    }),

    deleteAllNotifications: builder.mutation({
      query: () => ({
        url: '/v1/notifications/all',
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApiSlice.util.updateQueryData('getNotifications', { page: 1, limit: 50 }, (draft) => {
            if (draft?.data?.notifications) {
              draft.data.notifications = [];
            } else if (draft?.notifications) {
              draft.notifications = [];
            }
          })
        );
        
        const patchCount = dispatch(
          notificationApiSlice.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            if (draft?.data !== undefined) draft.data.count = 0;
            else if (draft) draft.count = 0;
          })
        );

        try {
          await queryFulfilled;
          dispatch(notificationApiSlice.util.invalidateTags(['NotificationCount']));
        } catch {
          patchResult.undo();
          patchCount.undo();
        }
      }
    }),

    registerPushToken: builder.mutation({
      query: (token) => ({
        url: '/v1/notifications/register-token',
        method: 'POST',
        body: { token },
      }),
    }),

    unregisterPushToken: builder.mutation({
      query: (token) => ({
        url: '/v1/notifications/unregister-token',
        method: 'POST',
        body: { token },
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteMultipleNotificationsMutation,
  useDeleteAllNotificationsMutation,
  useRegisterPushTokenMutation,
  useUnregisterPushTokenMutation,
} = notificationApiSlice;