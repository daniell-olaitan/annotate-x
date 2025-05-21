import { AuthForm } from '../components/AuthForm.js';
import { Alert } from '../components/Alert.js';

import htm from 'https://esm.sh/htm';
import { h, render } from 'https://esm.sh/preact';
import { useState } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function Signin() {
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState('');

  return html`
    <div class="h-full">
      <div class="flex justify-center">
        <${Alert}
          error=${error}
          processing=${processing}
        />
      </div>

      <div class="flex h-full items-center justify-center">
        <${AuthForm}
          title="Sign in to AnnotateX"
          type="signin"
          setError=${setError}
          setProcessing=${setProcessing}
        />
      </div>
    </div>
  `;
}

render(
  html`<${Signin} />`,
  document.getElementById("signin")
);
