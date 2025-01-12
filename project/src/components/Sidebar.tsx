import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Settings } from 'lucide-react';

const navigation = [
  { name: 'Painel', href: '/', icon: LayoutDashboard },
  { name: 'Produtos', href: '/products', icon: Package },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="h-full px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-6 w-6" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}