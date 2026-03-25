//src/store/api/socialApiSlice.js
import { apiSlice } from '../slices/apiSlice';

export const socialApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFollowStatus: builder.query({
      query: (targetId) => `/v1/social/status/${targetId}`,
      providesTags: (result, error, arg) => [{ type: 'FollowStatus', id: arg }],
    }),
    getMyFollowStats: builder.query({
      query: () => '/v1/social/my-stats',
      providesTags: ['FollowStats'],
    }),
    followUser: builder.mutation({
      query: (targetId) => ({
        url: `/v1/social/follow/${targetId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'FollowStatus', id: arg },
        'FollowStats'
      ],
    }),
    unfollowUser: builder.mutation({
      query: (targetId) => ({
        url: `/v1/social/unfollow/${targetId}`,
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