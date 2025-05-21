import { Link } from './Link.js';

import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useRef, useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function AuthForm({ title, type, setProcessing, setError }) {
  const formRef = useRef(null);
  const opType = type === 'signin' ? 'signup' : 'signin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoClick = (e) => {
  };

  const handleSubmit = (e) => {
    const userAuth = async (type) => {
      const actions = {
        signin: 'Signing in ...',
        signup: 'Signing up ...'
      };

      setProcessing(actions[type]);

      try {
        const res = await fetch(`/${type}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({username, password}),
          credentials: 'include'
        });

        if (!res.ok) {
          let error = new Error(`Failed to ${type}`);
          if (res.status === 404 || res.status === 400) {
            const data = await res.json();
            error = new Error(`${data.message}`);
          }

            throw error;
        }

        if (res.status === 200) {
          if (type === 'signin') {
            window.location.href = '/';
          } else {
            window.location.href = '/signin';
          }
        }
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setProcessing('');
      }
    };

    e.preventDefault();

    if (!password.trim() || !username.trim()) {
      setError('Username and password are required');
      setTimeout(() => setError(''), 3000);

      return;
    }

    userAuth(type);
  };

  const handleOpTypeClick = (e) => {
    window.location.href = `/${opType}`;
  }

  return html`
    <div>
      <form
        novalidate
        ref=${formRef}
        onSubmit=${handleSubmit}
        class="max-w-md mx-auto p-6 bg-white border rounded shadow-lg space-y-4"
      >
        <p class="font-semibold text-sm text-c mb-1">${title}</p>

        <div>
          <label for="username" class="block mb-1 text-sm text-c">username</label>
          <input
            id="username"
            type="text"
            class="form-c"
            value=${username}
            onInput=${e => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label for="password" class="block mb-1 text-sm text-c">password</label>
          <input
            id="password"
            type="password"
            class="form-c"
            value=${password}
            onInput=${e => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          class="solid-btn-c w-full"
        >
          ${title}
        </button>

        <div class="flex pt-6">
          ${html`
            <${Link}
              text=${opType}
              handleClick=${handleOpTypeClick}
            />
          `}
          ${html`
            <${Link}
              text="sign in as a demo user"
              handleClick=${handleDemoClick}
              classes="ml-auto"
            />
          `}
        </div>
      </form>
    </div>
  `;
}
