import { Alert } from '../components/Alert.js';
import { AnnotationBoard } from '../components/AnnotationBoard.js';

import htm from 'https://esm.sh/htm';
import { h, render } from 'https://esm.sh/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

function Home() {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    setProjectId(window.config.projectId);
  }, []);

  return html`
    <div class="navbar p-6 flex items-center p-4 shadow-sm justify-between">
      <div class="text-brand-color text-3xl">AnnotateX</div>
      <${Alert}
        error=${error}
        saving=${saving}
        loading=${loading}
      />

      <div class="flex items-center gap-4">
        <div class="text-c text-brand-color">${window.config.username}</div>
        <button class="btn-c bg-red-700">Logout</button>
      </div>
    </div>

    <${AnnotationBoard}
      setError=${setError}
      projectId=${projectId}
      setSaving=${setSaving}
      setLoading=${setLoading}
    />
  `;
}

render(
  html`<${Home} />`,
  document.getElementById("home")
);
