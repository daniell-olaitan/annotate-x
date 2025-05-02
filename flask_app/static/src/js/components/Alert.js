import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';

const html = htm.bind(h);

export function Alert({ error, loading, saving }) {
  return html`
    ${loading  &&
      html`<div class="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-2">Loading...</div>`
    }

    ${saving &&
      html`<div class="bg-green-100 text-green-800 px-4 py-2 rounded mb-2">${saving}</div>`
    }

    ${error &&
      html`<div class="bg-red-100 text-red-800 px-4 py-2 rounded mb-2">Error: ${error}</div>`
    }
  `;
}
