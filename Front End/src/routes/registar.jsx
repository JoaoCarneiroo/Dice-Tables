import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/registar')({
    component: Registar,
});

function Registar() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const mutation = useMutation({
        mutationFn: (registerData) => axios.post('http://localhost:3000/autenticar', registerData, {
            withCredentials: true,  // Enviar o cookie em cada requisição
        }),
        onSuccess: (response) => {
            // Redirecionar para a página de login após o registro ser bem-sucedido
            console.log('Usuário registrado com sucesso!');
            window.location.href = '/login';  // Redirecionamento para o login
        },
        onError: (error) => {
            console.error('Erro ao registrar usuário:', error.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({ nome, email, password });
    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900 text-gray-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white">
                    Criar uma Conta
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-300">
                            Nome
                        </label>
                        <input
                            type="text"
                            id="nome"
                            required
                            className="block w-full rounded-md bg-gray-800 text-gray-200 px-3 py-1.5"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            className="block w-full rounded-md bg-gray-800 text-gray-200 px-3 py-1.5"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            required
                            className="block w-full rounded-md bg-gray-800 text-gray-200 px-3 py-1.5"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 px-3 py-1.5 text-white rounded-md hover:bg-indigo-500"
                        >
                            {mutation.isLoading ? 'Registando...' : 'Registar'}
                        </button>
                    </div>
                </form>

                {mutation.isError && (
                    <p className="mt-2 text-center text-sm text-red-500">Error: {mutation.error.message}</p>
                )}
            </div>
        </div>
    );
}
