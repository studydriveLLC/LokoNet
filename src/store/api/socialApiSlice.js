//src/store/api/socialApiSlice.js
import { apiSlice } from '../slices/apiSlice';

export const socialApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFollowStatus: builder.query({
      query: (targetId) => `/social/status/${targetId}`,
      providesTags: (result, error, arg) => [{ type: 'FollowStatus', id: arg }],
    }),
    getMyFollowStats: builder.query({
      query: () => '/social/my-stats',
      providesTags: ['FollowStats'],
    }),
    followUser: builder.mutation({
      query: (targetId) => ({
        url: `/social/follow/${targetId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'FollowStatus', id: arg },
        'FollowStats'
      ],
    }),
    unfollowUser: builder.mutation({
      query: (targetId) => ({
        url: `/social/unfollow/${targetId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'FollowStatus', id: arg },
        'FollowStats'
      ],
    }),
  }),
});

export const {
  useGetFollowStatusQuery,
  useGetMyFollowStatsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = socialApiSlice;