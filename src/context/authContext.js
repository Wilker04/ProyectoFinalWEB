import { createContext, useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  return context;
};


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubuscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log({ currentUser });
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubuscribe();
  }, []);


  return (
    <authContext.Provider
      value={{
        signup,
        login,
        user,
        logout,
        loading,
      }}
    >
      {children}
    </authContext.Provider>
  );
}