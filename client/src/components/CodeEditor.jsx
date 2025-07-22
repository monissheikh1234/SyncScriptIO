import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";

const CodeEditor = ({ socketRef, roomId }) => {
  const editorRef = useRef(null);
  const [value, setValue] = useState(CODE_SNIPPETS["javascript"]);
  const [language, setLanguage] = useState("javascript");
  const [isDeviceMedium, setIsDeviceMedium] = useState(false);

  // Prevent rebroadcast of remote code
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    
    const checkDevice = () => setIsDeviceMedium(window.innerWidth<768);
    checkDevice();
    window.addEventListener("resize",checkDevice)
  
    return () => {
      window.removeEventListener("resize",checkDevice)
    }
  }, [])
  

  useEffect(() => {
    if (!socketRef.current) return;

    const handleCodeChange = ({ code }) => {
      const editor = editorRef.current;
      if (!editor) return;

      const currentCode = editor.getValue();
      if (currentCode === code) return; // avoid unnecessary updates

      // Save current cursor position
      const selection = editor.getSelection();

      // Prevent loop (if you're broadcasting change on `onChange`)
      isRemoteUpdate.current = true;

      editor.setValue(code);

      // Restore the cursor position (or at least try to be close)
      if (selection) {
        editor.setSelection(selection);
      }
    };

    const handleSyncData = ({ code, language }) => {
      // console.log("Received sync-data:", { code, language });
      if (code) {
        isRemoteUpdate.current = true;
        editorRef.current?.setValue(code);
        setValue(code);
      }
      if (language) {
        setLanguage(language);
      }
    };

    socketRef.current.on("code-change", handleCodeChange);

    // Handle language changes -

    const handleLanguageChange = ({ language }) => {
      // console.log('Recieved language-change: ',language);
      setLanguage(language);
      setValue(CODE_SNIPPETS[language]);
    };

    socketRef.current.on("language-change", handleLanguageChange);

    socketRef.current.on("sync-code", handleSyncData);

    return () => {
      socketRef.current.off("code-change", handleCodeChange);
      socketRef.current.off("language-change", handleLanguageChange);
      socketRef.current.off("sync-code", handleSyncData);
    };
  }, [socketRef.current]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onLanguageChange = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
    // console.log("Emitting language change:",language);

    socketRef.current.emit("language-change", {
      roomId,
      language,
    });
  };

  const onCodeChange = (newValue) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    setValue(newValue);
    // console.log("Emitting code:", newValue);

    socketRef.current?.emit("code-change", {
      roomId,
      code: newValue,
    });
  };

  return (
    <div className="flex md:flex-row flex-col bg-darkBg">
      <div className="text-light md:w-1/2 w-full">
        <LanguageSelector
          language={language}
          onLanguageChange={onLanguageChange}
        />
        <Editor
          key={language}
          height={isDeviceMedium?"60vh":"75vh"}
          theme="vs-dark"
          language={language}
          value={value}
          onChange={onCodeChange}
          onMount={onMount}
        />
      </div>
      <div className="md:w-1/2 w-full text-light">
        <Output editorRef={editorRef} language={language} />
      </div>
    </div>
  );
};

export default CodeEditor;
