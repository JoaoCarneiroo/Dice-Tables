import React, { useEffect, useState } from 'react';
import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { toast, Bounce } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';

export const Route = createFileRoute('/cafe/$cafeId')({
  component: CafeDetalhes,
});

function CafeDetalhes() {
  const { cafeId } = useParams('/$cafeId');
  const stripePromise = loadStripe('pk_test_51RQUSAQsEvSErosmSEbBhJSjnXc9LBQ1m4HGsXc2TbU4Xkd6aGdj6UZju1LLbKYMmkhOqXhKBL2WFefeL0F1EV5b00RxfPrnN7');

  const navigate = useNavigate();

  // const getTokenFromCookie = () => {
  //   const match = document.cookie.match(/(^| )Authorization=([^;]+)/);
  //   return match ? match[2] : null;
  // };

  // const token = getTokenFromCookie();

  // useEffect(() => {
  //   if (!token) {
  //     setTimeout(() => {
  //       navigate({ to: '/login' });
  //     }, 100);
  //   }
  // }, [token, navigate]);

  const [cafe, setCafe] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    ID_Mesa: '',
    ID_Jogo: '',
    Hora_Inicio: '',
    Hora_Fim: '',
    Nome_Grupo: '',
    Lugares_Grupo: ''
  });

  const [mostrarReserva, setMostrarReserva] = useState(false);
  const [mostrarJogos, setMostrarJogos] = useState(false);

  const [reservasDisponiveis, setReservasDisponiveis] = useState([]);
  const [mostrarReservasDisponiveis, setMostrarReservasDisponiveis] = useState(false);

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
      const stripe = await stripePromise;

      // 1. Chama o endpoint para criar a sessão
      const response = await axios.post(`http://localhost:3000/jogos/comprar/${id}`, null, {
        withCredentials: true,
      });

      const sessionId = response.data.sessionId;

      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        toast.error(`Erro no redirecionamento: ${result.error.message}`, {
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

    } catch (err) {
      toast.error(`Erro ao iniciar checkout: ${err.response?.data?.error || err.message}`, {
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
    };
  };

  const buscarReservasDisponiveis = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/reservas/grupo/${cafeId}`, { withCredentials: true });
      setReservasDisponiveis(Array.isArray(res.data) ? res.data : []);
      setMostrarReservasDisponiveis(true);
    } catch (err) {
      toast.error(`Erro ao procurar reservas com lugares: ${err.response?.data?.error || err.message}`, {
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

  const juntarAoGrupo = async (idGrupo) => {
    try {
      await axios.post(`http://localhost:3000/reservas/juntar/${idGrupo}`, null, { withCredentials: true });
      toast.success('Juntou-se ao Grupo com sucesso', {
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
      buscarReservasDisponiveis();
    } catch (err) {
      toast.error(`Erro ao juntar-se ao grupo: ${err.response?.data?.error || err.message}`, {
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

  const formatDateForDisplay = (isoDateStr) => {
    const date = new Date(isoDateStr);

    // Ajustar a data para o fuso horário local do navegador
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
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
            <p>🕒 <span className="text-gray-300">Horário: {cafe.Horario_Abertura} - {cafe.Horario_Fecho}</span></p>
            <p>🎲 <span className="text-gray-300">Tipo: {cafe.Tipo_Cafe === 0 ? 'Café com Jogos' : 'Café sem Jogos'}</span></p>
          </div>
        </div>

        {/* Mapa do Google Maps */}
        {cafe.Coordenadas && (
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
        )}

        {/* Botões para as Reservas, Grupos e Compra de Jogos*/}
        <div className="text-center flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <button
            onClick={() => {
              setMostrarReserva((prev) => {
                const novoEstado = !prev;
                setMostrarJogos(false);
                setMostrarReservasDisponiveis(false);
                return novoEstado;
              });
            }}
            className={`px-6 py-2 rounded-lg transition text-white ${mostrarReserva ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
          >
            {mostrarReserva ? 'Cancelar Reserva' : 'Fazer Reserva'}
          </button>

          <button
            onClick={() => {
              setMostrarReservasDisponiveis((prev) => {
                const novoEstado = !prev;
                setMostrarReserva(false);
                setMostrarJogos(false);
                if (novoEstado) buscarReservasDisponiveis();
                return novoEstado;
              });
            }}
            className={`px-6 py-2 rounded-lg transition text-white ${mostrarReservasDisponiveis ? 'bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-500'
              }`}
          >
            {mostrarReservasDisponiveis ? 'Esconder Grupos' : 'Ver Grupos com Lugares'}
          </button>

          <button
            onClick={() => {
              setMostrarJogos((prev) => {
                const novoEstado = !prev;
                setMostrarReserva(false);
                setMostrarReservasDisponiveis(false);
                return novoEstado;
              });
            }}
            className={`px-6 py-2 rounded-lg transition text-white ${mostrarJogos ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-500'
              }`}
          >
            {mostrarJogos ? 'Esconder Jogos' : 'Ver Jogos Disponíveis'}
          </button>
        </div>



        {/* Formulário de Reserva */}
        <div
          className={`transition-all duration-300 overflow-hidden ${mostrarReserva ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            } mt-6`}
        >
          {mostrarReserva && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-semibold text-white text-center">Fazer Reserva</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm text-gray-300">Mesa</label>
                  <select
                    name="ID_Mesa"
                    value={formData.ID_Mesa}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <div className="space-y-1">
                    <label className="block text-sm text-gray-300">Jogo</label>
                    <select
                      name="ID_Jogo"
                      value={formData.ID_Jogo}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div className="space-y-1">
                  <label className="block text-sm text-gray-300">Nome do Grupo</label>
                  <input
                    type="text"
                    name="Nome_Grupo"
                    value={formData.Nome_Grupo}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Grupo dos Boardgamers"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm text-gray-300">
                    Número de Vagas Disponíveis <span className="text-xs text-gray-400">(excluindo o próprio)</span>
                  </label>
                  <input
                    type="number"
                    name="Lugares_Grupo"
                    value={formData.Lugares_Grupo}
                    onChange={handleChange}
                    min="0"
                    placeholder="Ex: 2"
                    className="w-full p-3 bg-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm text-gray-300">Hora de Início</label>
                  <input
                    type="datetime-local"
                    name="Hora_Inicio"
                    value={formData.Hora_Inicio}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm text-gray-300">Hora de Fim</label>
                  <input
                    type="datetime-local"
                    name="Hora_Fim"
                    value={formData.Hora_Fim}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition shadow-sm hover:shadow-md"
                >
                  Confirmar Reserva
                </button>
              </form>
            </div>
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
                    <p className="text-gray-300">Preço: {jogo.Preco}€</p>
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

        {/* Lista de Reservas com Lugares no Café */}
        {mostrarReservasDisponiveis && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-indigo-400">🎯 Grupos com Lugares Disponíveis</h2>

            {/* Verifica se reservasDisponiveis é um array e se há grupos com lugares */}
            {Array.isArray(reservasDisponiveis) && reservasDisponiveis.filter(reserva => reserva.Grupo?.Lugares_Grupo > 0).length === 0 ? (
              <p className="text-gray-400">Nenhum grupo disponível no momento.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(reservasDisponiveis) && reservasDisponiveis.map((reserva) => {
                  const jogo = jogos.find((j) => j.ID_Jogo === reserva.ID_Jogo);
                  const mesa = mesas.find((m) => m.ID_Mesa === reserva.ID_Mesa);

                  return reserva.Grupo && reserva.Grupo.Lugares_Grupo > 0 && (
                    <div
                      key={reserva.ID_Reserva}
                      className="bg-gray-800 border border-indigo-600 p-4 rounded-xl shadow-lg flex flex-col justify-between space-y-2"
                    >
                      <h3 className="text-lg font-semibold text-white">
                        Grupo: <span className="text-indigo-300">{reserva.Grupo.Nome_Grupo}</span>
                      </h3>

                      <p className="text-gray-300">
                        🪑 Mesa: <span className="text-white font-medium">{mesa?.Nome_Mesa || '—'} ({mesa?.Lugares || '?'} lugares)</span>
                      </p>

                      {jogo && (
                        <p className="text-gray-300">
                          🎲 Jogo: <span className="text-white font-medium">{jogo.Nome_Jogo}</span>
                        </p>
                      )}

                      <p className="text-gray-300">
                        🕒 Hora:{" "}
                        <span className="text-white">
                          {formatDateForDisplay(reserva.Hora_Inicio)} - {formatDateForDisplay(reserva.Hora_Fim)}
                        </span>
                      </p>

                      <p className="text-gray-300">
                        👥 Lugares Disponíveis: <span className="text-green-400 font-semibold">{reserva.Grupo.Lugares_Grupo}</span>
                      </p>

                      <button
                        onClick={() => juntarAoGrupo(reserva.Grupo.ID_Grupo)}
                        className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded transition"
                      >
                        Juntar-se ao Grupo
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}