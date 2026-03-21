import { apiSlice } from '../slices/apiSlice';

export const resourceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getResources: builder.query({
      query: ({ page = 1, limit = 10, category, level, search, sort } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (category) params.append('category', category);
        if (level) params.append('level', level);
        if (search) params.append('search', search);
        if (sort) params.append('sort', sort);
        return { url: `/v1/resources?${params.toString()}` };
      },
      transformResponse: (response) => {
        return response.data?.resources || [];
      },
      // RESILIENCE RESEAU : Garde en cache frontend pendant 5 minutes.
      // Évite les rechargements inutiles si le réseau vacille.
      keepUnusedDataFor: 300, 
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Resource', id: _id })),
              { type: 'Resource', id: 'LIST' }
            ]
          : [{ type: 'Resource', id: 'LIST' }],
    }),
    getResource: builder.query({
      query: (id) => ({ url: `/v1/resources/${id}` }),
      transformResponse: (response) => response.data?.resource,
      keepUnusedDataFor: 300,
      providesTags: (result, error, id) => [{ type: 'Resource', id }],
    }),
    uploadResource: builder.mutation({
      queryFn: async (formData, { getState }) => {
        const headers = {};
        let token = getState().auth?.token;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
        const fullUrl = `${rawBaseUrl}/v1/resources`;
        try {
          const response = await fetch(fullUrl, {
            method: 'POST',
            body: formData,
            headers,
          });
          const data = await response.json();
          if (!response.ok) {
            return { error: { status: response.status, data } };
          }
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: [{ type: 'Resource', id: 'LIST' }],
    }),
    logDownload: builder.mutation({
      query: (id) => ({ url: `/v1/resources/${id}/download`, method: 'POST' }),
      transformResponse: (response) => response.data,
    }),
    deleteResource: builder.mutation({
      query: (id) => ({ url: `/v1/resources/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Resource', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetResourcesQuery,
  useGetResourceQuery,
  useUploadResourceMutation,
  useLogDownloadMutation,
  useDeleteResourceMutation,
} = resourceApiSlice;