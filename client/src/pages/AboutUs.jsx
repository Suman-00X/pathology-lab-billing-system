import React from 'react';
import { Info, User, Mail, Phone, ExternalLink, Heart, Award } from 'lucide-react';

function AboutUs() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Info className="h-8 w-8 mr-3 text-primary-600" />
          About Us
        </h1>
        <p className="mt-2 text-lg text-gray-700">
          Learn more about our pathology lab billing software and the team behind it.
        </p>
      </div>

      {/* Application Overview */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-6 w-6 mr-2 text-primary-600" />
            Application Overview
          </h2>
          <div className="prose prose-primary max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Our Pathology Lab Billing Software is a comprehensive solution designed to streamline 
              the management of pathology laboratory operations. Built with modern technologies, 
              this application provides an intuitive interface for managing lab settings, tests, 
              and billing processes.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Core Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Advanced billing system with comprehensive search and filtering
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Smart doctor management with auto-search and mobile number validation
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Interactive dashboard with real-time analytics and charts
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Comprehensive report management with detailed test results
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Test group management with pricing and methodology tracking
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Advanced Capabilities</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Multi-criteria filtering (date range, amount, doctor, test groups)
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Intelligent search across all fields with auto-suggestions
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Payment tracking with multiple payment modes support
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Flexible lab configuration with optional GST settings
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Mobile-responsive design with intuitive user interface
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Information */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <User className="h-6 w-6 mr-2 text-primary-600" />
            Meet the Developer
          </h2>
          
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Suman Raj</h3>
                <p className="text-lg text-primary-600 font-medium mb-4">Full Stack Developer</p>
                <div className="space-y-2 text-gray-700">
                  <p className="leading-relaxed">
                    <span className="font-medium">Education:</span> B.Tech, Indian Institute of Information Technology Tiruchirappalli
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-medium">Experience:</span> 3+ years of software development experience
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a 
                      href="mailto:suman.raj.developer@gmail.com" 
                      className="text-primary-600 hover:text-primary-800"
                    >
                      suman.raj.developer@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <a 
                      href="tel:+917484015450" 
                      className="text-primary-600 hover:text-primary-800"
                    >
                      +91 7484015450
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <a
                  href="https://suman-raj.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="card">
        <div className="card-body text-center">
          <div className="max-w-3xl mx-auto">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" fill="currentColor" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              To provide healthcare professionals with intuitive, reliable, and efficient software 
              solutions that enhance their ability to deliver quality patient care. We believe in 
              the power of technology to simplify complex processes and improve healthcare outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs; 