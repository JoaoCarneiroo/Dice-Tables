import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dice & Tables</h1>
        <div className="flex space-x-4">
          <Link to="/" className="text-gray-300 hover:text-blue-400 font-medium">Home</Link>
          <Link to="/login" className="text-gray-300 hover:text-blue-400 font-medium">Login</Link>
          <Link to="/registar" className="text-gray-300 hover:text-blue-400 font-medium">Registar</Link>
          <Link to="/cafes" className="text-gray-300 hover:text-blue-400 font-medium">Cafés</Link>
          <Link to="/perfil" className="text-gray-300 hover:text-blue-400 font-medium">Perfil</Link>

        </div>
      </nav>
      
      {/* Content */}
      <div className="flex-grow p-6 bg-gray-800">
        <Outlet />
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 shadow-md p-4 text-center text-gray-400">
        © 2025 Dice & Tables - Todos os direitos reservados
      </footer>
      
      <TanStackRouterDevtools />
    </div>
  ),
});
