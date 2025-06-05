import { useNavigate, createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast, Bounce } from "react-toastify";
import { IoIosArrowBack } from 'react-icons/io';

export const Route = createFileRoute('/painelGestorJogos')({
  beforeLoad: async () => {

    try {
      const response = await axios.get("http://localhost:3000/api/autenticar/verificar/gestor", {
        withCredentials: true
      });
      
      if (response.status !== 200) {
        throw redirect({ to: '/' });
      }

    } catch (err) {
      throw redirect({ to: '/' });
    }
  },
  component: PainelGestorJogos,
})

export default function PainelGestorJogos() {
  const navigate = useNavigate();

  const [nomeJogo, setNomeJogo] = useState("");
  const [notasJogo, setNotasJogo] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [editingJogo, setEditingJogo] = useState(null);
  const [editData, setEditData] = useState({ nomeJogo: "", notasJogo: "", preco: "", quantidade: "" });
  const queryClient = useQueryClient();

  const getTokenFromCookie = () => {
    const match = document.cookie.match(/(^| )Authorization=([^;]+)/);
    return match ? match[2] : null;
  };

  const token = getTokenFromCookie();

  const { data: cafeData, isLoading: cafeLoading, error: cafeError } = useQuery({
    queryKey: ["cafeGestor"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:3000/api/cafes/gestor", {
        withCredentials: true,
      });
      return response.data;
    },
    enabled: !!token,
  });

  const { data: jogos, isLoading: jogosLoading, error: jogosError } = useQuery({
    queryKey: ["jogos"],
    queryFn: async () => {
      if (cafeData) {
        const response = await axios.get(`http://localhost:3000/api/jogos/${cafeData.ID_Cafe}`, {
          withCredentials: true,
        });
        return response.data;
      }
    },
    enabled: !!cafeData,
  });

  // Criar Jogo
  const createJogoMutation = useMutation({
    mutationFn: async (novoJogo) => {
      const response = await axios.post("http://localhost:3000/api/jogos", novoJogo, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jogos"]);
      setNomeJogo("");
      setNotasJogo("");
      setPreco("");
      setQuantidade("");
      toast.success('Jogo criado com Sucesso', {
        position: "bottom-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    },
    onError: (err) => {
      toast.error(`Erro ao criar o Jogo: ${err.response?.data?.error || err.message}`, {
        position: "bottom-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  });

  // Atualizar Jogo
  const updateJogoMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await axios.patch(`http://localhost:3000/api/jogos/${id}`, data, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jogos"]);
      setEditingJogo(null);
      toast.success('Jogo Atualizado com Sucesso', {
        position: "bottom-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar o Jogo: ${err.response?.data?.error || err.message}`, {
        position: "bottom-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  });

  // Apagar Jogo
  const deleteJogoMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`http://localhost:3000/api/jogos/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jogos"]);
      toast.success('Jogo criado com Sucesso', {
        position: "bottom-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    },
    onError: (err) => {
      toast.error(`Erro ao apagar o Jogo: ${err.response?.data?.error || err.message}`, {
        position: "bottom-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  });

  if (cafeLoading || jogosLoading)
    return <p className="text-gray-300">Carregando informações...</p>;
  if (cafeError || jogosError)
    return (
      <p className="text-red-500">
        Erro ao carregar dados: {cafeError?.message || jogosError?.message}
      </p>
    );

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-gray-300 relative">
      <button
        onClick={() => navigate({ to: '/painelGestor' })}
        className="absolute top-4 left-4 text-indigo-500 hover:text-indigo-400"
      >
        <IoIosArrowBack className="h-6 w-6" />
      </button>

      <div className="flex items-center justify-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-500">Gerenciar Jogos</h1>
      </div>

      {cafeData && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-indigo-400">Café: {cafeData.Nome_Cafe}</h2>
          <p className="text-gray-400">Local: {cafeData.Local}</p>
          <div className="flex flex-row">
            {cafeData.Tipo_Cafe === 0 ? (
              <div className="bg-indigo-700 rounded-md p-1.5 my-1.5 font-semibold">
                Café com Jogos
              </div>
            ) : (
              <div className="bg-teal-800 rounded-md p-1.5 my-1.5 font-semibold">
                Café sem Jogos
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulário de Criação de Jogo */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md w-2xl">
        <h3 className="text-xl font-semibold text-indigo-400">Criar Novo Jogo</h3>
        <input
          type="text"
          placeholder="Nome do Jogo"
          value={nomeJogo}
          onChange={(e) => setNomeJogo(e.target.value)}
          className="p-2 border border-gray-600 rounded-md w-full bg-gray-700 text-gray-200 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Notas do Jogo"
          value={notasJogo}
          onChange={(e) => setNotasJogo(e.target.value)}
          className="p-2 border border-gray-600 rounded-md w-full bg-gray-700 text-gray-200 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="p-2 border border-gray-600 rounded-md w-full bg-gray-700 text-gray-200 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          className="p-2 border border-gray-600 rounded-md w-full bg-gray-700 text-gray-200 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() =>
            createJogoMutation.mutate({
              nomeJogo: nomeJogo,
              notasJogo: notasJogo,
              preco: Number(preco),
              quantidade: Number(quantidade),
            })
          }
          className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-all w-full"
        >
          Criar Jogo
        </button>
      </div>

      {/* Mostrar os Jogos */}
      <div className="grid grid-cols-3 gap-4">
        {jogos?.map((jogo) => (
          <div
            key={jogo.ID_Jogo}
            className="bg-gray-800 p-4 rounded-lg shadow-md hover:scale-[102%] transition-all"
          >
            <p className="text-indigo-400 font-semibold">{jogo.Nome_Jogo}</p>
            <p className="text-gray-400">Notas: {jogo.Notas_Jogo}</p>
            <p className="text-gray-400">Preço: {jogo.Preco}€</p>
            <p className="text-gray-400">Quantidade: {jogo.Quantidade}</p>

            {/* Botões de Atualizar e Apagar Lado a Lado */}
            <div className="mt-4 flex gap-2">
              {editingJogo !== jogo.ID_Jogo && (
                <button
                  onClick={() => {
                    setEditingJogo(jogo.ID_Jogo);
                    setEditData({
                      nomeJogo: jogo.Nome_Jogo,
                      notasJogo: jogo.Notas_Jogo,
                      preco: jogo.Preco,
                      quantidade: jogo.Quantidade,
                    });
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-400 transition-all"
                >
                  Atualizar
                </button>
              )}
              <button
                onClick={() => deleteJogoMutation.mutate(jogo.ID_Jogo)}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 transition-all"
              >
                Apagar
              </button>
            </div>

            {/* Formulário de Edição do Jogo (Aparece somente quando está editando) */}
            {editingJogo === jogo.ID_Jogo && (
              <div className="mt-4">
                <input
                  type="text"
                  onChange={(e) =>
                    setEditData({ ...editData, nomeJogo: e.target.value })
                  }
                  placeholder="Nome do Jogo"
                  className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  onChange={(e) =>
                    setEditData({ ...editData, notasJogo: e.target.value })
                  }
                  placeholder="Notas do Jogo"
                  className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  onChange={(e) =>
                    setEditData({ ...editData, preco: e.target.value })
                  }
                  placeholder="Preço"
                  className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  onChange={(e) =>
                    setEditData({ ...editData, quantidade: e.target.value })
                  }
                  placeholder="Quantidade"
                  className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateJogoMutation.mutate({
                        id: jogo.ID_Jogo,
                        data: {
                          nomeJogo: editData.nomeJogo,
                          notasJogo: editData.notasJogo,
                          preco: Number(editData.preco),
                          quantidade: Number(editData.quantidade),
                        },
                      })
                    }
                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-400 transition-all w-full"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setEditingJogo(null)}
                    className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-all w-full"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
