import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (

    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-white mb-4">Bem-vindo ao Dice & Tables</h1>
      <p className="text-lg text-gray-400 mb-6 text-center max-w-xl">
        Explore jogos incríveis e divirta-se com nossa plataforma de entretenimento interativo.
      </p>
      <div className="flex space-x-4">
        <Link to="/sobre" className="bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg shadow-md">
          Informação sobre a Plataforma
        </Link>
        <Link to="/cafes" className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-md">
          Explorar Cafés
        </Link>
        <Link to="/login" className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow-md">
          Login
        </Link>
      </div>
    </div>
  );
}
