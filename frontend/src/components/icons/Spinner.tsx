import React from 'react';

const Spinner: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    width={props?.width || 12}
    height={props?.height || 12}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'flex' }} // Убирает влияние на высоту строки
    {...props}
  >
    <style>
      {`
        .spinner_line {
          animation: rotate 0.8s linear infinite;
          transform-origin: center;
          stroke-dasharray: 40; 
        }

        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }
      `}
    </style>
    <circle
      className="spinner_line"
      cx="12"
      cy="12"
      r="10"
      opacity="1"
    />
  </svg>
);

export default Spinner;