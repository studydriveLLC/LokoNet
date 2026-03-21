import { apiSlice } from '../slices/apiSlice';
import { getToken } from '../secureStoreAdapter';

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL;

export const resourceApiSlice = apiSlice.injectEndpoints({
endpoints: (builder) => ({
uploadResource: builder.mutation({
queryFn: async (formData, { getState }) => {
// Preparation des headers
const headers = {};

// Recupere le token depuis Redux ou SecureStore
let token = getState().auth?.token;
if (!token) {
token = await getToken('accessToken');
}
if (token) {
headers['Authorization'] = `Bearer ${token}`;
}

// Pour FormData, on n'ajoute PAS Content-Type
// React Native/ fetch va ajouter multipart/form-data avec le boundary automatique

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
}),
}),
overrideExisting: true,
});

export const { useUploadResourceMutation } = resourceApiSlice;
