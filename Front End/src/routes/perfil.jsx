import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { useUser } from '../context/UserContext'
import { toast, Bounce } from 'react-toastify';

export const Route = createFileRoute('/perfil')({
    component: Perfil,
});

function Perfil() {
    const navigate = useNavigate();
    const { logout } = useUser();

    const getTokenFromCookie = () => {
        const match = document.cookie.match(/(^| )Authorization=([^;]+)/);
        return match ? match[2] : null;
    };

    const token = getTokenFromCookie();

    useEffect(() => {
        if (!token) {
            setTimeout(() => {
                navigate({ to: '/login' });
            }, 100);
        }
    }, [token, navigate]);

    const [formData, setFormData] = useState({ nome: '', email: '', password: '' });
    const [showForm, setShowForm] = useState(false);

    // Obter Informações do Utilizador Autenticado
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            if (!token) return;
            const response = await axios.get('http://localhost:3000/autenticar/utilizador', {
                withCredentials: true,
            });
            return response.data;
        },
        enabled: !!token,
        onSuccess: (data) => {
            setFormData({
                nome: data?.Nome || '',
                email: data?.Email || '',
                password: '',
            });
        },
    });

    // Obter Reservas do Utilizador
    const { data: reservas, isLoading: isLoadingReservas, isError: isErrorReservas, refetch: refetchReservas } = useQuery({
        queryKey: ['userReservas'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:3000/reservas/utilizador', {
                withCredentials: true,
            });

            const reservas = await Promise.all(
                response.data.map(async (reserva) => {
                    const responseCafe = await axios.get(`http://localhost:3000/cafes/porID/${reserva.ID_Cafe}`, {
                        withCredentials: true,
                    });

                    const responseMesa = await axios.get(`http://localhost:3000/mesas/porID/${reserva.ID_Mesa}`, {
                        withCredentials: true,
                    });


                    if (reserva.ID_Jogo) {
                        const responseJogo = await axios.get(`http://localhost:3000/jogos/porID/${reserva.ID_Jogo}`, {
                            withCredentials: true,
                        });

                        return {
                            ...reserva,
                            Jogo: responseJogo.data,
                            Cafe: responseCafe.data,
                            Mesa: responseMesa.data,
                        };
                    }

                    return {
                        ...reserva,
                        Cafe: responseCafe.data,
                        Mesa: responseMesa.data,

                    };
                })
            );

            return reservas;
        },
        enabled: !!token,
    });

    // Obter as Reservas do Utilizador onde ele se juntou a um grupo
    const { data: reservasGrupo, isLoading: isLoadingReservasGrupo, isError: isErrorReservasGrupo } = useQuery({
        queryKey: ['userReservasGrupo'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:3000/reservas/grupo', {
                withCredentials: true,
            });

            const reservas = await Promise.all(
                response.data.map(async (reservaGrupo) => {
                    const reserva = reservaGrupo.Grupo?.Reserva;

                    if (!reserva) return null; // ignora casos inválidos

                    return {
                        ID_Reserva: reserva.ID_Reserva,
                        ID_Cafe: reserva.ID_Cafe,
                        ID_Mesa: reserva.ID_Mesa,
                        ID_Utilizador: reserva.ID_Utilizador,
                        ID_Jogo: reserva.ID_Jogo,
                        Hora_Inicio: reserva.Hora_Inicio,
                        Hora_Fim: reserva.Hora_Fim,
                        Cafe: reserva.Cafe, // já vem com Nome_Cafe
                        Mesa: reserva.Mesa, // já vem com Lugares
                        Jogo: reserva.Jogo || null, // pode não existir
                        Grupo: reservaGrupo.Grupo // inclui info do grupo se quiseres mostrar nome, lugares, etc
                    };
                })
            );

            // filtra valores nulos (quando reservaGrupo.Grupo?.Reserva é null)
            return reservas.filter(Boolean);
        },
        enabled: !!token,
    });

    const [secaoAtiva, setSecaoAtiva] = useState(null);


    // Atualizar Utilizador
    const updateUserMutation = useMutation({
        mutationFn: async (updatedData) => {
            await axios.patch('http://localhost:3000/autenticar', updatedData, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            refetch();
            toast.success('Conta Atualizada com Sucesso', {
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
            setShowForm(false);
        },
        onError: (err) => {
            toast.error(`Erro ao atualizar perfil: ${err.response?.data?.error || err.message}`, {
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
    });

    // Apagar Utilizador
    const deleteUserMutation = useMutation({
        mutationFn: async () => {
            await axios.delete('http://localhost:3000/autenticar', {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            logout();
            toast.success('Conta Apagada com Sucesso', {
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
            navigate({ to: '/login' });
        },
        onError: (err) => {
            toast.error(`Erro ao apagar perfil: ${err.response?.data?.error || err.message}`, {
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
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUserMutation.mutate(formData);
    };


    // Estados para edição de reserva
    const [editingReservaId, setEditingReservaId] = useState(null);
    const [editingData, setEditingData] = useState({
        ID_Mesa: '',
        ID_Jogo: '',
        Hora_Inicio: '',
        Hora_Fim: ''
    });

    // Atualizar Reserva
    const updateReservaMutation = useMutation({
        mutationFn: async ({ id, updatedData }) => {
            console.log(updatedData)
            await axios.patch(`http://localhost:3000/reservas/${id}`, updatedData, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            toast.success('Reserva atualizada com sucesso!', {
                position: 'bottom-center',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
                transition: Bounce,
            });
            setEditingReservaId(null);
            refetchReservas();
        },
        onError: (err) => {
            toast.error(`Erro ao atualizar reserva: ${err.response?.data?.error || err.message}`, {
                position: 'bottom-center',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
                transition: Bounce,
            });
        },
    });

    // Apagar Reserva
    const deleteReservaMutation = useMutation({
        mutationFn: async (id) => {
            await axios.delete(`http://localhost:3000/reservas/${id}`, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            toast.success('Reserva apagada com sucesso!', {
                position: 'bottom-center',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
                transition: Bounce,
            });
            refetchReservas();
        },
        onError: (err) => {
            toast.error(`Erro ao apagar reserva: ${err.response?.data?.error || err.message}`, {
                position: 'bottom-center',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'dark',
                transition: Bounce,
            });
        },
    });

    // Converte a data para o formato necessário para o datetime-local
    const formatDateTimeForInput = (isoDateStr) => {
        const date = new Date(isoDateStr);

        // Ajustar a data para o formato que o datetime-local precisa
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Converte a data no formato datetime-local de volta para UTC
    const convertToUTC = (localDateStr) => {
        const localDate = new Date(localDateStr);

        // Ajustar a data para UTC com a diferença de fuso horário
        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

        return utcDate.toISOString(); // Retorna em formato UTC completo
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

    // Função para editar a reserva
    const handleEditReserva = (reserva) => {
        setEditingReservaId(reserva.ID_Reserva);
        setEditingData({
            ID_Mesa: reserva.ID_Mesa,
            ID_Jogo: reserva.ID_Jogo,
            Hora_Inicio: formatDateTimeForInput(reserva.Hora_Inicio),
            Hora_Fim: formatDateTimeForInput(reserva.Hora_Fim),
        });
    };

    // Função para submeter a edição da reserva
    const handleEditSubmit = async (e, reservaId) => {
        e.preventDefault();

        const updatedData = {
            Hora_Inicio: convertToUTC(editingData.Hora_Inicio),
            Hora_Fim: convertToUTC(editingData.Hora_Fim),
            ID_Mesa: editingData.ID_Mesa,
            ID_Jogo: editingData.ID_Jogo,
        };

        updateReservaMutation.mutate({ id: reservaId, updatedData });
    };

    // Função para cancelar a edição
    const handleCancelEdit = () => {
        setEditingReservaId(null);
        setEditingData({
            ID_Mesa: '',
            ID_Jogo: '',
            Hora_Inicio: '',
            Hora_Fim: ''
        });
    };

    // Função para editar o valor dos campos
    const handleEditChange = (e) => {
        setEditingData({
            ...editingData,
            [e.target.name]: e.target.value
        });
    };

    // Função para apagar a reserva
    const handleDeleteReserva = (reservaId) => {
        deleteReservaMutation.mutate(reservaId);
    };

    if (!token) return null;
    if (isLoading) return <p className="text-center text-white">Carregando...</p>;
    if (isError) return <p className="text-center text-red-500">Erro ao carregar perfil: {error.message}</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 py-12 px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Meu Perfil</h1>

                {/* Informações do Perfil */}
                <div className="mb-6">
                    <h2 className="text-xl font-medium text-gray-300">Informações Pessoais</h2>
                    <div className="mt-4">
                        <div className="flex justify-between">
                            <p className="font-semibold text-gray-400">Nome:</p>
                            <p className="text-gray-200">{data?.Nome || 'Sem nome'}</p>
                        </div>
                        <div className="flex justify-between mt-2">
                            <p className="font-semibold text-gray-400">Email:</p>
                            <p className="text-gray-200">{data?.Email || 'Sem email'}</p>
                        </div>
                        <div className="flex justify-between mt-2">
                            <p className="font-semibold text-gray-400">Cargo:</p>
                            <p className="text-gray-200">{data?.Cargo || 'Sem cargo'}</p>
                        </div>
                    </div>
                </div>

                {/* Botões do Perfil */}
                {data?.Cargo === 'Gestor' && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => navigate({ to: '/painelGestor' })}
                            className="w-full bg-green-600 px-4 py-2 text-white rounded-md hover:bg-green-500"
                        >
                            Painel de Gestão
                        </button>
                    </div>
                )}
                {data?.Cargo === 'Administrador' && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => navigate({ to: '/painelAdmin' })}
                            className="w-full bg-green-600 px-4 py-2 text-white rounded-md hover:bg-green-500"
                        >
                            Painel de Admin
                        </button>
                    </div>
                )}

                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="w-full bg-indigo-600 px-4 py-2 text-white rounded-md hover:bg-indigo-500"
                    >
                        {showForm ? 'Cancelar' : 'Editar Perfil'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                        <div>
                            <label className="block text-gray-400">Nome</label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400">Nova Senha</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 px-4 py-2 text-white rounded-md hover:bg-indigo-500">
                            {updateUserMutation.isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>
                )}

                <div className="flex justify-center mt-6">
                    <button onClick={() => deleteUserMutation.mutate()} className="w-full bg-red-600 px-4 py-2 text-white rounded-md hover:bg-red-500">
                        Apagar Conta
                    </button>
                </div>

                {/* Botões para alternar entre reservas pessoais e de grupo */}
                <div className="text-center flex flex-col sm:flex-row justify-center gap-4 mt-6">
                    <button
                        onClick={() => setSecaoAtiva(secaoAtiva === 'minhas' ? null : 'minhas')}
                        className={`px-6 py-2 rounded-lg transition text-white ${secaoAtiva === 'minhas' ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {secaoAtiva === 'minhas' ? 'Esconder Reservas' : 'Minhas Reservas'}
                    </button>

                    <button
                        onClick={() => setSecaoAtiva(secaoAtiva === 'grupo' ? null : 'grupo')}
                        className={`px-6 py-2 rounded-lg transition text-white ${secaoAtiva === 'grupo' ? 'bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-500'}`}
                    >
                        {secaoAtiva === 'grupo' ? 'Esconder Grupos' : 'Reservas em Grupos'}
                    </button>
                </div>


                {/* Minhas Reservas */}
                {secaoAtiva === 'minhas' && (
                    <div className="mt-10">
                        <h2 className="text-2xl font-semibold text-indigo-500 mb-6 text-center">Minhas Reservas</h2>

                        {isLoadingReservas && <p className="text-gray-400 text-center">Carregando reservas...</p>}
                        {isErrorReservas && <p className="text-red-500 text-center">Erro ao carregar reservas.</p>}

                        {reservas && reservas.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reservas.map((reserva) => (
                                    <div
                                        key={reserva.ID_Reserva}
                                        className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700 hover:shadow-xl transition duration-300 space-y-4"
                                    >
                                        <h3 className="text-xl font-bold text-gray-300 border-b border-gray-600 pb-2">
                                            {reserva.Cafe?.Nome_Cafe || 'Café Desconhecido'}
                                        </h3>

                                        <p className="text-gray-300">
                                            <span className="font-semibold">Local:</span> {reserva.Cafe?.Local || 'N/A'}
                                        </p>

                                        {reserva.Jogo && (
                                            <div className="mt-4 pt-2 border-t border-gray-700">
                                                <p className="text-gray-300">
                                                    <span className="font-semibold">Jogo:</span> {reserva.Jogo?.Nome_Jogo || 'N/A'}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-4 pt-2 border-t border-gray-700">
                                            <p className="text-gray-300">
                                                <span className="font-semibold">Nome da Mesa:</span> {reserva.Mesa?.Nome_Mesa || 'N/A'}
                                            </p>
                                            <p className="text-gray-300">
                                                <span className="font-semibold">Lugares:</span> {reserva.Mesa?.Lugares || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-2 border-t border-gray-700">
                                            <p className="text-gray-300">
                                                <span className="font-semibold">Início:</span> {formatDateForDisplay(reserva.Hora_Inicio)}
                                            </p>
                                            <p className="text-gray-300">
                                                <span className="font-semibold">Fim:</span> {formatDateForDisplay(reserva.Hora_Fim)}
                                            </p>
                                        </div>

                                        {/* Ações */}
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleEditReserva(reserva)}
                                                className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-500"
                                            >
                                                Atualizar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReserva(reserva.ID_Reserva)}
                                                className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-500"
                                            >
                                                Apagar
                                            </button>
                                        </div>

                                        {/* Formulário de edição */}
                                        {editingReservaId === reserva.ID_Reserva && (
                                            <form onSubmit={(e) => handleEditSubmit(e, reserva.ID_Reserva)} className="mt-4 space-y-4 border-t border-gray-600 pt-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-400">Hora de Início</label>
                                                    <input
                                                        type="datetime-local"
                                                        name="Hora_Inicio"
                                                        value={editingData.Hora_Inicio}
                                                        onChange={handleEditChange}
                                                        className="mt-1 w-full p-2 rounded-lg border-gray-600 bg-gray-700 text-white"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-400">Hora de Fim</label>
                                                    <input
                                                        type="datetime-local"
                                                        name="Hora_Fim"
                                                        value={editingData.Hora_Fim}
                                                        onChange={handleEditChange}
                                                        className="mt-1 w-full p-2 rounded-lg border-gray-600 bg-gray-700 text-white"
                                                        required
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-500"
                                                    >
                                                        Salvar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                        className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-500"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Você não tem reservas.</p>
                        )}
                    </div>
                )}

                {/* Reservas em Grupos */}
                {secaoAtiva === 'grupo' && (
                    <div className="mt-10">
                        <h2 className="text-2xl font-semibold text-indigo-500 mb-6 text-center">Reservas em Grupos</h2>

                        {isLoadingReservasGrupo && <p className="text-gray-400 text-center">Carregando reservas de grupo...</p>}
                        {isErrorReservasGrupo && <p className="text-red-500 text-center">Erro ao carregar reservas de grupo.</p>}

                        {reservasGrupo && reservasGrupo.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reservasGrupo.map((reserva) => (
                                    <div
                                        key={reserva.ID_Reserva}
                                        className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700 hover:shadow-xl transition duration-300 space-y-4"
                                    >
                                        <h3 className="text-xl font-bold text-gray-300 border-b border-gray-600 pb-2">
                                            {reserva.Cafe?.Nome_Cafe || 'Café Desconhecido'}
                                        </h3>

                                        <p className="text-gray-300">
                                            <span className="font-semibold">Grupo:</span> {reserva.Grupo?.Nome_Grupo || 'Grupo sem nome'}
                                        </p>

                                        {reserva.Jogo && (
                                            <div className="mt-2">
                                                <p className="text-gray-300">
                                                    <span className="font-semibold">Jogo:</span> {reserva.Jogo?.Nome_Jogo || 'N/A'}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-2">
                                            <p className="text-gray-300">
                                                <span className="font-semibold">Mesa:</span> {reserva.Mesa?.Nome_Mesa || 'N/A'}
                                            </p>
                                            <p className="text-gray-300">
                                                <span className="font-semibold">Lugares:</span> {reserva.Mesa?.Lugares || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="mt-2">
                                            <p className="text-gray-300">
                                                <span className="font-semibold">Início:</span> {formatDateForDisplay(reserva.Hora_Inicio)}
                                            </p>
                                            <p className="text-gray-300">
                                                <span className="font-semibold">Fim:</span> {formatDateForDisplay(reserva.Hora_Fim)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Você não se juntou a nenhuma reserva de grupo.</p>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}