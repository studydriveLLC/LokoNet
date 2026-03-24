import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    errorToast: {
      isVisible: false,
      message: '',
    },
    successToast: {
      isVisible: false,
      message: '',
    }
  },
  reducers: {
    showErrorToast: (state, action) => {
      state.errorToast.isVisible = true;
      state.errorToast.message = action.payload.message || 'Une erreur est survenue.';
    },
    hideErrorToast: (state) => {
      state.errorToast.isVisible = false;
      state.errorToast.message = '';
    },
    showSuccessToast: (state, action) => {
      state.successToast.isVisible = true;
      state.successToast.message = action.payload.message || 'Action reussie.';
    },
    hideSuccessToast: (state) => {
      state.successToast.isVisible = false;
      state.successToast.message = '';
    }
  }
});

export const { showErrorToast, hideErrorToast, showSuccessToast, hideSuccessToast } = uiSlice.actions;
export default uiSlice.reducer;