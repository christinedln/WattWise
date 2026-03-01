// src/components/Layout.jsx
import React from 'react';
import '../styles/global.css';

// Optional: you can define app metadata here as a plain object
export const appMetadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};

// React-compatible Layout component
export default function Layout({ children }) {
  return (
    <div className="font-sans antialiased min-h-screen bg-gray-50">
      {children}
      {/* Optional: Add analytics scripts here */}
    </div>
  );
}