import React from 'react'
import { Link } from '@tanstack/react-router';
import { useUser } from '../context/UserContext';

export default function Header() {
    const { user, logout } = useUser();

    return (
        <nav className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-white hover:text-blue-400">
                Dice & Tables
            </Link>
            <div className="flex space-x-4">
                <Link to="/sobre" className="text-gray-300 hover:text-blue-400 font-medium">Sobre Nós</Link>

                <Link to="/cafes" className="text-gray-300 hover:text-blue-400 font-medium">Cafés</Link>
                {user.isLoggedIn && (
                    <Link to="/perfil" className="text-gray-300 hover:text-blue-400 font-medium">Perfil</Link>
                )}
                {!user.isLoggedIn && (
                    <Link to="/registar" className="text-gray-300 hover:text-blue-400 font-medium">Registar</Link>
                )}
                {!user.isLoggedIn ? (
                    <Link to="/login" className="text-gray-300 hover:text-blue-400 font-medium">Login</Link>
                ) : (
                    <Link
                        to="/"
                        onClick={() => logout()}
                        className="text-gray-300 hover:text-blue-400 font-medium"
                    >
                        Logout
                    </Link>
                )}
            </div>
        </nav>
    );
}
