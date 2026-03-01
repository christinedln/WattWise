import React from 'react';

export default function Header() {
  return (
    <header className="flex items-center gap-3 mb-12">
      <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center">
        <span className="text-white text-xl font-bold">⚡</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">WattWise</h1>
    </header>
  );
}
