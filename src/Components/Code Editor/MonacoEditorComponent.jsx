import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEditorValue, setEditorLanguage } from "../../redux/editorSlice";
import { Editor } from "@monaco-editor/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import javaScriptIcon from "../../Assets/js.png";
import htmlIcon from "../../Assets/html-5.png";
import pythonIcon from "../../Assets/python.png";
import javaIcon from "../../Assets/java.png";
import csharpIcon from "../../Assets/c-sharp.png";
import cppIcon from "../../Assets/c-.png";
import rubyIcon from "../../Assets/ruby.png";
import { faSun, faMoon, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import "./MonacoEditorComponent.css";

const MonacoEditorComponent = () => {
  const dispatch = useDispatch();
  const editorValue = useSelector((state) => state.editor.value);
  const editorLanguage = useSelector((state) => state.editor.language);

  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isShareClicked, setIsShareClicked] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [shareLink, setShareLink] = useState("");
  const editorRef = useRef(null);
  const [isCodeModified, setIsCodeModified] = useState(false);

  const [languageTooltip, setLanguageTooltip] = useState("");
  const [showLanguageTooltip, setShowLanguageTooltip] = useState(false);
  const [shareTooltip, setShareTooltip] = useState("");
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const languages = [
    { name: "javascript", icon: javaScriptIcon },
    { name: "html", icon: htmlIcon },
    { name: "python3", icon: pythonIcon },
    { name: "java", icon: javaIcon },
    { name: "csharp", icon: csharpIcon },
    { name: "cpp", icon: cppIcon },
    { name: "ruby", icon: rubyIcon },
  ];

  const languageDisplayNames = {
    javascript: "JavaScript",
    html: "HTML",
    python3: "Python",
    java: "Java",
    csharp: "C#",
    cpp: "C++",
    ruby: "Ruby",
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

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
</html>`;

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
    dispatch(setEditorLanguage(language.name));
    setShowLanguageMenu(false);
  };

  const handleEditorChange = (value) => {
    if (value !== "") {
      dispatch(setEditorValue(value));
      setIsCodeModified(true);
    }
  };

  const handleShareClick = async () => {
    const newUniqueId = uuidv4();
    setUniqueId(newUniqueId);
    const newShareLink = `${window.location.origin}/${newUniqueId}`;
    setShareLink(newShareLink);
    setIsShareClicked(true);
    setIsCodeModified(false);

    localStorage.setItem("sharedDocumentId", newUniqueId);
    navigator.clipboard.writeText(newShareLink);
    setShareTooltip("Link Copied!"); // Set share tooltip text
    setShowShareTooltip(true); // Show share tooltip

    setTimeout(() => {
      setShowShareTooltip(false);
    }, 2000);

    // Reset language tooltip on share click
    setShowLanguageTooltip(false);

    try {
      const response = await fetch(
        "https://code-snippet-backend-api-eqggeff9h5hgdfhq.spaincentral-01.azurewebsites.net/api/codesnippet/save",
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

  const fetchSnippet = async (id) => {
    try {
      const response = await fetch(
        `https://code-snippet-backend-api-eqggeff9h5hgdfhq.spaincentral-01.azurewebsites.net/api/codesnippet/${id}`,
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
      dispatch(setEditorValue(data.code || defaultHtmlSnippet));
      dispatch(setEditorLanguage(data.language || "html"));
    } catch (error) {
      console.error("Error fetching document:", error);
      dispatch(setEditorValue(defaultHtmlSnippet)); // Fallback in case of an error
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
      dispatch(setEditorValue(defaultHtmlSnippet));
    }
  }, [dispatch]);

  return (
    <div className="editor-container">
      <div
        className={`sidebar ${
          editorTheme === "vs-light"
            ? "light-mode-sidebar"
            : "dark-mode-sidebar"
        }`}
      >
        <ul className="language-list">
          {languages.map((lang) => (
            <li
              key={lang.name}
              className={editorLanguage === lang.name ? "active" : ""}
              onClick={() => handleLanguageSelect(lang)}
              onMouseEnter={() => {
                setLanguageTooltip(languageDisplayNames[lang.name]);
                setShowLanguageTooltip(true);
              }}
              onMouseLeave={() => setShowLanguageTooltip(false)}
            >
              <img className="language-icon" src={lang.icon} alt={lang.name} />
              {showLanguageTooltip &&
                languageTooltip === languageDisplayNames[lang.name] && (
                  <div className="tooltip" style={{ left: "40px" }}>
                    {languageTooltip}
                  </div>
                )}
            </li>
          ))}
        </ul>
        <div className="button-container">
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
            <FontAwesomeIcon
              icon={faShareNodes}
              style={{ marginRight: "5px" }}
            />
            SHARE
          </button>
        </div>

        {showShareTooltip && (
          <div className="share-tooltip" style={{ left: "40px" }}>
            {shareTooltip}
          </div>
        )}
      </div>
      <div className="editor-main">
        <Editor
          height="100%"
          language={editorLanguage}
          theme={editorTheme}
          value={editorValue}
          onChange={handleEditorChange}
          options={{
            automaticLayout: true,
          }}
          onMount={(editor) => (editorRef.current = editor)}
        />
      </div>
    </div>
  );
};

export default MonacoEditorComponent;
