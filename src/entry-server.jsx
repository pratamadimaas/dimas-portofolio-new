import { renderToString } from 'react-dom/server';
import App from './App.jsx';

// Build-time only (scripts/prerender.mjs): static HTML for the first paint.
export function render() {
  return renderToString(<App />);
}
