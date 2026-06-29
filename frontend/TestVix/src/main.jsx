
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'



import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
  let { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        let el = document.querySelector(hash);

        if (el) {
          const offset = 90; // navbar height
          const top =
            el.getBoundingClientRect().top +
            window.pageYOffset -
            offset;

          window.scrollTo({
            top,
            behavior: "smooth",
          });
          el = ''
          hash = ''
        }
      }, 0);
    }
  }, [hash]);

  return null;
}


createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
    <ScrollToHash/>
      <App />
    </BrowserRouter>
  // </StrictMode>
)
