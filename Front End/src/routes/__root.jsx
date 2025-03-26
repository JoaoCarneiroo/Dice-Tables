import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Header from '../components/header';
import { ToastContainer } from 'react-toastify';


export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      {/* Navbar */}
      <Header />
      
      {/* Content */}
      <div className="flex-grow p-6 bg-gray-800">
        <Outlet />
        <ToastContainer />
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 shadow-md p-4 text-center text-gray-400">
        © 2025 Dice & Tables - Todos os direitos reservados
      </footer>
      
      <TanStackRouterDevtools />
    </div>
  ),
});
