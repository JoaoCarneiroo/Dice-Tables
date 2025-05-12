import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sobre')({
    component: Sobre,
});

function Sobre() {
    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900 text-gray-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
                <h2 className="mt-10 text-center text-3xl font-bold tracking-tight text-white">
                    Sobre a Plataforma Dice & Tables
                </h2>
                <p className="mt-6 text-lg leading-7 text-gray-300">
                    A plataforma <strong>Dice & Tables</strong> foi desenvolvida com o objetivo de facilitar a vida dos entusiastas de jogos de tabuleiro.
                    Com o crescimento deste hobby, surgiu a necessidade de um sistema centralizado onde jogadores possam encontrar cafés
                    especializados, verificar a disponibilidade de mesas e organizar partidas com outros utilizadores.
                </p>
                <p className="mt-4 text-lg leading-7 text-gray-300">
                    A aplicação permite listar cafés de jogos de tabuleiro, visualizar as suas regras, horário de funcionamento,
                    número de mesas disponíveis, jogos disponíveis para uso ou compra e ainda realizar reservas.
                    Os utilizadores podem também procurar grupos para jogar e interagir com outros jogadores da comunidade.
                </p>
                <p className="mt-4 text-lg leading-7 text-gray-300">
                    Esta plataforma foi desenvolvida no âmbito de um projeto académico da Universidade da Beira Interior, com foco
                    na integração entre um frontend em <strong>React</strong> e um backend em <strong>Node.js</strong>, explorando temas como redes, programação web e design de plataformas.
                </p>
                <p className="mt-4 text-lg leading-7 text-gray-300">
                    O projeto foi orientado pelo professor <strong>Nuno Carapito</strong> e tem como principal objetivo enriquecer a experiência dos
                    jogadores e promover os cafés como espaços de convívio e entretenimento.
                </p>
            </div>
        </div>
    );
}
