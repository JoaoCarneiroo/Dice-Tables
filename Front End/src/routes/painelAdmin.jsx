import React, { useEffect, useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import axios from 'axios';

export const Route = createFileRoute('/painelAdmin')({
  beforeLoad: async () => {

    try {
      const response = await axios.get("http://localhost:3000/api/autenticar/verificar/admin", {
        withCredentials: true
      });
      
      if (response.status !== 200) {
        throw redirect({ to: '/' });
      }

    } catch (err) {
      throw redirect({ to: '/' });
    }
  },
  component: PainelAdmin,
});

// Cada Utilizador
function CardUtilizador({ utilizador, onPromover }) {
  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-md hover:scale-[102%] transition-all">
      <h2 className="text-xl font-semibold text-indigo-600">{utilizador.Nome}</h2>
      <p className="text-gray-300">Email: {utilizador.Email}</p>
      <p className="text-gray-300">Cargo: {utilizador.Cargo}</p>

      {/* Botão para promover a gestor */}
      <button
        onClick={() => onPromover(utilizador.ID_Utilizador)}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
      >
        Promover a Gestor
      </button>
    </div>
  );
}

// Cada Gestor
function CardGestor({ gestor, onDespromover }) {

  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <h2 className="text-xl font-semibold text-indigo-600">{gestor.Nome}</h2>
      <p className="text-gray-300">Email: {gestor.Email}</p>
      <p className="text-gray-300">Cargo: {gestor.Cargo}</p>

      {/* Botão para despromover para utilizador comum */}
      <button
        onClick={() => onDespromover(gestor)}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500"
      >
        Despromover a Utilizador
      </button>
    </div>
  );
}

function PainelAdmin() {
  const [utilizadores, setUtilizadores] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [gestorToDespromover, setGestorToDespromover] = useState(null);

  // Função para buscar utilizadores e gestores
  const fetchUtilizadores = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/autenticar', { withCredentials: true });
      const allUtilizadores = response.data;

      // Separando gestores dos outros utilizadores
      const gestores = allUtilizadores.filter((utilizador) => utilizador.Cargo === 'Gestor');
      const outrosUtilizadores = allUtilizadores.filter((utilizador) => utilizador.Cargo !== 'Gestor' && utilizador.Cargo !== 'Administrador');

      setGestores(gestores);
      setUtilizadores(outrosUtilizadores);
    } catch (err) {
      setError('Erro ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  };

  // Função para promover um utilizador a gestor
  const promoverUtilizador = async (idUtilizador) => {
    try {
      await axios.post('http://localhost:3000/api/gestor', { ID_Utilizador: idUtilizador }, { withCredentials: true });
      fetchUtilizadores(); // Atualiza a lista após promoção
    } catch (err) {
      setError('Erro ao promover utilizador');
    }
  };

  // Função para abrir o modal de confirmação
  const handleDespromoverClick = (gestor) => {
    setGestorToDespromover(gestor);
    setShowModal(true);
  };

  // Função para despromover um gestor com confirmação
  const despromoverGestor = async () => {
    if (!gestorToDespromover) return;

    try {
      console.log(`ID do gestor a ser despromovido: ${gestorToDespromover.ID_Utilizador}`);
      await axios.delete(`http://localhost:3000/api/gestor/${gestorToDespromover.ID_Utilizador}`, { withCredentials: true });
      fetchUtilizadores();
      setShowModal(false);
    } catch (err) {
      setError('Erro ao despromover gestor');
      setShowModal(false);
    }
  };

  const cancelDespromover = () => {
    setShowModal(false);
  };

  useEffect(() => {
    fetchUtilizadores();
  }, []);

  if (loading) {
    return <div>Carregando utilizadores...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold text-center text-white mb-6">Painel de Administração</h1>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirmação</h3>
            <p className="text-gray-800">Você tem certeza que deseja despromover o gestor? Esta ação removerá o café associado a ele.</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={cancelDespromover}
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={despromoverGestor}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gestores */}
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">Gestores</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {gestores.map((gestor) => (
          <CardGestor key={gestor.ID_Utilizador} gestor={gestor} onDespromover={handleDespromoverClick} />
        ))}
      </div>

      {/* Utilizadores */}
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">Utilizadores</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {utilizadores.map((utilizador) => (
          <CardUtilizador key={utilizador.ID_Utilizador} utilizador={utilizador} onPromover={promoverUtilizador} />
        ))}
      </div>
    </div>
  );
}