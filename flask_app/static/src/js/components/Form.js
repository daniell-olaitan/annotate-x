import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useRef, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function Form({
  title,
  classes,
  popupPos,
  setImages,
  setClasses,
  projectName,
  setPopupPos,
  handleSubmit,
  includeImage,
  imageOnly,
  setProjectName
}) {
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setPopupPos(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return html`
    <form
      novalidate
      ref=${formRef}
      onSubmit=${handleSubmit}
      style=${{ top: popupPos.y + 'px', left: popupPos.x + 'px' }}
      class="max-w-md mx-auto p-4 absolute bg-white border rounded shadow-lg z-50 space-y-4"
    >
      <p class="font-semibold text-sm text-c mb-1">${title}</p>

      ${!imageOnly &&
        html`
          <div>
            <label for="project-name" class="block mb-1 text-sm text-c">Project Name</label>
            <input
              id="project-name"
              type="text"
              class="form-c"
              value=${projectName}
              onInput=${e => setProjectName(e.target.value)}
              required
            />
          </div>

          <div>
            <label for="project-classes" class="block mb-1 text-sm text-c">Classes (semi-colon separated)</label>
            <input
              id="project-classes"
              type="text"
              class="form-c"
              value=${classes}
              onInput=${e => setClasses(e.target.value)}
              required
            />
          </div>
        `
      }

      ${includeImage &&
        html `<div>
          <label for="project-images" class="block mb-1 text-sm text-c">Upload Images</label>
          <input
            id="project-images"
            type="file"
            class="w-full text-c"
            multiple
            accept="image/*"
            onChange=${e => setImages(Array.from(e.target.files))}
          />
        </div>`
      }

      <button
        type="submit"
        class="solid-btn-c w-full"
      >
        ${title}
      </button>
    </form>
  `;
}
