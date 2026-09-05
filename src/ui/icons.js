const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  pie: '<path d="M21 12a9 9 0 1 1-9-9v9Z"/><path d="M16 3.9A9 9 0 0 1 20.1 8H16Z"/>',
  trend: '<path d="m3 17 6-6 4 4 8-10M15 5h6v6"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  compare: '<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>',
  scan: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 12h10M7 8h4m-4 8h7"/>',
  sliders:
    '<path d="M4 7h6m4 0h6M4 17h10m4 0h2"/><circle cx="12" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2ZM9 7h6M9 11h6M9 15h3"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6"/>',
  building:
    '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 8h1m4 0h1m-6 4h1m4 0h1M10 21v-5h4v5"/>',
  present:
    '<rect x="3" y="3" width="18" height="13" rx="1"/><path d="M12 16v5m-4 0h8M7 12l4-4 3 3 3-5"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  settings:
    '<path d="M4 7h6m4 0h6M4 17h10m4 0h2"/><circle cx="12" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  book: '<path d="M3 4h6l3 2 3-2h6v15h-6l-3 2-3-2H3ZM12 6v15"/>',
  external: '<path d="M14 3h7v7M21 3l-9 9M10 3H3v18h18v-7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
};
export const icon = (name, className = "") =>
  `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
