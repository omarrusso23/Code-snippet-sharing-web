import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { compileBackendCode } from "../../redux/compilerSlice";
import "./CodeCompilerComponent.css";

const CodeCompilerComponent = ({ editorValue, editorLanguage }) => {
  const dispatch = useDispatch();
  const { compileResult, loading, error } = useSelector(
    (state) => state.compiler
  );
  const [iframeSrcDoc, setIframeSrcDoc] = useState("");
  const [buttonActive, setButtonActive] = useState(false); // New state to control button position
  const [showLoader, setShowLoader] = useState(false); // State to control loader visibility

  const handleCompileClick = (e) => {
    e.stopPropagation();
    
    // Move button to bottom-right first
    setButtonActive(true);
    
    // Show loader immediately
    setShowLoader(true);
    
    // Set a timeout to ensure the loader is shown for at least 1 second
    const loaderTimeout = setTimeout(() => {
      // Compile HTML/JavaScript code for iframe
      if (["html", "javascript"].includes(editorLanguage)) {
        const doc = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Output</title>
            <style>
              body {
                margin: 0;
                padding: 10px;
                font-family: Arial, sans-serif;
                word-wrap: break-word;
                white-space: pre-wrap;
              }
              #consoleOutput {
                background: #f4f4f4;
                padding: 10px;
                border: 1px solid #ccc;
                max-height: 300px;
                overflow-y: auto;
              }
            </style>
          </head>
          <body>
            ${editorLanguage === "html" ? editorValue : ""}
            ${editorLanguage === "css" ? `<style>${editorValue}</style>` : ""}
            ${
              editorLanguage === "javascript"
                ? `
              <script>
                const originalConsoleLog = console.log;
                let logOutput = "";
    
                console.log = function(message) {
                  logOutput += message + "<br>";
                  originalConsoleLog(message);
                };
    
                ${editorValue}
    
                document.body.innerHTML += "<div id='consoleOutput'>" + logOutput + "</div>";
              </script>
            `
                : ""
            }
          </body>
          </html>
        `;
        setIframeSrcDoc(doc);
      } else {
        // For backend languages, dispatch compile action
        dispatch(
          compileBackendCode({ code: editorValue, language: editorLanguage })
        );
      }

      // Hide loader after processing (if loading is false)
      if (!loading) {
        setShowLoader(false);
      }
    }, 1000); // Set to 1 second

    // Clear the timeout if the component unmounts before the timeout finishes
    return () => clearTimeout(loaderTimeout);
  };

  useEffect(() => {
    if (compileResult) {
      const doc = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Compiled Output</title>
        </head>
        <body>
          <pre>${compileResult}</pre>
        </body>
        </html>
      `;
      setIframeSrcDoc(doc);
      // Hide loader when compile result is available
      setShowLoader(false);
    }
  }, [compileResult]);

  useEffect(() => {
    return () => {
      setIframeSrcDoc("");
    };
  }, []);

  return (
    <div className="compiler">
      {showLoader && (
        <div className="overlay">
          <div className="loader"></div>
          <p className="compiling-message">COMPILING YOUR CODE...</p>
        </div>
      )}
      {error && !compileResult && (
        <p style={{ color: "red" }}>Error: {error}</p>
      )}
      <iframe
        srcDoc={iframeSrcDoc}
        title="Code Output"
        className="iframe-compiler"
      />

      <button
        onClick={handleCompileClick}
        disabled={loading}
        className={`compile-button ${buttonActive || iframeSrcDoc ? "iframe-active" : ""}`}
      >
        COMPILE
      </button>
    </div>
  );
};

export default CodeCompilerComponent;
