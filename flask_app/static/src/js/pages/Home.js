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

  const handleLogout = (e) => {
    const logout = async () => {
    setSaving('Logging out...');

      try {
        let data;
        const res = await fetch('/signout');

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/signin';
          }
          else {
            throw new Error('Failed to log out');
          }
        } else {
          window.location.href = '/signin';
        }
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setSaving('');
      }
    };

    logout();
  };

  return html`
    <div class="navbar p-6 flex justify-center p-4 shadow-sm">
      <div class="text-brand-color text-3xl">AnnotateX</div>
      <${Alert}
        error=${error}
        saving=${saving}
        loading=${loading}
      />

      <div class="flex items-center gap-4 ml-auto">
        <div class="text-c text-brand-color">${window.config.username}</div>
        <button onClick=${handleLogout} class="btn-c bg-red-700">Logout</button>
      </div>
    </div>

    <${AnnotationBoard}
      setError=${setError}
      projectId=${projectId}
      setSaving=${setSaving}
      setLoading=${setLoading}
    />

    <footer class="p-4 border-t border-gray-200">
      <p class="text-center text-c text-brand-color">© ${new Date().getFullYear()} | Developed by Daniel OLAITAN</p>
    </footer>
  `;
}

render(
  html`<${Home} />`,
  document.getElementById("project")
);
