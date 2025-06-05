import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Criar UserContext
const UserContext = createContext(null);

// Componente UserProvider para gerir User State
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Tentar carregar do localStorage
    const storedUser = localStorage.getItem('user');
    return storedUser
      ? JSON.parse(storedUser)
      : { nome: '', cargos: { isAdmin: false, isGestor: false }, isLoggedIn: false };
  });

  // Atualizar localStorage sempre que o estado do usuário mudar
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // Função Login do Utilizador
  const login = (name, cargos) => {
    const newUser = { nome: name, cargos, isLoggedIn: true };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser)); // Salvar no localStorage
  };

  // Função Logout do Utilizador
  const logout = () => {
    axios.post('http://localhost:3000/api/autenticar/logout', {}, { withCredentials: true })
      .then(() => {
        const emptyUser = { nome: '', cargos: { isAdmin: false, isGestor: false }, isLoggedIn: false };
        setUser(emptyUser);
        localStorage.removeItem('user'); // Remover do localStorage
      })
      .catch(err => console.error("Erro ao fazer logout:", err));
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para acessar o contexto
export const useUser = () => useContext(UserContext);
