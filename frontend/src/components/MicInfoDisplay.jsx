import React, { useState } from 'react'

const MicInfoDisplay = () => {
    const [showInfoBox, setShowInfoBox] = useState(false);

    // Function to toggle the visibility of the info box
    const toggleInfoBox = () => {
      setShowInfoBox(!showInfoBox);
    };
  
    return (
      <>
        {/* The microphone icon button */}
        <button
          onClick={toggleInfoBox} // Toggle info box on click
          className="fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-full shadow-lg
                     flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          style={{ fontFamily: 'Inter, sans-serif', width: '48px', height: '48px' }} // Fixed size for round button
          aria-label="Toggle microphone information" // Accessibility improvement
        >
          {/* Microphone icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a4 4 0 01-4-4V6a4 4 0 014-4v0a4 4 0 014 4v2a4 4 0 01-4 4z"
            />
          </svg>
        </button>
  
        {/* The drop-up information box */}
        {showInfoBox && (
          <div
            className="fixed bottom-20 left-4 bg-white text-gray-800 py-3 px-4 rounded-lg shadow-xl
                       max-w-xs transition-opacity duration-300 ease-in-out z-50
                       transform translate-y-0 opacity-100" // Ensure it appears above and is visible
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <p className="text-sm mb-2">
              <span className="font-semibold">Instructions:</span>
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Hold 5 seconds aany place on the screen to activate mic and release after spoke.</li>
              <li>Double click the screen to stop the voice response.</li>
            </ul>
            {/* Close button for the info box */}
            <button
              onClick={toggleInfoBox}
              className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close information box"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </>
    );
}

export default MicInfoDisplay