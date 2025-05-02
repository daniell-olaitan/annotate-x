import { Menu } from './Menu.js';
import { Popup } from './Popup.js';

import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function AnnotationList({ annotations, setAnnotations }) {
  const [items, setItems] = useState([]);
  const [popupPos, setPopupPos] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setItems(annotations.map(a => a.id));
  }, [annotations]);

  const handleSelect = (item, e) => {
    const x = e.clientX;
    const y = e.clientY;

    setSelectedItem(item);
    setPopupPos({x, y});
  };

  const handleLabelSelect = (label) => {
    if (label && Object.keys(label).length > 0) {
      setAnnotations((prev) => prev.filter(item => item.id !== label.value));
    }

    setPopupPos(null);
  };

  return html`
    <${Menu}
      title="ANNOTATIONS"
      items=${items}
      onSelect=${handleSelect}
    />

    ${popupPos &&
      html`
        <${Popup}
          labels=${[{key: 'remove', value: selectedItem}]}
          popupPos=${popupPos}
          onSelect=${handleLabelSelect}
          title=${selectedItem}
        />
      `
    }
  `;
}
