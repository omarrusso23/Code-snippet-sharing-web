import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEditorValue, setEditorLanguage } from "../../redux/editorSlice";
import { Editor } from "@monaco-editor/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faCaretDown,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import "./MonacoEditorComponent.css";

const MonacoEditorComponent = () => {
  const dispatch = useDispatch(); // Initialize dispatch
  const editorValue = useSelector((state) => state.editor.value); // Select editor value from the store
  const editorLanguage = useSelector((state) => state.editor.language); // Select editor language from the store

  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isShareClicked, setIsShareClicked] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const [isCodeModified, setIsCodeModified] = useState(false);

  const languages = [
    "javascript",
    "html",
    "python",
    "java",
    "csharp",
    "ruby",
    "c++",
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
  </head>
  <body>
    <h1 id="title">HEY this is compiling</h1>
    <script>
      // Select the h1 element and change its text to uppercase
      const title = document.getElementById('title');
      title.textContent = title.textContent.toUpperCase();
    </script>
  </body>
</html>

`;

  useEffect(() => {
    dispatch(setEditorValue(defaultHtmlSnippet));
    dispatch(setEditorLanguage("html"));
  }, [dispatch]);

  const handleThemeToggle = () => {
    const newTheme = editorTheme === "vs-light" ? "vs-dark" : "vs-light";
    setEditorTheme(newTheme);
    localStorage.setItem("editorTheme", newTheme);
  };

  const handleLanguageSelect = (language) => {
    dispatch(setEditorLanguage(language)); // Dispatch language change
    setShowLanguageMenu(false);
  };

  const handleEditorChange = (value) => {
    dispatch(setEditorValue(value || defaultHtmlSnippet)); // Dispatch editor value change
    setIsCodeModified(true);
  };

  const handleShareClick = async () => {
    const newUniqueId = uuidv4();
    setUniqueId(newUniqueId);
    setShareLink(`${window.location.origin}/${newUniqueId}`);
    setIsShareClicked(true);
    setIsCodeModified(false);

    localStorage.setItem("sharedDocumentId", newUniqueId);

    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");

    // Save code snippet to your backend
    try {
      const response = await fetch(
        "https://localhost:7249/api/codesnippet/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: newUniqueId,
            code: editorValue, // Use the value from Redux store
            language: editorLanguage, // Use the language from Redux store
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

  const fetchSnippet = async (id) => {
    try {
      const response = await fetch(
        //`https://code-snippet-backend-api-eqggeff9h5hgdfhq.spaincentral-01.azurewebsites.net/api/codesnippet/${id}`,
        `https://localhost:7249/api/codesnippet/${id}`,
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
      dispatch(setEditorValue(data.code || defaultHtmlSnippet)); // Use default if data.code is empty
      dispatch(setEditorLanguage(data.language || "html")); // Default to "html" if no language is provided
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
      dispatch(setEditorValue(defaultHtmlSnippet)); // Set default if no ID is found
    }
  }, []);

  return (
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

        <button
          className={`share-button ${!isCodeModified ? "disabled" : ""}`}
          onClick={handleShareClick}
          disabled={!isCodeModified}
        >
          <FontAwesomeIcon icon={faShareNodes} style={{ marginRight: "5px" }} />
          SHARE
        </button>
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
          editorTheme === "vs-light" ? "light-mode-editor" : "dark-mode-editor"
        }`}
      >
        <Editor
          height="87%"
          language={editorLanguage}
          theme={editorTheme}
          value={editorValue}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>
    </div>
  );
};

export default MonacoEditorComponent;
