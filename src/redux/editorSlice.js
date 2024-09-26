import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: '',
    language: 'HTML', 
};

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        setEditorValue: (state, action) => {
            state.value = action.payload;
        },
        setEditorLanguage: (state, action) => {
            state.language = action.payload;
        },
        resetEditor: (state) => {
            state.value = '';
            state.language = 'javascript';
        },
    },
});

export const { setEditorValue, setEditorLanguage, resetEditor } = editorSlice.actions;
export default editorSlice.reducer;
