import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useRef, useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function Popup({ labels, onSelect, onContextMenu, popupPos, title }) {
  const modalWidth = 200;
  const modalHeight = labels.length * 36 + 40;

  const popupRef = useRef(null);
  const [position, setPosition] = useState(popupPos);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onSelect(null, e);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    let x = popupPos.x;
    let y = popupPos.y;

    if (x + modalWidth > innerWidth) {
      x = innerWidth - modalWidth - 10;
    }

    if (y + modalHeight > innerHeight) {
      y = innerHeight - modalHeight - 10;
    }

    setPosition({ x, y });
  }, [popupPos]);

  return html`
    <div
      ref=${popupRef}
      class="absolute bg-white border rounded shadow-lg z-50 py-4 px-6"
      style=${{ top: position.y + 'px', left: position.x + 'px' }}
    >
      <p class="font-semibold text-sm text-c mb-4">${title}</p>
      <ul class="space-y-1">
        ${labels.map(
          label => html`
            <li>
              <button
                key=${label.key}
                class="text-sm px-3 py-1 rounded hover:bg-blue-100 w-full text-left text-c"
                onClick=${(e) => onSelect(label, e)}
                onContextMenu=${onContextMenu ? (e) => onContextMenu(label, e) : undefined}
              >
                ${label.key}
              </button>
            </li>
          `
        )}
      </ul>
    </div>
  `;
}
