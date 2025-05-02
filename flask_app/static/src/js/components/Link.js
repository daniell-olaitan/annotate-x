import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';

const html = htm.bind(h);

export function Link({ text, handleClick, classes = ''}) {
  return html`
    <p
      class="text-base text-brand-color cursor-pointer ${classes}"
      onClick=${handleClick}
    >
      ${text}
    </>
  `;
}
