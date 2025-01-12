import React from 'react';
import { BarChart, Users, ShoppingBag, TrendingUp } from 'lucide-react';

const stats = [
  { name: 'Total de Produtos', value: '148', icon: ShoppingBag, trend: '+12.5%' },
  { name: 'Descrições Geradas', value: '573', icon: BarChart, trend: '+15.2%' },
  { name: 'Usuários Ativos', value: '24', icon: Users, trend: '+7.4%' },
  { name: 'Taxa de Conversão', value: '3.2%', icon: TrendingUp, trend: '+2.1%' },
];

export function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Painel</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                {stat.trend}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Atividade Recente</h2>
        <div className="mt-4 bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Feed de atividades em breve...</p>
        </div>
      </div>
    </div>
  );
}