import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8fafc;
    color: #1a202c;
    line-height: 1.6;
  }

  @media (prefers-color-scheme: dark) {
    body {
      background-color: #0f172a;
      color: #f1f5f9;
    }
  }

  /* ScrollFont Integration */
  @font-face {
    font-family: 'ScrollFont';
    src: url('/assets/fonts/ScrollFont-Regular.woff2') format('woff2'),
         url('/assets/fonts/ScrollFont-Regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'ScrollFont';
    src: url('/assets/fonts/ScrollFont-Bold.woff2') format('woff2'),
         url('/assets/fonts/ScrollFont-Bold.woff') format('woff');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'ScrollFont';
    src: url('/assets/fonts/ScrollFont-Light.woff2') format('woff2'),
         url('/assets/fonts/ScrollFont-Light.woff') format('woff');
    font-weight: 300;
    font-style: normal;
    font-display: swap;
  }

  /* Headings use ScrollFont */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'ScrollFont', -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 0.5em;
  }

  h1 {
    font-size: 2.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  h2 {
    font-size: 2rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  h4 {
    font-size: 1.25rem;
  }

  h5 {
    font-size: 1.125rem;
  }

  h6 {
    font-size: 1rem;
  }

  /* Links */
  a {
    color: #667eea;
    text-decoration: none;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: #5a67d8;
      text-decoration: underline;
    }
  }

  /* Focus styles for accessibility */
  *:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    transition: background 0.2s ease-in-out;

    &:hover {
      background: #94a3b8;
    }
  }

  @media (prefers-color-scheme: dark) {
    ::-webkit-scrollbar-track {
      background: #1e293b;
    }

    ::-webkit-scrollbar-thumb {
      background: #475569;

      &:hover {
        background: #64748b;
      }
    }
  }

  /* Selection styling */
  ::selection {
    background: rgba(102, 126, 234, 0.2);
    color: inherit;
  }

  ::-moz-selection {
    background: rgba(102, 126, 234, 0.2);
    color: inherit;
  }

  /* Prophetic elements styling */
  .prophetic-text {
    background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
  }

  .spiritual-glow {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    animation: spiritualPulse 3s ease-in-out infinite;
  }

  @keyframes spiritualPulse {
    0%, 100% {
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    }
  }

  /* Responsive typography */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }

    h1 {
      font-size: 2rem;
    }

    h2 {
      font-size: 1.75rem;
    }

    h3 {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    html {
      font-size: 13px;
    }

    h1 {
      font-size: 1.75rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    h3 {
      font-size: 1.25rem;
    }
  }

  /* Print styles */
  @media print {
    * {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }

    .no-print {
      display: none !important;
    }
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    * {
      border-color: currentColor !important;
    }

    button,
    input,
    textarea,
    select {
      border: 2px solid currentColor !important;
    }
  }

  /* RTL support for Hebrew and Arabic */
  [dir="rtl"] {
    text-align: right;
  }

  [dir="rtl"] .sidebar {
    right: 0;
    left: auto;
  }

  [dir="rtl"] .dropdown-menu {
    right: auto;
    left: 0;
  }

  /* Loading states */
  .loading {
    opacity: 0.6;
    pointer-events: none;
  }

  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @media (prefers-color-scheme: dark) {
    .skeleton {
      background: linear-gradient(90deg, #2d3748 25%, #4a5568 50%, #2d3748 75%);
      background-size: 200% 100%;
    }
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .hidden {
    display: none;
  }

  .visible {
    display: block;
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .gap-1 {
    gap: 0.25rem;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .gap-4 {
    gap: 1rem;
  }

  .gap-8 {
    gap: 2rem;
  }

  .p-4 {
    padding: 1rem;
  }

  .p-8 {
    padding: 2rem;
  }

  .m-4 {
    margin: 1rem;
  }

  .m-8 {
    margin: 2rem;
  }

  .w-full {
    width: 100%;
  }

  .h-full {
    height: 100%;
  }
`;