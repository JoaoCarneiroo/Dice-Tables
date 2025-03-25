import { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Criar UserContext
const UserContext = createContext(null);

// Componente UserProvider para gerir User State
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    nome: '',
    cargos: {
      isAdmin: false,
      isGestor: false,
    },
    isLoggedIn: false,
  });

  // Função Login do Utilizador
  const login = (name, cargos) => {
    setUser({ nome: name, cargos: cargos, isLoggedIn: true });
  };

  // Função Logout do Utilizador
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


export const useUser = () => {
  return useContext(UserContext);
};
