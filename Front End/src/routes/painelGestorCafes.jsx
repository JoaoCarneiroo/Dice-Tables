import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const Route = createFileRoute('/painelGestorCafes')({
  component: PainelGestorCafes,
})

export default function PainelGestorCafes() {
  const [lugares, setLugares] = useState("");
  const queryClient = useQueryClient();

  // Buscar mesas do café do gestor
  const { data: mesas, isLoading } = useQuery({
    queryKey: ["mesas"],
    queryFn: async () => {
      const response = await axios.get("/mesas");
      return response.data;
    },
  });

  // Criar uma nova mesa
  const mutation = useMutation({
    mutationFn: async (newMesa) => {
      const response = await axios.post("/mesas", newMesa, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mesas"]);
      setLugares("");
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gerenciar Mesas</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="Número de lugares"
          value={lugares}
          onChange={(e) => setLugares(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-48"
        />
        <button
          onClick={() => mutation.mutate({ lugares: Number(lugares) })}
          className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Criar Mesa
        </button>
      </div>
      {isLoading ? (
        <p>Carregando mesas...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {mesas?.map((mesa) => (
            <div
              key={mesa.ID_Mesa}
              className="border border-gray-300 rounded-md p-4 bg-gray-50"
            >
              <p>ID: {mesa.ID_Mesa}</p>
              <p>Lugares: {mesa.Lugares}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
