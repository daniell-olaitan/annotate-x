import { Menu } from './Menu.js';
import { Popup } from './Popup.js';

import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useState } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function ImageList({
  imageUrls,
  setImageUrls,
  selectedImage,
  setSelectedImage
}) {
  const items = Object.keys(imageUrls);
  const [popupPos, setPopupPos] = useState(null);

  const handleSelectedItem = (item) => {
    setSelectedImage(item);
  };

  const getItemClass = (item, e) => {
    return item === selectedImage
      ? 'bg-blue-500 text-white'
      : '';
  };

  const onContextMenu = (item, e) => {
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    setPopupPos({x, y});
  };

  const handleLabelSelect = (label) => {
    if (label) {
      delete imageUrls[label];

      const newItems = items.filter(item => item !== label);
      const index = items.findIndex(item => item === label);

      setImageUrls(imageUrls);
      if (selectedImage === label) {
        if (newItems.length === 0) {
          setSelectedImage(null);
        } else if (index < newItems.length) {
          setSelectedImage(newItems[index]);
        } else {
          setSelectedImage(newItems[index-1]);
        }
      }
    }

    setPopupPos(null);
  };

  return html`
    <${Menu}
      title="IMAGES"
      items=${items}
      onSelect=${handleSelectedItem}
      getItemClass=${getItemClass}
      onContextMenu=${onContextMenu}
    />

    ${popupPos &&
      html`
        <${Popup}
          labels=${[{key: 'remove', value: selectedImage}]}
          popupPos=${popupPos}
          onSelect=${handleLabelSelect}
          title="image"
        />
      `
    }
  `;
}
