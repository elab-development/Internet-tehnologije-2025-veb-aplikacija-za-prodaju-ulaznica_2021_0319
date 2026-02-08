'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setIsLoggedIn(true);
                const user = JSON.parse(userStr);
                setIsAdmin(user.role === 'ADMIN');
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);
            }
        };

        checkAuth();
        window.addEventListener('auth-change', checkAuth);
        return () => window.removeEventListener('auth-change', checkAuth);
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
        setIsLoggedIn(false);
        setIsAdmin(false);
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600">
                            TicketSales
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-gray-700 hover:text-blue-600">
                            Events
                        </Link>
                        {isLoggedIn ? (
                            <>
                                {isAdmin && (
                                    <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium text-purple-600">
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                                    My Tickets
                                </Link>
                                <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                                    Login
                                </Link>
                                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
