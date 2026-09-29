// The project icon set: contract icon names -> one inline SVG path (24x24 viewBox) each.
// `filled: false` icons are drawn as an outline (stroke) instead of a solid shape.
// Unknown names fall back to DEFAULT_ICON, a neutral placeholder square — never nothing.
export interface IconGlyph {
  d: string;
  filled?: boolean;
}

export const DEFAULT_ICON: IconGlyph = { d: 'M4 4h16v16H4z', filled: false };

export const ICONS: Record<string, IconGlyph> = {
  cart: { d: 'M7.2 14h9.5a2 2 0 0 0 1.9-1.4L21 6H6.2L5.3 3H1v2h3l3.6 7.6-1.3 2.4a2 2 0 0 0 1.9 3h10v-2H8zM7 18a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm10 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2z' },
  plus: { d: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z' },
  minus: { d: 'M19 13H5v-2h14z' },
  trash: { d: 'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm13-15h-3.5l-1-1h-5l-1 1H5v2h14z' },
  search: { d: 'M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z' },
  close: { d: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' },
  back: { d: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z' },
  'chevron-left': { d: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z' },
  'chevron-right': { d: 'M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z' },
  'chevron-down': { d: 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z' },
  check: { d: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' },
  info: { d: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z' },
  warning: { d: 'M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z' },
  error: { d: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z' },
  success: { d: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1.5 14.5L6 12l1.41-1.41L10.5 13.67l6.09-6.09L18 9z' },
  star: { d: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' },
  'star-half': { d: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' },
  'star-empty': { d: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', filled: false },
  home: { d: 'M12 3 2 12h3v8h6v-6h2v6h6v-8h3z' },
  user: { d: 'M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3.3 0-9.8 1.6-9.8 4.9V21h19.6v-1.9c0-3.3-6.5-4.9-9.8-4.9z' },
  share: { d: 'M18 16.1c-.8 0-1.5.3-2 .8L8.9 13c.1-.3.1-.7 0-1l7-4.1c.5.5 1.3.8 2.1.8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .3 0 .7.1 1L8 10.9c-.5-.5-1.3-.9-2.1-.9-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.6-.3 2.1-.9l7.1 4.2c-.1.3-.1.6-.1.9 0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3z' },
  grid: { d: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
  list: { d: 'M4 5h2v2H4zM8 5h12v2H8zM4 11h2v2H4zM8 11h12v2H8zM4 17h2v2H4zM8 17h12v2H8z' },
  box: { d: 'M21 8l-9-5-9 5v8l9 5 9-5zM12 4.2 18.3 8 12 11.8 5.7 8zM5 9.9l6 3.3v6.8l-6-3.3zm8 10.1v-6.8l6-3.3v6.8z' },
  more: { d: 'M6 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2z' },
  menu: { d: 'M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z' },
  calendar: { d: 'M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zm12 8H5v10h14z' },
  upload: { d: 'M5 20h14v-2H5zM12 2 6 8h4v6h4V8h4z' },
  image: { d: 'M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8 8.5A1.5 1.5 0 1 1 6.5 10 1.5 1.5 0 0 1 8 8.5zM5 18l4-5 3 3.5L15 12l4 6z' },
  'image-off': { d: 'M21 3v13.2l-2-2V5H9.8l-2-2zM3 3l18 18-1.4 1.4L3 4.4z' },
  play: { d: 'M8 5v14l11-7z' },
  pause: { d: 'M6 5h4v14H6zM14 5h4v14h-4z' },
  refresh: { d: 'M12 6V2L7 7l5 5V8a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z' },
  filter: { d: 'M4 5h16v2H4zM7 11h10v2H7zM10 17h4v2h-4z' },
  'sort-asc': { d: 'M11 20h2V10l4 4 1.4-1.4L12 6.2l-6.4 6.4L7 14l4-4z' },
  'sort-desc': { d: 'M13 4h-2v10l-4-4-1.4 1.4L12 17.8l6.4-6.4L17 10l-4 4z' },
};
