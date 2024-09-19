import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faCaretDown,
  faShareNodes,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import "./MonacoEditorComponent.css";

const MonacoEditorComponent = () => {
  const [editorTheme, setEditorTheme] = useState("vs-light");
  const [editorLanguage, setEditorLanguage] = useState("html");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isShareClicked, setIsShareClicked] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [editorValue, setEditorValue] = useState(""); // Default to empty initially
  const editorRef = useRef(null);
  const [isCodeModified, setIsCodeModified] = useState(false);

  const languages = [
    "javascript",
    "typescript",
    "html",
    "css",
    "python",
    "java",
    "csharp",
    "php",
    "ruby",
    "jsx",
  ];

  const defaultHtmlSnippet = `<html>
  <head>
    <title>HTML Sample</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style type="text/css">
      h1 {
        color: #CCA3A3;
      }
    </style>
    <script type="text/javascript">
      alert("I am a sample... visit devChallengs.io for more projects");
    </script>
  </head>
  <body>
    <h1>Heading No.1</h1>
    <input disabled type="button" value="Click me" />
  </body>
</html>
`;

  const handleThemeToggle = () => {
    const newTheme = editorTheme === "vs-light" ? "vs-dark" : "vs-light";
    setEditorTheme(newTheme);
    localStorage.setItem("editorTheme", newTheme);
  };

  const handleLanguageSelect = (language) => {
    setEditorLanguage(language);
    setShowLanguageMenu(false);
  };

  const handleEditorChange = (value) => {
    setEditorValue(value);
    setIsCodeModified(true); // Mark the code as modified
  };

  const handleShareClick = async () => {
    const newUniqueId = uuidv4();
    setUniqueId(newUniqueId);
    setShareLink(`${window.location.origin}/${newUniqueId}`);
    setIsShareClicked(true);
    setIsCodeModified(false); // Reset code modified state

    localStorage.setItem("sharedDocumentId", newUniqueId);

    try {
      const response = await fetch(
        "https://localhost:7249/api/CodeSnippet/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: newUniqueId,
            code: editorValue,
            language: editorLanguage,
            createdAt: new Date().toISOString(),
          }),
        }
      );

      const text = await response.text();
      if (text) {
        const data = JSON.parse(text);
        console.log("Saved data:", data);
      } else {
        console.log("No content returned from the server");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  const fetchSnippet = async (id) => {
    try {
      const response = await fetch(
        `https://localhost:7249/api/CodeSnippet/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setEditorValue(data.code || defaultHtmlSnippet); // Use default if data.code is empty
      setEditorLanguage(data.language || "html"); // Default to "html" if no language is provided
    } catch (error) {
      console.error("Error fetching document:", error);
      setEditorValue(defaultHtmlSnippet); // Fallback to default snippet if error occurs
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("editorTheme");
    if (savedTheme) {
      setEditorTheme(savedTheme);
    }

    const currentPath = window.location.pathname;
    const idFromPath = currentPath.replace("/", "");

    if (idFromPath) {
      setUniqueId(idFromPath);
      setShareLink(`${window.location.origin}/${idFromPath}`);
      fetchSnippet(idFromPath);
    } else {
      setEditorValue(defaultHtmlSnippet); // Set default if no ID is found
    }
  }, []);

  return (
    <div className="monaco-body-container">
      <div className="editor-container">
        <div className="editor-button-container">
          <button
            className={`language-toggle-button ${
              editorTheme === "vs-light" ? "light-mode-btn" : "dark-mode-btn"
            }`}
            onClick={() => setShowLanguageMenu((prev) => !prev)}
          >
            {editorLanguage}
            <FontAwesomeIcon icon={faCaretDown} style={{ marginLeft: "5px" }} />
          </button>

          <button className="theme-toggle-button" onClick={handleThemeToggle}>
            {editorTheme === "vs-light" ? (
              <FontAwesomeIcon icon={faMoon} />
            ) : (
              <FontAwesomeIcon icon={faSun} />
            )}
          </button>

          {!isShareClicked ? (
            <button
              className={`share-button ${!isCodeModified ? "disabled" : ""}`}
              onClick={handleShareClick}
              disabled={!isCodeModified} // Disable button if code is not modified
            >
              <FontAwesomeIcon
                icon={faShareNodes}
                style={{ marginRight: "5px" }}
              />
              SHARE
            </button>
          ) : (
            <div className="share-confirmation">
              <span>Link: {shareLink}</span>
              <button className="copy-link-button" onClick={handleCopyLink}>
                <FontAwesomeIcon icon={faCopy} style={{ marginRight: "5px" }} />
                Copy Link
              </button>
            </div>
          )}
        </div>

        {showLanguageMenu && (
          <ul
            className={`language-dropdown ${
              editorTheme === "vs-light"
                ? "light-mode-dropdown"
                : "dark-mode-dropdown"
            }`}
          >
            {languages.map((lang) => (
              <li key={lang} onClick={() => handleLanguageSelect(lang)}>
                {lang}
              </li>
            ))}
          </ul>
        )}

        <div
          className={`monaco-editor-container ${
            editorTheme === "vs-light"
              ? "light-mode-editor"
              : "dark-mode-editor"
          }`}
        >
          <Editor
            height="87%"
            language={editorLanguage === "jsx" ? "typescript" : editorLanguage}
            theme={editorTheme}
            value={editorValue} // Use value here
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
            }} // Save editor instance to ref
          />
        </div>
      </div>
    </div>
  );
};

export default MonacoEditorComponent;
