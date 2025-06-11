import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast, Bounce } from 'react-toastify';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export const Route = createFileRoute('/cafe/sucesso')({
    component: SucessoPage,
});

function SucessoPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    const executadoRef = useRef(false);

    useEffect(() => {
        const finalizarCompra = async () => {
            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/jogos/finalizar`,
                    { sessionId },
                    { withCredentials: true }
                );

                setMensagem('Compra concluída com sucesso!');
                setSucesso(true);
                toast.success('Compra finalizada com sucesso!', {
                    position: 'bottom-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    transition: Bounce,
                });

                setTimeout(() => {
                    navigate({ to: '/perfil' });
                }, 4000);
            } catch (err) {
                setMensagem('Erro ao finalizar a compra.');
                setSucesso(false);
                toast.error(`Erro: ${err.response?.data?.error || err.message}`, {
                    position: 'bottom-center',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    transition: Bounce,
                });
            } finally {
                setLoading(false);
            }
        };

        if (sessionId && !executadoRef.current) {
            executadoRef.current = true;
            finalizarCompra();
        } else if (!sessionId) {
            setMensagem('Sessão inválida.');
            setSucesso(false);
            setLoading(false);
        }
    }, [sessionId, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden">
            <div className="bg-gray-800 text-white rounded-xl shadow-lg px-6 py-8 w-full max-w-md text-center">
                {loading ? (
                    <div className="text-lg font-medium">A processar pagamento...</div>
                ) : (
                    <>
                        <div className="flex justify-center mb-4">
                            {sucesso ? (
                                <FiCheckCircle className="text-green-400" size={64} />
                            ) : (
                                <FiXCircle className="text-red-400" size={64} />
                            )}
                        </div>
                        <h1 className="text-2xl font-semibold mb-2">
                            {sucesso ? 'Pagamento Concluído' : 'Erro no Pagamento'}
                        </h1>
                        <p className="text-base text-gray-300 mb-4">{mensagem}</p>
                        <p className="text-sm text-gray-400">
                            {sucesso
                                ? 'Serás redirecionado para o teu perfil...'
                                : 'Podes tentar novamente a compra.'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default SucessoPage;
