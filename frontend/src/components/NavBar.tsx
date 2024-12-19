// NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

const NavBar: React.FC = () => {
    return (
        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg opacity-80">
            <NavigationMenu.Root className="relative flex z-10">
                <NavigationMenu.List className="flex rounded-lg shadow-md list-none m-0">
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 dark:text-slate-300 rounded-md hover:bg-blue-100 dark:hover:bg-slate-400 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            {/* Use React Router Link inside NavigationMenu */}
                            <Link to="/">Home</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 dark:text-slate-300 rounded-md hover:bg-blue-100 dark:hover:bg-slate-400 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            <Link to="/createbet">Create a Bet</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 dark:text-slate-300 rounded-md hover:bg-blue-100 dark:hover:bg-slate-400 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            <Link to="/bets">My Bets</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 dark:text-slate-300 rounded-md hover:bg-blue-100 dark:hover:bg-slate-400 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            <Link to="/explorebets">Explore Bets</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 dark:text-slate-300 rounded-md hover:bg-blue-100 dark:hover:bg-slate-400 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            <Link to="/oracle">Oracle</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </div>
    );
};

export default NavBar;