// components/AdminNav.js
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiHome, FiBook, FiLayers, FiFileText, FiLogOut, FiGlobe } from 'react-icons/fi';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: FiHome },
    { href: '/admin/universities', label: 'Universities', icon: FiGlobe },
    { href: '/admin/departments', label: 'Departments', icon: FiLayers },
    { href: '/admin/courses', label: 'Courses', icon: FiBook },
    { href: '/admin/questions', label: 'Questions', icon: FiFileText },
  ];

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    <Icon className="text-lg" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-indigo-100 hover:text-white transition"
            >
              Main Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-800 rounded-md hover:bg-indigo-900 transition"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}