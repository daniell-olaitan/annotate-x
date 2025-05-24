import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useRef, useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function InputPopup({ onSubmit, popupPos }) {
  const popupWidth = 200;
  const popupHeight = 3 * 36 + 40;

  const [category, setCategory] = useState('');

  const inputRef = useRef(null);
  const popupRef = useRef(null);

  const [position, setPosition] = useState(popupPos);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onSubmit(null, e);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    let x = popupPos.x;
    let y = popupPos.y;

    if (x + popupWidth > innerWidth) {
      x = innerWidth - popupWidth - 10;
    }

    if (y + popupHeight > innerHeight) {
      y = innerHeight - popupHeight - 10;
    }

    setPosition({ x, y });
  }, [popupPos]);

  return html`
    <div
      ref=${popupRef}
      class="absolute bg-white border rounded shadow-lg z-50 py-4 px-6"
      style=${{ top: position.y + 'px', left: position.x + 'px' }}
    >
      <form novalidate>
        <label for="category" class="block mb-2 text-sm text-c font-semibold">Category</label>
        <input
          ref=${inputRef}
          id="category"
          type="text"
          class="form-c mb-2"
          value=${category}
          onInput=${e => setCategory(e.target.value)}
        />

        <div class="flex">
          <button
            class="solid-btn-c ml-auto"
            type="submit"
            onClick=${(e) => onSubmit(category, e)}
          >
            Enter
          </button>
        </div>
      </form>
    </div>
  `;
}
