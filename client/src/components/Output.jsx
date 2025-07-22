import React, { useState } from "react";
import { executeCode } from "../api";
import { toast } from "react-toastify";

const Output = ({ editorRef, language }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(sourceCode, language);
      if (result.stderr) {
        setOutput("Error!!\n\n" + result.output);
      } else {
        setOutput(result.output);
      }
    } catch (error) {
      console.log(error);
      toast.error("Some Error Occured");
      setOutput("An error occured while running the code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-5 border-l border-gray-600 h-screen px-3 bg-darkBg">
      <div className=" font-semibold text-gray-100 pt-7 text-2xl rounded-lg shadow-lg w-full max-w-md mb-3">
        Output-
      </div>
      <button
        className="border border-green-600 text-green-600 px-2.5 py-1.5 rounded-md hover:text-light hover:bg-green-600 hover:cursor-pointer transition"
        onClick={runCode}
      >
        Run Code
      </button>
      <div className="flex-1 mt-6 h-3/4 bg-gray-900 rounded-md p-4 overflow-y-auto text-sm text-gray-200 shadow-inner">
        <pre className="whitespace-pre-wrap break-words">
          {isLoading ? (
            <span className="text-gray-500">Executing your code...</span>
          ) : output ? (
            output
          ) : (
            <span className="text-gray-500">
              {'Click "Run Code" to see the output here.'}
            </span>
          )}
        </pre>
      </div>
    </div>
  );
};

export default Output;
