import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';
import { useUser } from '../context/UserContext'

export const Route = createFileRoute('/login')({
    component: Login,
});

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useUser();
    
    const mutation = useMutation({
        mutationFn: (loginData) => axios.post('http://localhost:3000/autenticar/login', loginData, {
            withCredentials: true,
        }),
        onSuccess: (response) => {
            const nome = response.data.nome;
            const cargos = { isAdmin: response.data.isAdmin, isGestor: response.data.isGestor};
            login(nome,cargos)
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({ email, password });
    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900 text-gray-200 rounded-lg">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    className="mx-auto h-10 w-auto"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    alt="Your Company"
                />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white">
                    Entra na tua Conta
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-md bg-gray-800 text-gray-200 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="text-sm">
                                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input
                                type="password"
                                name="password"
                                id="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-md bg-gray-800 text-gray-200 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {mutation.isLoading ? 'Acedendo...' : 'Login'}
                        </button>
                    </div>
                </form>

                {mutation.isError && (
                    <p className="mt-2 text-center text-sm text-red-500">Error: {mutation.error.message}</p>
                )}

                {mutation.isSuccess && (
                    <p className="mt-2 text-center text-sm text-green-500">Login realizado com sucesso!</p>
                )}
            </div>
        </div>
    );
}
