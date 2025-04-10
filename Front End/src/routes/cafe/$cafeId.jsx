import React, { useEffect, useState } from 'react';
import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { toast, Bounce } from 'react-toastify';

export const Route = createFileRoute('/cafe/$cafeId')({
  component: CafeDetalhes,
});

function CafeDetalhes() {
  console.log('Renderizando CafeDetalhes');

  const { cafeId } = useParams('/$cafeId');
  console.log('cafeId:', cafeId);

  const navigate = useNavigate();

  const [cafe, setCafe] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    ID_Mesa: '',
    ID_Jogo: '',
    Hora_Inicio: '',
    Hora_Fim: ''
  });

  const fetchCafeDetalhes = async () => {
    try {
      setLoading(true);
      const [cafeRes, mesasRes, jogosRes] = await Promise.all([
        axios.get(`http://localhost:3000/cafes/porId/${cafeId}`),
        axios.get(`http://localhost:3000/mesas/${cafeId}`),
        axios.get(`http://localhost:3000/jogos/${cafeId}`)
      ]);
      setCafe(cafeRes.data);
      setMesas(mesasRes.data);
      setJogos(jogosRes.data);
    } catch (err) {
      toast.error('Erro ao carregar dados do café');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafeDetalhes();
  }, [cafeId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:3000/reservas', formData, { withCredentials: true });
      toast.success('Reserva criada com sucesso!', {
        position: 'bottom-center',
        theme: 'dark',
        transition: Bounce
      });
      navigate('/perfil');
    } catch (err) {
      toast.error(`Erro ao criar reserva: ${err.response?.data?.error || err.message}`, {
        position: 'bottom-center',
        theme: 'dark',
        transition: Bounce
      });
    }
  };

  if (loading) return <p className="text-center text-white">Carregando detalhes...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-indigo-500 mb-4">{cafe.Nome_Cafe}</h1>
        <p className="mb-2">📍 {cafe.Local}</p>
        <p className="mb-2">🕒 Horário: {cafe.Horario_Abertura}:00 - {cafe.Horario_Fecho}:00</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-gray-400">Mesa</label>
            <select
              name="ID_Mesa"
              value={formData.ID_Mesa}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
              required
            >
              <option value="">Seleciona uma mesa</option>
              {mesas.map((mesa) => (
                <option key={mesa.ID_Mesa} value={mesa.ID_Mesa}>
                  Mesa #{mesa.ID_Mesa} - {mesa.Lugares} lugares
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400">Jogo</label>
            <select
              name="ID_Jogo"
              value={formData.ID_Jogo}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
              required
            >
              <option value="">Seleciona um jogo</option>
              {jogos.map((jogo) => (
                <option key={jogo.ID_Jogo} value={jogo.ID_Jogo}>
                  {jogo.Titulo} ({jogo.Quantidade} disponíveis)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400">Hora de Início</label>
            <input
              type="datetime-local"
              name="Hora_Inicio"
              value={formData.Hora_Inicio}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400">Hora de Fim</label>
            <input
              type="datetime-local"
              name="Hora_Fim"
              value={formData.Hora_Fim}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded"
          >
            Reservar
          </button>
        </form>
      </div>
    </div>
  );
}