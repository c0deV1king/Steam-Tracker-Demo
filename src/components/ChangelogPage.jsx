import React from 'react';

const ChangelogPage = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Changelog</h1>
        
        <div className="space-y-8">
          {/* Version entries */}
          <div className="border-l-4 border-primary pl-4">
            <h2 className="text-xl font-semibold">v1.0.0 - Project Changelog</h2>
            <p className="text-sm text-gray-500 mb-2">2024-11-20</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Added changelog modal</li>
              <li>Future updates will be added here</li>
            </ul>
          </div>
          
          {/* Add more version blocks as needed */}
        </div>
      </div>
    </div>
  );
};

export { ChangelogPage };