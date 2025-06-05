import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { useUser } from '../context/UserContext'
import { toast, Bounce } from 'react-toastify';

export const Route = createFileRoute('/login')({
    component: Login,
});

function Login() {
    const navigate = useNavigate();
    const { login } = useUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [mostrar2FA, setMostrar2FA] = useState(false);
    const [codigo2FA, setCodigo2FA] = useState('');

    const [emailPara2FA, setEmailPara2FA] = useState('');

    // Mutation para login inicial (email + senha)
    const loginMutation = useMutation({
        mutationFn: (loginData) => axios.post('http://localhost:3000/api/autenticar/login', loginData, { withCredentials: true }),
        onSuccess: (response) => {
            toast.info('Código 2FA enviado para o seu email. Por favor, insira-o para continuar.', {
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
            setMostrar2FA(true);
            setEmailPara2FA(email);
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

    // Mutation para verificar o código 2FA
    const verificar2FAMutation = useMutation({
        mutationFn: (data) => axios.post('http://localhost:3000/api/autenticar/login/2fa', data, { withCredentials: true }),
        onSuccess: (response) => {
            const nome = response.data.nome;
            const cargos = { isAdmin: response.data.isAdmin, isGestor: response.data.isGestor };
            login(nome, cargos);
            navigate({ to: '/perfil' });
            toast.success('Login Realizado com Sucesso!', {
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
        },
        onError: (err) => {
            toast.error(`${err.response?.data?.error || err.message}`, {
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

    // Submit do Login Inicial
    const handleSubmitLogin = (e) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    // Submit da Validação do Código 2FA
    const handleSubmit2FA = (e) => {
        e.preventDefault();
        verificar2FAMutation.mutate({ email: emailPara2FA, codigo: codigo2FA });
    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900 text-gray-200 rounded-lg">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">

                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white">
                    Entra na tua Conta
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

                {!mostrar2FA && (
                    <form className="space-y-6" onSubmit={handleSubmitLogin}>
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
                                    disabled={loginMutation.isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
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
                                    disabled={loginMutation.isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                disabled={loginMutation.isLoading}
                            >
                                {loginMutation.isLoading ? 'Acedendo...' : 'Login'}
                            </button>
                        </div>
                    </form>
                )}

                {mostrar2FA && (
                    <form className="space-y-6" onSubmit={handleSubmit2FA}>
                        <div>
                            <label htmlFor="codigo2FA" className="block text-sm font-medium text-gray-300">
                                Código de Autenticação (2FA)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="codigo2FA"
                                    id="codigo2FA"
                                    required
                                    maxLength={6}
                                    className="block w-full rounded-md bg-gray-800 text-gray-200 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                    value={codigo2FA}
                                    onChange={(e) => setCodigo2FA(e.target.value)}
                                    disabled={verificar2FAMutation.isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                disabled={verificar2FAMutation.isLoading}
                            >
                                {verificar2FAMutation.isLoading ? 'A verificar...' : 'Validar Código'}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}
