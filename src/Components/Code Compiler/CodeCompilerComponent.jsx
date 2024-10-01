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

  const handleCompileClick = (e) => {
    e.stopPropagation();
  
    if (["html", "javascript"].includes(editorLanguage)) {
      // Create an HTML document with the provided code
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
              word-wrap: break-word; /* Forces long words to wrap */
              white-space: pre-wrap; /* Preserves spacing and line breaks */
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
              // Capture console.log output
              const originalConsoleLog = console.log;
              let logOutput = "";
  
              console.log = function(message) {
                logOutput += message + "<br>";
                originalConsoleLog(message); // Optional: also log to the original console
              };
  
              // Execute the user code
              ${editorValue}
  
              // Display console output
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
      dispatch(
        compileBackendCode({ code: editorValue, language: editorLanguage })
      );
    }
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
          <pre>${compileResult}</pre> <!-- Display the result -->
        </body>
        </html>
      `;
      setIframeSrcDoc(doc);
    }
  }, [compileResult]);

  useEffect(() => {
    return () => {
      setIframeSrcDoc("");
    };
  }, []);

  return (
    <div className="compiler">
      {loading && <p>Compiling...</p>}
      {error && !compileResult && (
        <p style={{ color: "red" }}>Error: {error}</p>
      )}
      {iframeSrcDoc && (
        <iframe
          srcDoc={iframeSrcDoc}
          title="Code Output"
          className="iframe-compiler"
        />
      )}

      <button
        onClick={handleCompileClick}
        disabled={loading}
        className={`compile-button ${iframeSrcDoc ? "iframe-active" : ""}`}
      >
        COMPILE
      </button>
    </div>
  );
};

export default CodeCompilerComponent;
