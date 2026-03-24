import { apiSlice } from '../slices/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/v1/auth/login', method: 'POST', body: credentials }),
    }),
    register: builder.mutation({
      query: (userData) => ({ url: '/v1/auth/register', method: 'POST', body: userData }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/v1/auth/logout', method: 'POST' }),
    }),
    updateProfile: builder.mutation({
      query: (data) => ({ url: '/v1/users/updateMe', method: 'PATCH', body: data }),
    }),
    updatePassword: builder.mutation({
      query: (data) => ({ url: '/v1/auth/updateMyPassword', method: 'PATCH', body: data }),
    }),
    uploadAvatar: builder.mutation({
      query: (formData) => ({ url: '/v1/users/avatar', method: 'POST', body: formData }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useUploadAvatarMutation,
} = authApiSlice;