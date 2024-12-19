// NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

const NavBar: React.FC = () => {
    return (
        <div className="bg-gray-50">
            <NavigationMenu.Root className="relative flex z-10">
                <NavigationMenu.List className="flex bg-white rounded-md shadow-md list-none m-0">
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            {/* Use React Router Link inside NavigationMenu */}
                            <Link to="/">Home</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            <Link to="/createbet">Create a Bet</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            <Link to="/bets">My Bets</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            <Link to="/explorebets">Explore Bets</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link className="block px-3 py-2 font-medium text-sm text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring focus:ring-blue-300" asChild>
                            <Link to="/oracle">Oracle</Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </div>
    );
};

export default NavBar;