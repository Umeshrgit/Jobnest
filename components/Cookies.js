import React, { useState, useEffect } from 'react';

const Cookies = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!consent && loggedIn === 'true') {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 flex justify-between items-center z-50 shadow-md">
      <span className="text-sm">
        We use cookies to improve your experience. Read our{' '}
        <a href="/privacy" className="underline text-blue-400 hover:text-blue-300">Privacy Policy</a>.
      </span>
      <button
        onClick={handleAccept}
        className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-sm"
      >
        Accept
      </button>
    </div>
  );
};

export default Cookies;
