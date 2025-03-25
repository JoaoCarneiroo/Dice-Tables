import { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Create the UserContext
const UserContext = createContext(null);

// UserProvider component to manage user state
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    nome: '',
    cargos: {
      isAdmin: false,
      isGestor: false,
    },
    isLoggedIn: false,
  });

  // Function to log in the user
  const login = (name, cargos) => {
    setUser({ nome: name, cargos: cargos, isLoggedIn: true });
  };

  // Function to log out the user
const logout = () => {
  axios.post('http://localhost:3000/autenticar/logout', {}, { withCredentials: true })
    .then(() => {
      setUser({ nome: '', cargos: { isAdmin: false, isGestor: false }, isLoggedIn: false });
    })
    .catch(err => console.error("Erro ao fazer logout:", err));
};

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

//Custom hook to use UserContext
export const useUser = () => {
  return useContext(UserContext);
};
