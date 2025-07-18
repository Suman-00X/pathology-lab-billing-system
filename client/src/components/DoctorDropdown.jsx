import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { useDoctors } from '../hooks/useApiHooks';

const DoctorDropdown = ({ 
  value, 
  onChange, 
  placeholder = "Select a doctor...",
  className = "",
  allowClear = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Fetch doctors with search
  const { doctors, loading } = useDoctors({ 
    search: searchTerm, 
    searchBy: 'all',
    limit: 50 // Limit for dropdown performance
  });

  // Find selected doctor
  const selectedDoctor = doctors.find(doctor => doctor._id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (doctor) => {
    onChange(doctor._id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const displayText = selectedDoctor 
    ? selectedDoctor.name 
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`flex-1 ${selectedDoctor ? 'text-gray-900' : 'text-gray-500'}`}>
          {displayText}
        </span>
        <div className="flex items-center space-x-1">
          {allowClear && selectedDoctor && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search Box */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-60">
            {/* All Doctors Option */}
            <div
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                value === '' ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
              }`}
              onClick={() => handleSelect({ _id: '' })}
            >
              <div className="font-medium">All Doctors</div>
              <div className="text-sm text-gray-500">Show bills from all referring doctors</div>
            </div>

            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                Loading doctors...
              </div>
            ) : doctors.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                {searchTerm ? 'No doctors found matching your search.' : 'No doctors available.'}
              </div>
            ) : (
              doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    value === doctor._id ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  }`}
                  onClick={() => handleSelect(doctor)}
                >
                  <div className="font-medium">{doctor.name}</div>
                  <div className="text-sm text-gray-500 mt-1 space-y-1">
                    {doctor.qualification && (
                      <div>Qualification: {doctor.qualification}</div>
                    )}
                    <div>Phone: {doctor.phone}</div>
                    {doctor.totalBillsReferred > 0 && (
                      <div className="text-xs text-gray-400">
                        {doctor.totalBillsReferred} referrals • ₹{(doctor.totalReferredAmount || 0).toFixed(2)} total
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDropdown; 