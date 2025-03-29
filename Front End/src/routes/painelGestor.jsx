import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/painelGestor')({
    component: PainelGestor,
});

function PainelGestor() {
    const [form, setForm] = useState({
        nome_cafe: '',
        imagem_cafe: null,
        local: '',
        tipo_cafe: 0,
        horario_abertura: '',
        horario_fecho: '',
    });

    const getTokenFromCookie = () => {
        const match = document.cookie.match(/(^| )Authorization=([^;]+)/);
        return match ? match[2] : null;
    };

    const token = getTokenFromCookie();

    const { data: cafeData, isLoading, error } = useQuery({
        queryKey: ['cafeData'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:3000/cafes/gestor', {
                withCredentials: true,
            });
            return response.data;
        },
        enabled: !!token,
    });

    const mutation = useMutation({
        mutationFn: async (newCafe) => {
            const response = await axios.post('http://localhost:3000/cafes', newCafe, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            setForm({
                nome_cafe: data.Nome_Cafe,
                imagem_cafe: null,
                local: data.Local,
                tipo_cafe: data.Tipo_Cafe,
                horario_abertura: data.Horario_Abertura,
                horario_fecho: data.Horario_Fecho,
            });
        },
    });

    const handleChange = (e) => {
        if (e.target.name === "imagem_cafe") {
            setForm({ ...form, imagem_cafe: e.target.files[0] });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("nome_cafe", form.nome_cafe);
        formData.append("local", form.local);
        formData.append("tipo_cafe", form.tipo_cafe);
        formData.append("horario_abertura", form.horario_abertura);
        formData.append("horario_fecho", form.horario_fecho);
        if (form.imagem_cafe) {
            formData.append("imagem_cafe", form.imagem_cafe);
        }
    
        mutation.mutate(formData);
    };

    if (!token) return <p className="text-center text-white">Acesso negado. Faça login.</p>;
    if (isLoading) return <p className="text-center text-white">Carregando informações do café...</p>;
    if (error) return <p className="text-center text-red-500">{error.message}</p>;

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
                            />
                        ) : (
                            <div className="mt-4 w-full rounded-md bg-gray-500 text-center text-gray-200 p-2">
                                Imagem não disponível
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mt-8 p-6 bg-gray-700 rounded-lg">
                        <h2 className="text-xl font-medium text-gray-300">Criar um novo Café</h2>
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <input type="text" name="nome_cafe" placeholder="Nome do Café" onChange={handleChange} required className="w-full p-2 rounded-md bg-gray-600 text-white" />
                            <input type="file" name="imagem_cafe" onChange={handleChange} accept="image/*" className="w-full p-2 rounded-md bg-gray-600 text-white" />
                            <input type="text" name="local" placeholder="Local" onChange={handleChange} required className="w-full p-2 rounded-md bg-gray-600 text-white" />
                            <select name="tipo_cafe" onChange={handleChange} required className="w-full p-2 rounded-md bg-gray-600 text-white">
                                <option value={0}>Café com Jogos</option>
                                <option value={1}>Café sem Jogos</option>
                            </select>
                            <input type="number" name="horario_abertura" placeholder="Horário de Abertura" onChange={handleChange} required className="w-full p-2 rounded-md bg-gray-600 text-white" />
                            <input type="number" name="horario_fecho" placeholder="Horário de Fecho" onChange={handleChange} required className="w-full p-2 rounded-md bg-gray-600 text-white" />
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded-md text-white font-semibold" disabled={mutation.isLoading}>
                                {mutation.isLoading ? 'Criando...' : 'Criar Café'}
                            </button>
                        </form>
                        {mutation.error && <p className="text-center text-red-500">{mutation.error.message}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
