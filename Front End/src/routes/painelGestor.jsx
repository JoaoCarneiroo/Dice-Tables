import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast, Bounce } from 'react-toastify';
import { IoIosArrowBack } from 'react-icons/io';

export const Route = createFileRoute('/painelGestor')({
    beforeLoad: async () => {

        try {
            const response = await axios.get("http://localhost:3000/autenticar/verificar/gestor");

            if (response.status !== 200) {
                throw redirect({ to: '/' });
            }

        } catch (err) {
            throw redirect({ to: '/' });
        }
    },
    component: PainelGestor,
});

function PainelGestor() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nome_cafe: '',
        descricao: '',
        imagem_cafe: null,
        local: '',
        coordenadas: '',
        tipo_cafe: 0,
        horario_abertura: '',
        horario_fecho: '',
    });
    const [showEditForm, setShowEditForm] = useState(false);

    const getTokenFromCookie = () => {
        const match = document.cookie.match(/(^| )Authorization=([^;]+)/);
        return match ? match[2] : null;
    };

    const token = getTokenFromCookie();

    // Visualizar o café do gestor autenticado
    const { data: cafeData, isLoading, error, refetch } = useQuery({
        queryKey: ['cafeData'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:3000/cafes/gestor', {
                withCredentials: true,
            });
            return response.data;
        },
        enabled: !!token,
    });

    // Função para Criar Café
    const createMutation = useMutation({
        mutationFn: async (newCafe) => {
            const response = await axios.post('http://localhost:3000/cafes', newCafe, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Café criado com Sucesso', {
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
            refetch();
        },
        onError: (err) => {
            toast.error(`Erro ao criar o café: ${err.response?.data?.error || err.message}`, {
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
    });

    // Função para Atualizar Café
    const updateMutation = useMutation({
        mutationFn: async (updatedCafe) => {
            const response = await axios.patch(`http://localhost:3000/cafes`, updatedCafe, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Café atualizado com Sucesso', {
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
            refetch();
        },
        onError: (err) => {
            toast.error(`Erro ao atualizar o café: ${err.response?.data?.error || err.message}`, {
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
    });

    // Função para Apagar Café
    const deleteMutation = useMutation({
        mutationFn: async () => {
            await axios.delete(`http://localhost:3000/cafes`, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            toast.success('Café apagado com Sucesso', {
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
            refetch();
        },
        onError: (err) => {
            toast.error(`Erro ao apagar o café: ${err.response?.data?.error || err.message}`, {
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
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: type === "file" ? files[0] : value
        }));
    };

    const handleEditClick = () => {
        setForm({
            nome_cafe: cafeData.Nome_Cafe,
            descricao: cafeData.Descricao || '',
            local: cafeData.Local,
            coordenadas: cafeData.Coordenadas || '',
            tipo_cafe: cafeData.Tipo_Cafe,
            horario_abertura: cafeData.Horario_Abertura,
            horario_fecho: cafeData.Horario_Fecho,
        });
        setShowEditForm(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("nome_cafe", form.nome_cafe);
        formData.append("descricao", form.descricao);
        formData.append("local", form.local);
        formData.append("coordenadas", form.coordenadas);
        formData.append("tipo_cafe", form.tipo_cafe);
        formData.append("horario_abertura", form.horario_abertura);
        formData.append("horario_fecho", form.horario_fecho);
        if (form.imagem_cafe) {
            formData.append("imagem_cafe", form.imagem_cafe);
        }

        updateMutation.mutate(formData);
        setShowEditForm(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("nome_cafe", form.nome_cafe);
        formData.append("descricao", form.descricao);
        formData.append("local", form.local);
        formData.append("coordenadas", form.coordenadas);
        formData.append("tipo_cafe", form.tipo_cafe);
        formData.append("horario_abertura", form.horario_abertura);
        formData.append("horario_fecho", form.horario_fecho);
        if (form.imagem_cafe) {
            formData.append("imagem_cafe", form.imagem_cafe);
        }

        createMutation.mutate(formData);
    };

    if (!token) return <p className="text-center text-white">Acesso negado. Faça login.</p>;
    if (isLoading) return <p className="text-center text-white">Carregando informações do café...</p>;
    if (error) return <p className="text-center text-red-500">{error.message}</p>;


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 py-12 px-6 lg:px-8">

            <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg relative">

                {/* Botão de Voltar no Canto Inferior */}
                <button
                    onClick={() => navigate({ to: '/perfil' })}
                    className="absolute top-4 left-4 text-indigo-500 hover:text-indigo-400"
                >
                    <IoIosArrowBack className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Painel do Gestor</h1>
                {cafeData ? (
                    <div className="mt-8 p-6 bg-gray-700 rounded-lg">
                        <h2 className="text-xl font-medium text-gray-300">Meu Café</h2>
                        <p className="text-gray-200 mt-2">Nome: {cafeData.Nome_Cafe}</p>
                        <p className="text-gray-200">🎲 {cafeData.Tipo_Cafe === 0 ? 'Café com Jogos' : 'Café sem Jogos'}</p>
                        <p className="text-gray-200">📍 {cafeData.Local}</p>
                        <p className="text-gray-200">🕒 {cafeData.Horario_Abertura}:00 - {cafeData.Horario_Fecho}:00</p>
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
                        {/* Botões de Atualizar e Apagar */}
                        <div className="mt-6 flex gap-4">
                            <div className="flex justify-center w-full">
                                <button
                                    onClick={() => setShowEditForm(!showEditForm)}
                                    className="w-full bg-indigo-600 px-4 py-2 text-white rounded-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                                >
                                    {showEditForm ? 'Cancelar' : 'Atualizar'}
                                </button>
                            </div>
                            <button
                                className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg text-white font-semibold transition duration-300 transform hover:scale-105"
                                onClick={() => deleteMutation.mutate()}
                            >
                                Apagar
                            </button>
                            <button
                                onClick={() => navigate({ to: '/painelGestorMesas' })}
                                className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg text-white font-semibold transition duration-300 transform hover:scale-105"
                            >
                                Gerir Mesas
                            </button>
                            {cafeData?.Tipo_Cafe === 0 && (
                                <button
                                    onClick={() => navigate({ to: '/painelGestorJogos' })}
                                    className="w-full bg-yellow-600 hover:bg-yellow-700 p-3 rounded-lg text-white font-semibold transition duration-300 transform hover:scale-105"
                                >
                                    Gerir Jogos
                                </button>
                            )}
                        </div>

                        {/* Formulário para Atualizar Café */}
                        {showEditForm && cafeData && (
                            <form onSubmit={handleUpdate} className="mt-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            name="nome_cafe"
                                            placeholder="Nome do Café"
                                            value={form.nome_cafe}
                                            onChange={handleChange}
                                            className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <textarea
                                            name="descricao"
                                            placeholder="Descrição do Café"
                                            value={form.descricao}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="imagem_cafe"
                                            className="w-full p-1.5 rounded-lg cursor-pointer bg-gray-600 text-white text-center border-2 border-dashed border-gray-500 hover:bg-gray-700"
                                        >
                                            {form.imagem_cafe ? 'Imagem escolhida' : 'Escolher imagem'}
                                        </label>
                                        <input
                                            type="file"
                                            name="imagem_cafe"
                                            onChange={handleChange}
                                            accept="image/*"
                                            id="imagem_cafe"
                                            className="hidden"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            name="local"
                                            placeholder="Local"
                                            value={form.local}
                                            onChange={handleChange}
                                            className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            name="coordenadas"
                                            placeholder="Coordenadas (ex: 38.7169,-9.1399)"
                                            value={form.coordenadas}
                                            onChange={handleChange}
                                            className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <select
                                            name="tipo_cafe"
                                            onChange={handleChange}
                                            className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value="">Selecione o Tipo de Café</option>
                                            <option value={0}>Café com Jogos</option>
                                            <option value={1}>Café sem Jogos</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="number"
                                                name="horario_abertura"
                                                placeholder="Horário de Abertura"
                                                value={form.horario_abertura}
                                                onChange={handleChange}
                                                className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <input
                                                type="number"
                                                name="horario_fecho"
                                                placeholder="Horário de Fecho"
                                                value={form.horario_fecho}
                                                onChange={handleChange}
                                                className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-lg text-white font-semibold mt-4 focus:outline-none transition duration-300 transform hover:scale-105"
                                    >
                                        Atualizar Café
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="mt-8 p-6 bg-gray-700 rounded-lg">
                        <h2 className="text-xl font-medium text-gray-300">Criar um novo Café</h2>

                        {/* Formulário para Criar Café */}
                        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        name="nome_cafe"
                                        placeholder="Nome do Café"
                                        onChange={handleChange}
                                        required
                                        className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <textarea
                                        name="descricao"
                                        placeholder="Descrição do Café"
                                        value={form.descricao}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="imagem_cafe"
                                        className="w-full p-1.5 rounded-lg cursor-pointer bg-gray-600 text-white text-center border-2 border-dashed border-gray-500 hover:bg-gray-700"
                                    >
                                        {form.imagem_cafe ? 'Imagem escolhida' : 'Escolher imagem'}
                                    </label>
                                    <input
                                        type="file"
                                        name="imagem_cafe"
                                        onChange={handleChange}
                                        accept="image/*"
                                        id="imagem_cafe"
                                        className="hidden"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        name="local"
                                        placeholder="Local"
                                        onChange={handleChange}
                                        required
                                        className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="coordenadas"
                                        placeholder="Coordenadas (ex: 38.7169,-9.1399)"
                                        value={form.coordenadas}
                                        onChange={handleChange}
                                        className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <select
                                        name="tipo_cafe"
                                        onChange={handleChange}
                                        required
                                        className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="">Selecione o Tipo de Café</option>
                                        <option value={0}>Café com Jogos</option>
                                        <option value={1}>Café sem Jogos</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="number"
                                            name="horario_abertura"
                                            placeholder="Horário de Abertura"
                                            onChange={handleChange}
                                            required
                                            className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            type="number"
                                            name="horario_fecho"
                                            placeholder="Horário de Fecho"
                                            onChange={handleChange}
                                            required
                                            className="w-full p-4 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 p-4 rounded-lg text-white font-semibold mt-4 focus:outline-none transition duration-300 transform hover:scale-105"
                                    disabled={createMutation.isLoading}
                                >
                                    {createMutation.isLoading ? 'Criando...' : 'Criar Café'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
