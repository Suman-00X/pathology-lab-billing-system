import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  TestTube2, 
  Users, 
  FileText, 
  Plus,
  List,
  Building2,
  Info
} from 'lucide-react';
import { cn } from '../utils/cn';
import Footer from './Footer';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  {
    name: 'Admin',
    icon: Settings,
    children: [
      { name: 'Lab Settings', href: '/admin/lab-settings', icon: Building2 },
      { name: 'Test Groups', href: '/admin/test-groups', icon: TestTube2 },
      { name: 'Doctors', href: '/admin/doctors', icon: Users },
    ],
  },
  {
    name: 'Billing',
    icon: FileText,
    children: [
      { name: 'Create Bill', href: '/billing/create', icon: Plus },
      { name: 'Bills List', href: '/billing/list', icon: List },
    ],
  },
  { name: 'About Us', href: '/about', icon: Info },
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href) => {
    return location.pathname === href;
  };

  const isParentActive = (children) => {
    return children.some(child => location.pathname === child.href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-64 flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} isActive={isActive} isParentActive={isParentActive} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <SidebarContent navigation={navigation} isActive={isActive} isParentActive={isParentActive} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen pb-24">
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

function SidebarContent({ navigation, isActive, isParentActive }) {
  const [expandedItems, setExpandedItems] = useState(
    navigation.reduce((acc, item) => {
      if (item.children && isParentActive(item.children)) {
        acc[item.name] = true;
      }
      return acc;
    }, {})
  );

  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
      <div className="flex flex-shrink-0 items-center px-4">
        <h1 className="text-xl font-bold text-gray-900">
          Pathology Lab
        </h1>
      </div>
      <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
        {navigation.map((item) => {
          if (item.children) {
            const isExpanded = expandedItems[item.name];
            const parentActive = isParentActive(item.children);
            
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={cn(
                    parentActive
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group w-full flex items-center pl-2 pr-1 py-2 text-left text-sm font-medium border-l-4 focus:outline-none focus:ring-2 focus:ring-primary-500'
                  )}
                >
                  <item.icon
                    className={cn(
                      parentActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                  />
                  {item.name}
                  <svg
                    className={cn(
                      isExpanded ? 'text-gray-400 rotate-90' : 'text-gray-300',
                      'ml-auto h-5 w-5 transform group-hover:text-gray-400 transition-colors ease-in-out duration-150'
                    )}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M6 6L14 10l-8 4V6z" fill="currentColor" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="space-y-1">
                    {item.children.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.href}
                        className={cn(
                          isActive(subItem.href)
                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group flex items-center pl-11 pr-2 py-2 text-sm font-medium border-l-4'
                        )}
                      >
                        <subItem.icon
                          className={cn(
                            isActive(subItem.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                            'mr-3 flex-shrink-0 h-6 w-6'
                          )}
                        />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                isActive(item.href)
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center pl-2 py-2 text-sm font-medium border-l-4'
              )}
            >
              <item.icon
                className={cn(
                  isActive(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 flex-shrink-0 h-6 w-6'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Layout; 