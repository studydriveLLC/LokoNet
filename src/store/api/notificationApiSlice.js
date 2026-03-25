// src/store/api/notificationApiSlice.js
import { apiSlice } from '../slices/apiSlice';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/v1/notifications?page=${page}&limit=${limit}`,
      }),
      providesTags: (result) =>
        result?.data?.notifications
          ? [
              ...result.data.notifications.map(({ _id }) => ({ type: 'Notification', id: _id })),
              { type: 'Notification', id: 'LIST' }
            ]
          : [{ type: 'Notification', id: 'LIST' }]
    }),
    
    getUnreadCount: builder.query({
      query: () => ({ url: '/v1/notifications/unread-count' }),
      providesTags: ['NotificationCount'],
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/v1/notifications/${id}/read`,
        method: 'PATCH',
      }),
      // Mise a jour optimiste pour eteindre le fond bleu instantanement
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApiSlice.util.updateQueryData('getNotifications', { page: 1, limit: 20 }, (draft) => {
            const notif = draft?.data?.notifications?.find(n => String(n._id) === String(id));
            if (notif) notif.isRead = true;
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
      invalidatesTags: ['Notification', 'NotificationCount'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApiSlice;