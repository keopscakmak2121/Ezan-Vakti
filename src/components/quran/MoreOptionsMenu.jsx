import React, { useState, useEffect, useRef } from 'react';

const MoreOptionsMenu = ({ darkMode, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuStyles = {
    position: 'absolute',
    right: 0,
    top: '40px', // Position below the button
    backgroundColor: darkMode ? '#4b5563' : '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 50,
    overflow: 'hidden',
    minWidth: '180px',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        style={{
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          color: darkMode ? '#9ca3af' : '#6b7280',
          fontSize: '24px',
          lineHeight: 1,
        }}
      >
        ⋮
      </button>
      {isOpen && (
        <div ref={menuRef} style={menuStyles}>
          {children}
        </div>
      )}
    </div>
  );
};

export default MoreOptionsMenu;
