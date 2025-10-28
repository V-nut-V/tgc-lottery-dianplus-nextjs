"use client";
import { useState, useEffect, createContext } from "react";

export const SettingsContext = createContext();

const SettingsContextProvider = ({ children }) => {
  const [size, setSize] = useState(70);
  
  useEffect(() => {
    const store_size = localStorage.getItem("store_size");
    if (store_size) setSize(parseInt(store_size));
  }, []);

  useEffect(() => {
    localStorage.setItem("store_size", size);
    document.documentElement.style.fontSize = size + "%";
  }, [size]);

  return (
    <SettingsContext.Provider
      value={{
        size,
        setSize,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContextProvider;
