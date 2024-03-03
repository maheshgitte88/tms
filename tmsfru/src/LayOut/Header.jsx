import React, { useState } from 'react';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white py-2 px-2 shadow flex justify-between items-center">
      <img style={{ width: "115px" }} src={'https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png'} className="object-cover" />
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="text-gray-600 focus:outline-none"
        >
          <i className="bi bi-person-circle text-xl"></i>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">
            <button
              onClick={() => {
                // Handle logout logic here
                console.log('Logout clicked');
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
            {/* Add more buttons or content here */}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
