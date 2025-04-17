import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';
import { toast, Bounce } from 'react-toastify';

export const Route = createFileRoute('/registar')({
    component: Registar,
});

function Registar() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const mutation = useMutation({
        mutationFn: (registerData) => axios.post('http://localhost:3000/autenticar', registerData, {
            withCredentials: true,
        }),
        onSuccess: (response) => {
            toast.success('Conta criada com Sucesso, por favor realize o login', {
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
            setTimeout(() => {
                window.location.href = '/login';
            }, 2100);
        },
        onError: (err) => {
            toast.error(`Erro ao fazer login: ${err.response?.data?.error || err.message}`, {
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
            </div>
        </div>
    );
}
