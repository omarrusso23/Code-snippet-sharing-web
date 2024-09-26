import { configureStore } from "@reduxjs/toolkit";
import compilerReducer from "./compilerSlice";
import editorReducer from "./editorSlice"; // Import the new editor reducer

const store = configureStore({
    reducer: {
        compiler: compilerReducer,
        editor: editorReducer, // Add the editor reducer
    },
});

export default store;