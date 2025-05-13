import { useNavigate, createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast, Bounce } from "react-toastify";
import { IoIosArrowBack } from 'react-icons/io';


export const Route = createFileRoute('/painelGestorMesas')({
  beforeLoad: async () => {

    try {
      const response = await axios.get("http://localhost:3000/autenticar/verificar/gestor");

      if (response.status !== 200) {
        throw redirect({to: '/'});
      }

    } catch (err) {
        throw redirect({to: '/'});
    }
  },
  component: PainelGestorMesas,
});


export default function PainelGestorMesas() {
  const navigate = useNavigate();

  const [nomeMesa, setNomeMesa] = useState("");
  const [lugares, setLugares] = useState("");
  const [editingMesa, setEditingMesa] = useState(null);
  const [newNomeMesa, setNewNomeMesa] = useState("");
  const [newLugares, setNewLugares] = useState("");
  const queryClient = useQueryClient();

  const getTokenFromCookie = () => {
    const match = document.cookie.match(/(^| )Authorization=([^;]+)/);
    return match ? match[2] : null;
  };

  const token = getTokenFromCookie();

  // Procurar Café do Gestor Autenticado
  const { data: cafeData, isLoading: cafeLoading, error: cafeError } = useQuery({
    queryKey: ["cafeGestor"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:3000/cafes/gestor", {
        withCredentials: true,
      });
      return response.data;
    },
    enabled: !!token,
  });

  // Mostrar Mesas do Café
  const { data: mesas, isLoading: mesasLoading, error: mesasError } = useQuery({
    queryKey: ["mesas"],
    queryFn: async () => {
      if (cafeData) {
        const response = await axios.get(`http://localhost:3000/mesas/${cafeData.ID_Cafe}`, {
          withCredentials: true,
        });
        return response.data;
      }
    },
    enabled: !!cafeData,
  });

  // Criar Mesas do Café
  const createMesaMutation = useMutation({
    mutationFn: async (newMesa) => {
      const response = await axios.post("http://localhost:3000/mesas", newMesa, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mesas"]);
      setLugares("");
      toast.success('Mesa criada com Sucesso', {
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
      toast.error(`Erro ao criar a Mesa: ${err.response?.data?.error || err.message}`, {
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

  // Atualizar Mesas do Café
  const updateMesaMutation = useMutation({
    mutationFn: async ({ id, nome_mesa, lugares }) => {
      const response = await axios.patch(`http://localhost:3000/mesas/${id}`, { nome_mesa, lugares }, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mesas"]);
      setEditingMesa(null);
      setNewLugares("");
      toast.success('Mesa atualizada com Sucesso', {
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
      toast.error(`Erro ao atualizar a Mesa: ${err.response?.data?.error || err.message}`, {
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

  // Apagar Mesas do Café
  const deleteMesaMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`http://localhost:3000/mesas/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mesas"]);
      toast.success('Mesa apagada com Sucesso', {
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
      toast.error(`Erro ao apagar a Mesa: ${err.response?.data?.error || err.message}`, {
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

  if (cafeLoading || mesasLoading) return <p className="text-gray-300">Carregando informações...</p>;
  if (cafeError || mesasError) return <p className="text-red-500">Erro ao carregar dados: {cafeError?.message || mesasError?.message}</p>;

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-gray-300 relative">
      <button
        onClick={() => navigate({ to: '/painelGestor' })}
        className="absolute top-4 left-4 text-indigo-500 hover:text-indigo-400"
      >
        <IoIosArrowBack className="h-6 w-6" />
      </button>

      <div className="flex items-center justify-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-500">Gerenciar Mesas</h1>
      </div>

      {cafeData && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-indigo-400">Café: {cafeData.Nome_Cafe}</h2>
          <p className="text-gray-400">Local: {cafeData.Local}</p>
          <div className='flex flex-row '>
            {cafeData.Tipo_Cafe === 0 ? (
              <div className='bg-indigo-700 rounded-md p-1.5 my-1.5 font-semibold'>Café com Jogos</div>
            ) : (
              <div className='bg-teal-800 rounded-md p-1.5 my-1.5 font-semibold'>Café sem Jogos</div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Nome da Mesa"
          value={nomeMesa}
          onChange={(e) => setNomeMesa(e.target.value)}
          className="p-3 border border-gray-600 rounded-md w-48 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="Número de lugares"
          value={lugares}
          onChange={(e) => setLugares(e.target.value)}
          className="p-3 border border-gray-600 rounded-md w-48 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => createMesaMutation.mutate({
            lugares: Number(lugares),
            nome_mesa: nomeMesa
          })}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-all"
        >
          Criar Mesa
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {mesas?.map((mesa) => (
          <div key={mesa.ID_Mesa} className="bg-gray-800 p-4 rounded-lg shadow-md hover:scale-[102%] transition-all">
            <p className="text-indigo-400 font-semibold">{mesa.Nome_Mesa}</p>
            <p className="text-gray-400">Lugares: {mesa.Lugares}</p>
            {editingMesa === mesa.ID_Mesa && (
              <>
                <input
                  type="text"
                  placeholder="Nome da mesa"
                  value={newNomeMesa}
                  onChange={(e) => setNewNomeMesa(e.target.value)}
                  className="p-2 border border-gray-600 rounded-md w-full bg-gray-700 text-gray-200 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Número de lugares"
                  onChange={(e) => setNewLugares(e.target.value)}
                  className="p-2 border border-gray-600 rounded-md w-full bg-gray-700 text-gray-200 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  if (editingMesa === mesa.ID_Mesa) {
                    updateMesaMutation.mutate({ id: mesa.ID_Mesa, lugares: Number(newLugares), nome_mesa: newNomeMesa });
                  } else {
                    setEditingMesa(mesa.ID_Mesa);
                    setNewLugares(mesa.Lugares);
                  }
                }}
                className="px-3 py-1 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-400 transition-all"
              >
                {editingMesa === mesa.ID_Mesa ? "Confirmar" : "Atualizar"}
              </button>
              {editingMesa === mesa.ID_Mesa && (
                <button
                  onClick={() => setEditingMesa(null)}
                  className="px-3 py-1 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-all"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => deleteMesaMutation.mutate(mesa.ID_Mesa)}
                className="px-3 py-1 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 transition-all"
              >
                Apagar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
