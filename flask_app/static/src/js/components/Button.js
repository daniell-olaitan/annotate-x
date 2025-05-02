import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';

const html = htm.bind(h);

export function Button({ text, handleClick, classes = ''}) {
  return html`
    <button
      class="solid-btn-c ${classes}"
      onClick=${handleClick}
    >
      ${text}
    </button>
  `;
}
