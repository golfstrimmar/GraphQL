"use client";
import React, { useState } from "react";

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function MediaComponent({ media, setMedia }: { media: string; setMedia: (media: string) => void }) {
  const [active, setActive] = useState<string>('desktop');

  return (
    <div className="device-switch">
      <button className={active === 'desktop' ? 'device-btn device-btn--active' : 'device-btn'} type="button" title="Desktop" onClick={() => { setActive('desktop'); setMedia("desktop") }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M3.75 5.25A2.25 2.25 0 0 1 6 3h12a2.25 2.25 0 0 1 2.25 2.25v9A2.25 2.25 0 0 1 18 16.5h-3.75V18H16.5a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1 0-1.5h2.25v-1.5H6A2.25 2.25 0 0 1 3.75 14.25v-9Z" />
        </svg>
      </button>

      <button className={active === 'laptop' ? 'device-btn device-btn--active' : 'device-btn'} type="button" title="Laptop" onClick={() => { setActive('laptop'); setMedia("laptop") }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75V15H4.5V6.75Z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M3 18.75h18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.75Z" />
        </svg>
      </button>

      <button className={active === 'mobile' ? 'device-btn device-btn--active' : 'device-btn'} type="button" title="Mobile" onClick={() => { setActive('mobile'); setMedia("mobile") }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="8" y="3.75" width="8" height="16.5" rx="2" ry="2" stroke-width="1.5" />
          <circle cx="12" cy="17.5" r="0.75" stroke-width="1.5" />
        </svg>
      </button>
    </div>
  );
}

