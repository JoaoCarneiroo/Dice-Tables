import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/perfil')({
    component: Perfil,
});

function Perfil() {
    const navigate = useNavigate();

    // Função para pegar o token do cookie
    const getTokenFromCookie = () => {
        const match = document.cookie.match(/(^| )Authorization=([^;]+)/);
        const token = match ? match[2] : null;
        return token;
    };

    // Query para buscar os dados do utilizador autenticado
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['userProfile'], // Chave da query
        queryFn: async () => {
            const token = getTokenFromCookie(); // Pegando o token do cookie
            if (!token) {
                navigate('/login'); // Redireciona para login se não houver token
                return;
            }

            try {
                // Fazendo a requisição ao backend para obter os dados do utilizador autenticado
                const response = await axios.get('http://localhost:3000/autenticar/utilizador', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Passando o token no cabeçalho
                    },
                    withCredentials: true, // Certifique-se de que os cookies são enviados com a requisição
                });
                return response.data; // Retorna os dados do utilizador
            } catch (error) {
                console.error('Erro ao obter dados do utilizador:', error);
                throw error; // Lança o erro para ser capturado pelo React Query
            }
        },
        enabled: !!getTokenFromCookie(), // Habilita a query apenas se o token estiver presente
    });

    useEffect(() => {
        if (data) {
            // O `data` é atualizado com as informações do utilizador autenticado
        }
    }, [data]);

    const handleEdit = () => {
        // Lógica para redirecionar para uma página de edição ou exibir modal de edição
        navigate('/editar-perfil');
    };

    if (isLoading) return <p className="text-center text-white">Carregando...</p>;
    if (isError) return <p className="text-center text-red-500">Erro ao carregar dados do perfil: {error.message}</p>;

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

                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleEdit}
                        className="w-full bg-indigo-600 px-4 py-2 text-white rounded-md hover:bg-indigo-500"
                    >
                        Editar Perfil
                    </button>
                </div>
            </div>
        </div>
    );
}
