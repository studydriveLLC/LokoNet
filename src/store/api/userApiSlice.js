//src/store/api/userApiSlice.js
import { apiSlice } from '../slices/apiSlice';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: (userId) => `/v1/users/${userId}`,
      transformResponse: (response) => response.data?.profile,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetUserProfileQuery } = userApiSlice;