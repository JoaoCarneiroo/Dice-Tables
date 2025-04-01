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
                headers: { Authorization: `Bearer ${token}` },
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
            });         },
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUserMutation.mutate(formData);
    };

    if (!token) return null;
    if (isLoading) return <p className="text-center text-white">Carregando...</p>;
    if (isError) return <p className="text-center text-red-500">Erro ao carregar perfil: {error.message}</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 py-12 px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Meu Perfil</h1>

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
            </div>
        </div>
    );
}
