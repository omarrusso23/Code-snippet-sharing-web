import React, { useState, useEffect } from "react";
import MonacoEditorComponent from "./Components/Code Editor/MonacoEditorComponent";
import CodeCompilerComponent from "./Components/Code Compiler/CodeCompilerComponent";
import { ResizableBox } from "react-resizable";
import { useSelector } from "react-redux";
import "./App.css";
import "react-resizable/css/styles.css";

const App = () => {
  const initialWidth = window.innerWidth < 1370 ? 800 : 1200;
  const [code, setCode] = useState("HTML");
  const [editorWidth, setEditorWidth] = useState(initialWidth);
  const [isCompilerVisible, setIsCompilerVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const editorValue = useSelector((state) => state.editor.value);
  const editorLanguage = useSelector((state) => state.editor.language);

  const handleCodeChange = (newValue) => {
    setCode(newValue);
  };

  const toggleCompiler = () => {
    setIsCompilerVisible((prev) => !prev);
  };

  // Effect to handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setEditorWidth(window.innerWidth < 1370 ? 800 : 1200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="App">
      <div className="resizable-container">
        <ResizableBox
          className="editor-resizable"
          width={editorWidth}
          height={Infinity}
          minConstraints={[300, Infinity]}
          maxConstraints={[1200, Infinity]}
          axis="x"
          handle={<span className="custom-handle" />}
          onResize={(e, data) => setEditorWidth(data.size.width)}
          draggableOpts={{ enableUserSelectHack: false }}
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

        {isCompilerVisible && ( 
          <div className="other-content">
            <CodeCompilerComponent
              editorValue={editorValue}
              editorLanguage={editorLanguage}
            />
          </div>
        )}

        {isMobile && (
          <button className="toggle-compiler" onClick={toggleCompiler}>
            {isCompilerVisible ? "Hide Compiler" : "Show Compiler"}
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
