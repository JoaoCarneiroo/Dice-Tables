import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/painelGestor')({
    component: PainelGestor,
});

function PainelGestor() {
    const [cafeData, setCafeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getTokenFromCookie = () => {
        const match = document.cookie.match(/(^| )Authorization=([^;]+)/);
        return match ? match[2] : null;
    };

    const token = getTokenFromCookie();

    useEffect(() => {
        const fetchCafe = async () => {
            try {
                const response = await axios.get('http://localhost:3000/cafes/gestor', {
                    withCredentials: true,
                });
                setCafeData(response.data);
            } catch (err) {
                setError(err.response.data.error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchCafe();
        }
    }, [token]);

    

    if (!token) return <p className="text-center text-white">Acesso negado. Faça login.</p>;
    if (loading) return <p className="text-center text-white">Carregando informações do café...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 py-12 px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Painel do Gestor</h1>
                {cafeData ? (
                    <div className="mt-8 p-6 bg-gray-700 rounded-lg">
                        <h2 className="text-xl font-medium text-gray-300">Meu Café</h2>
                        <p className="text-gray-200 mt-2">Nome: {cafeData.Nome_Cafe}</p>
                        <p className="text-gray-200">Local: {cafeData.Local}</p>
                        <p className="text-gray-200">Tipo: {cafeData.Tipo_Cafe === 0 ? 'Café com Jogos' : 'Café sem Jogos'}</p>
                        <p className="text-gray-200">Horário: {cafeData.Horario_Abertura}:00 - {cafeData.Horario_Fecho}:00</p>
                        {cafeData.Imagem_Cafe ? (
                            <img
                                src={`http://localhost:3000/uploads/cafes/${cafeData.Imagem_Cafe}`}
                                alt={cafeData.Nome_Cafe}
                                className="mt-4 w-full h-48 object-contain rounded-md"
                                style={{ maxHeight: '200px', objectFit: 'contain' }}
                            />
                        ) : (
                            <div className="mt-4 w-full rounded-md bg-gray-500 text-center text-gray-200 p-2">
                                Imagem não disponível
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-gray-400">Nenhum café encontrado para este gestor.</p>
                )}
            </div>
        </div>
    );
}
