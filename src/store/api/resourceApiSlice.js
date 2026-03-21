import { apiSlice } from '../slices/apiSlice';

export const resourceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadResource: builder.mutation({
      query: (formData) => ({
        url: '/resources',
        method: 'POST',
        body: formData,
        // SUPPRESSION DE formData: true, comme dans Yély !
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useUploadResourceMutation } = resourceApiSlice;