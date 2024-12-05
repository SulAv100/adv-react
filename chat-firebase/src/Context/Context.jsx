// Context.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase"; // Correct import
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

// Create Context for Auth
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
