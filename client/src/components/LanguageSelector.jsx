import React from "react";
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.keys(LANGUAGE_VERSIONS);

const LanguageSelector = ({ language, onLanguageChange }) => {
  return (
    <div className="mt-10 flex justify-start pl-10">
      <form className="bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
        <label
          htmlFor="languages"
          className="block mb-2 text-sm font-semibold text-gray-300"
        >
          Select a Language:
        </label>
        <select
          value={language}
          id="languages"
          onChange={(e) => onLanguageChange(e.target.value)}
          className="block w-full p-2 bg-gray-800 text-gray-100 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang} className="bg-gray-900">
              {lang}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
};

export default LanguageSelector;