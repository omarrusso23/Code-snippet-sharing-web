import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faCaretDown, faShareNodes, faCopy } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid"; // Import UUID
import "./MonacoEditorComponent.css";

const MonacoEditorComponent = () => {
  const [editorTheme, setEditorTheme] = useState("vs-light");
  const [editorLanguage, setEditorLanguage] = useState("html");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isShareClicked, setIsShareClicked] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [shareLink, setShareLink] = useState("");

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
    setShowLanguageMenu(false); // Close the menu after selection
  };

  const handleShareClick = () => {
    const newUniqueId = uuidv4();
    setUniqueId(newUniqueId);
    setShareLink(`${window.location.origin}/${newUniqueId}`);
    setIsShareClicked(true);
    
    // Store the unique ID in local storage
    localStorage.setItem('sharedDocumentId', newUniqueId);

    // Redirect to the new URL
    window.location.href = `/${newUniqueId}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  useEffect(() => {
    // Load the saved theme from localStorage
    const savedTheme = localStorage.getItem("editorTheme");
    if (savedTheme) {
      setEditorTheme(savedTheme);
    }

    // Check if there's a unique ID in the URL
    const currentPath = window.location.pathname;
    const idFromPath = currentPath.replace("/", "");

    if (idFromPath) {
      setUniqueId(idFromPath);
      setShareLink(`${window.location.origin}/${idFromPath}`);

      // Fetch shared document state (e.g., from an API)
      // If document exists, enable the Share button if necessary

      // For demonstration, we'll assume the document exists and has changes
      // This should be replaced with actual logic to check for document changes
      const hasChanges = true; // Replace with actual check
      if (hasChanges) {
        setIsShareClicked(false); // Enable the Share button if there are changes
      }
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
            <button className="share-button" onClick={handleShareClick}>
              <FontAwesomeIcon icon={faShareNodes} style={{ marginRight: "5px" }} />
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
            defaultValue={editorLanguage === "html" ? defaultHtmlSnippet : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default MonacoEditorComponent;
