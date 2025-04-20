import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';

const html = htm.bind(h);

export function Menu({ title, items, onSelect }) {
  return html`
    <div class="relative">
      <p class="font-semibold sticky top-0 text-sm text-c mb-1">${title}</p>
      <ul class="space-y- h-40 overflow-y-auto">
        ${items.map(
          item => html`
            <li>
              <button
                class="text-sm px-3 py-1 truncate hover:bg-blue-100 w-full text-left text-c"
                onClick=${onSelect ? () => onSelect(item) : undefined}
                title=${item}
              >
                ${item}
              </button>
            </li>
          `
        )}
      </ul>
    </div>
  `;
}
