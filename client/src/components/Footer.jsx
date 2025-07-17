import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 z-40">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center text-sm text-gray-600 mb-4 md:mb-0">
            <span>&copy; {currentYear} Pathology Lab Billing Software. All rights reserved.</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" fill="currentColor" /> by{' '}
              <a
                href="https://suman-raj.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary-600 hover:text-primary-800 font-medium flex items-center"
              >
                Suman
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 