import React from 'react';
import { Info, User, Mail, Phone, ExternalLink, Code, Heart, Award } from 'lucide-react';

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
                <h3 className="text-lg font-medium text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Complete test management with pricing and normal ranges
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Efficient billing system with payment tracking
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Comprehensive dashboard with analytics
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Lab settings and configuration management
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Technology Stack</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <Code className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                    Frontend: React.js with Tailwind CSS
                  </li>
                  <li className="flex items-start">
                    <Code className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                    Backend: Node.js with Express.js
                  </li>
                  <li className="flex items-start">
                    <Code className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                    Database: MongoDB
                  </li>
                  <li className="flex items-start">
                    <Code className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                    State Management: React Context API
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
                <p className="text-gray-700 leading-relaxed">
                  A passionate full-stack developer with expertise in modern web technologies. 
                  Dedicated to creating efficient, user-friendly applications that solve real-world problems. 
                  Specializes in React.js, Node.js, and database management systems.
                </p>
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

      {/* Contact Section */}
      <div className="card">
        <div className="card-body text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-700 mb-6">
            Have questions, suggestions, or need support? We'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a
              href="mailto:suman.raj.developer@gmail.com"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </a>
            <a
              href="tel:+917484015450"
              className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs; 