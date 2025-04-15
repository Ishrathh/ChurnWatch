'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAuthStatus } from '@/lib/client-auth';

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const isHomePage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Check if user is logged in
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const { authenticated } = await getAuthStatus();
                setIsLoggedIn(authenticated);
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsLoggedIn(false);
            }
        };

        checkAuthStatus();

        // Re-check auth status when route changes
        const handleRouteChange = () => {
            checkAuthStatus();
        };

        window.addEventListener('focus', handleRouteChange);
        return () => {
            window.removeEventListener('focus', handleRouteChange);
        };
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Redirect to home page after logout
            router.push('/');
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
    ];

    const authNavItems = isLoggedIn
        ? [{ name: 'Logout', action: handleLogout }]
        : [
            { name: 'Login', path: '/login' },
            { name: 'Sign Up', path: '/signup' },
        ];

    // Filter nav items based on auth status
    const filteredNavItems = navItems.filter(
        (item) => !item.requiresAuth || (item.requiresAuth && isLoggedIn)
    );

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${isHomePage && !isScrolled
            ? 'bg-transparent'
            : 'bg-white shadow-md'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className={`text-xl font-bold ${isHomePage && !isScrolled ? 'text-white' : 'text-blue-600'
                                }`}>
                                ChurnWatch
                            </Link>
                        </div>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden sm:flex sm:items-center space-x-2">
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === item.path
                                    ? isHomePage && !isScrolled
                                        ? 'text-white bg-blue-600 bg-opacity-70'
                                        : 'text-blue-600 bg-blue-50'
                                    : isHomePage && !isScrolled
                                        ? 'text-white hover:bg-blue-600 hover:bg-opacity-70'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Auth navigation items */}
                        {authNavItems.map((item, index) => (
                            'action' in item ? (
                                <Button
                                    key={item.name}
                                    onClick={item.action}
                                    variant="ghost"
                                    className={`${isHomePage && !isScrolled
                                        ? 'text-white hover:bg-blue-600 hover:bg-opacity-70'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    {item.name}
                                </Button>
                            ) : (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === item.path
                                        ? isHomePage && !isScrolled
                                            ? 'text-white bg-blue-600 bg-opacity-70'
                                            : 'text-blue-600 bg-blue-50'
                                        : isHomePage && !isScrolled
                                            ? 'text-white hover:bg-blue-600 hover:bg-opacity-70'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }${index === authNavItems.length - 1 && !isLoggedIn
                                            ? ' bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                                            : ''
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            )
                        ))}
                    </div>

                    {/* Mobile menu button */}
                    <div className="sm:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`inline-flex items-center justify-center p-2 rounded-md ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-700'
                                } hover:text-blue-600 hover:bg-blue-50 focus:outline-none`}
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMenuOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === item.path
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Auth navigation items for mobile */}
                        {authNavItems.map((item) => (
                            'action' in item ? (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        item.action();
                                        setIsMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                                >
                                    {item.name}
                                </button>
                            ) : (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === item.path
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}