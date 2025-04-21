import React, { useEffect, useState } from 'react';
import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { toast, Bounce } from 'react-toastify';

export const Route = createFileRoute('/cafe/$cafeId')({
  component: CafeDetalhes,
});

function CafeDetalhes() {
  const { cafeId } = useParams('/$cafeId');

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

  const [mostrarReserva, setMostrarReserva] = useState(false);
  const [mostrarJogos, setMostrarJogos] = useState(false);

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
      const toUTCISOString = (localDateTime) => {
        const [date, time] = localDateTime.split('T');
        return new Date(`${date}T${time}:00.000Z`).toISOString();
      };

      const payload = {
        ...formData,
        Hora_Inicio: toUTCISOString(formData.Hora_Inicio),
        Hora_Fim: toUTCISOString(formData.Hora_Fim)
      };

      if (cafe.Tipo_Cafe === 0 && formData.ID_Jogo) {
        payload.ID_Jogo = formData.ID_Jogo;
      }

      await axios.post('http://localhost:3000/reservas', payload, { withCredentials: true });
      toast.success('Reserva criada com sucesso!', {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      navigate('/perfil');
    } catch (err) {
      toast.error(`Erro ao criar Reserva: ${err.response?.data?.error || err.message}`, {
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
  };

  const handleComprarJogo = async (id) => {
    try {
      await axios.post(`http://localhost:3000/jogos/comprar/${id}`, null, {
        withCredentials: true,
      });
      toast.success('Jogo comprado com sucesso!', {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      fetchCafeDetalhes();
    } catch (err) {
      toast.error(`Erro ao comprar jogo: ${err.response?.data?.error || err.message}`, {
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
  };

  if (loading) return <p className="text-center text-white">Carregando detalhes...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6">

        {/* Detalhes do Café */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={`http://localhost:3000/uploads/cafes/${cafe.Imagem_Cafe}`}
            alt={cafe.Nome_Cafe}
            className="w-full md:w-1/3 rounded-lg object-cover shadow-md h-64"
          />
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold text-indigo-400">{cafe.Nome_Cafe}</h1>
            <p className="italic text-gray-300">{cafe.Descricao}</p>
            <p>📍 <span className="text-gray-300">{cafe.Local}</span></p>
            <p>🕒 <span className="text-gray-300">Horário: {cafe.Horario_Abertura}:00 - {cafe.Horario_Fecho}:00</span></p>
            <p>🎲 <span className="text-gray-300">Tipo: {cafe.Tipo_Cafe === 0 ? 'Café com Jogos' : 'Café sem Jogos'}</span></p>
          </div>
        </div>

        {/* Mapa do Google Maps */}
        <div>
          <h2 className="text-lg font-semibold text-indigo-400 mb-2">📍 Localização</h2>
          <iframe
            title="Mapa do Café"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(cafe.Coordenadas)}&z=15&output=embed`}
            className="w-full h-64 rounded shadow-md"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Botão para mostrar o formulário e mostrar Jogos*/}
        <div className="text-center flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <button
            onClick={() => {
              setMostrarReserva((prev) => {
                if (!prev) setMostrarJogos(false);
                return !prev;
              });
            }}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 transition rounded-lg text-white"
          >
            {mostrarReserva ? 'Cancelar Reserva' : 'Fazer Reserva'}
          </button>

          <button
            onClick={() => {
              setMostrarJogos((prev) => {
                if (!prev) setMostrarReserva(false);
                return !prev;
              });
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 transition rounded-lg text-white"
          >
            {mostrarJogos ? 'Esconder Jogos' : 'Ver Jogos Disponíveis'}
          </button>
        </div>



        {/* Formulário de Reserva */}
        <div className={`transition-all duration-300 overflow-hidden ${mostrarReserva ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} mt-4`}>
          {mostrarReserva && (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      {mesa.Nome_Mesa} - {mesa.Lugares} lugares
                    </option>
                  ))}
                </select>
              </div>

              {cafe.Tipo_Cafe === 0 && (
                <div>
                  <label className="block text-gray-400">Jogo</label>
                  <select
                    name="ID_Jogo"
                    value={formData.ID_Jogo}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded"
                  >
                    <option value="">Seleciona um jogo</option>
                    {jogos.map((jogo) => (
                      <option key={jogo.ID_Jogo} value={jogo.ID_Jogo}>
                        {jogo.Nome_Jogo} ({jogo.Quantidade} disponíveis)
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                className="w-full bg-green-600 hover:bg-green-500 text-white p-2 rounded"
              >
                Confirmar Reserva
              </button>
            </form>
          )}
        </div>

        {/* Lista de Jogos com opção de compra */}
        <div className={`transition-all duration-300 overflow-hidden ${mostrarJogos ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} mt-4`}>
          {mostrarJogos && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jogos.length === 0 ? (
                <p className="text-gray-400">Nenhum jogo disponível neste café.</p>
              ) : (
                jogos.map((jogo) => (
                  <div key={jogo.ID_Jogo} className="bg-gray-700 p-4 rounded-lg shadow flex flex-col gap-2">
                    <h3 className="text-xl font-semibold text-white">{jogo.Nome_Jogo}</h3>
                    <p className="text-gray-300">Disponíveis: {jogo.Quantidade}</p>
                    <button
                      onClick={() => handleComprarJogo(jogo.ID_Jogo)}
                      disabled={jogo.Quantidade < 1}
                      className={`px-4 py-2 rounded text-white transition ${jogo.Quantidade > 0
                        ? 'bg-green-600 hover:bg-green-500'
                        : 'bg-gray-500 cursor-not-allowed'
                        }`}
                    >
                      Comprar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}