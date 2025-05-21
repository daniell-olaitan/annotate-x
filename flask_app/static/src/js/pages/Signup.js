import { AuthForm } from '../components/AuthForm.js';
import { Alert } from '../components/Alert.js';

import htm from 'https://esm.sh/htm';
import { h, render } from 'https://esm.sh/preact';
import { useState } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function Signup() {
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
          title="Sign up for AnnotateX"
          type="signup"
          setError=${setError}
          setProcessing=${setProcessing}
        />
      </div>
    </div>
  `;
}

render(
  html`<${Signup} />`,
  document.getElementById("signup")
);
