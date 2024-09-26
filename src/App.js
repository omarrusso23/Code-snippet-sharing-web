import React, { useState } from "react";
import MonacoEditorComponent from "./Components/Code Editor/MonacoEditorComponent";
import LandingPage from "./Components/Landing/Landing";
import CodeCompilerComponent from "./Components/Code Compiler/CodeCompilerComponent";
import { ResizableBox } from "react-resizable";
import { useSelector } from "react-redux";
import "./App.css";
import "react-resizable/css/styles.css";

const App = () => {
  const [code, setCode] = useState("HTML");
  const [loading, setLoading] = useState(true);
  const [editorWidth, setEditorWidth] = useState(1400);
  const editorValue = useSelector((state) => state.editor.value);
  const editorLanguage = useSelector((state) => state.editor.language);

  const handleCodeChange = (newValue) => {
    setCode(newValue);
  };

  const handleLoadComplete = () => {
    setLoading(false);
  };

  return (
    <div className="App">
      {loading ? (
        <LandingPage onLoadComplete={handleLoadComplete} />
      ) : (
        <div className="resizable-container">
          <ResizableBox
            className="editor-resizable"
            width={editorWidth}
            height={Infinity}
            minConstraints={[800, Infinity]}
            maxConstraints={[1500, Infinity]}
            axis="x"
            handle={<div className="custom-handle-right" />}
            onResize={(e, data) => setEditorWidth(data.size.width)} // Correctly updating the width
          >
            <div className="main-editor-container">
              <MonacoEditorComponent
                value={code}
                onChange={handleCodeChange}
                width="100%"
                height="100%"
              />
            </div>
          </ResizableBox>

          <div className="other-content">
            <CodeCompilerComponent
              editorValue={editorValue}
              editorLanguage={editorLanguage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
