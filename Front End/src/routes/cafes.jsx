import React, { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import axios from 'axios';

export const Route = createFileRoute('/cafes')({
  component: Cafes,
});

// Cada quadrado de um Café
function CardCafe({ cafe }) {
  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <h2 className="text-xl font-semibold text-indigo-600">{cafe.Nome_Cafe}</h2>
      {cafe.Imagem_Cafe ? (
        <img
          src={`http://localhost:3000/uploads/cafes/${cafe.Imagem_Cafe}`}
          alt={cafe.Nome_Cafe}
          className="mt-2 mb-4 w-full h-48 object-contain rounded-md"
          style={{ maxHeight: '200px', objectFit: 'contain' }}
        />
      ) : (
        <div className="mt-2 mb-4 w-full rounded-md bg-gray-500 text-center text-gray-200 p-2">
          Imagem não disponível
        </div>
      )}
      <p className="text-gray-300">Local: {cafe.Local}</p>
      <p className="text-gray-300">Tipo: {cafe.Tipo_Cafe === 0 ? 'Café com Jogos' : 'Café sem Jogos'}</p>
      <p className="text-gray-300">Horário de Abertura: {cafe.Horario_Abertura}:00</p>
      <p className="text-gray-300">Horário de Fecho: {cafe.Horario_Fecho}:00</p>
      <div className="mt-4">
        <Link
          to={`/cafes/${cafe.ID_Cafe}`}
          className="inline-block text-center px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}

function Cafes() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCafes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/cafes');
      setCafes(response.data);
    } catch (err) {
      setError('Erro ao carregar os cafés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  if (loading) {
    return <div>Carregando cafés...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold text-center text-white mb-6">Lista de Cafés</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cafes.map((cafe) => (
          <CardCafe key={cafe.ID_Cafe} cafe={cafe} />
        ))}
      </div>
    </div>
  );
}