import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const compileBackendCode = createAsyncThunk(
  'compiler/compileBackendCode',
  async ({ code, language }) => {
    const response = await fetch('/api/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language }),
    });
    if (!response.ok) {
      throw new Error('Failed to compile code');
    }
    const data = await response.json();
    return data.result;
  }
);

const compilerSlice = createSlice({
  name: 'compiler',
  initialState: {
    compileResult: '',
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(compileBackendCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(compileBackendCode.fulfilled, (state, action) => {
        state.loading = false;
        state.compileResult = action.payload;
      })
      .addCase(compileBackendCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default compilerSlice.reducer;
