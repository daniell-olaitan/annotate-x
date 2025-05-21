import { Menu } from './Menu.js';
import { Popup } from './Popup.js';
import { saveAnnotation } from '../utils.js';

import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function ImageList({
  images,
  setImages,
  image,
  setImage,
  annotations,
  setError,
  setSaving,
  setAnnotationList
}) {
  const [imgToBeDeleted, setImgToBeDeleted] = useState(null);
  const [imgs, setImgs] = useState([]);
  const [popupPos, setPopupPos] = useState(null);

  useEffect(() => {
    if (!image || !images) return;

    setImgs(images.map(img => ({id: img.id, value: img.filename})));
  }, [image, images]);

  const handleSelectImage = (img, e) => {
    saveAnnotation({
      id: image.id,
      body: JSON.stringify(annotations[image.id]),
      setError: setError,
      setSaving: setSaving
    });

    setImage(images.find(i => i.id === img.id));
  };

  const getImageClass = (img, e) => {
    if (image) {
      return img.id === image.id
        ? 'bg-blue-500 text-white'
        : '';
    }
  };

  const onDeleteContextMenu = (img, e) => {
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    setImgToBeDeleted(img);
    setPopupPos({x, y});
  };

  const handleDeleteImage = (img, e) => {
    const deleteImage = async (imageId) => {
      setSaving('Deleting...');

      try {
        const res = await fetch(`/images/${imageId}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/signin';
          }
          else {
            throw new Error('Image not deleted');
          }
        }
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setSaving('');
      }
    };

    if (img) {
      const index = images.findIndex(i => i.id === img.id);

      deleteImage(img.id);
      if (image.id === img.id) {
        if (images.length === 1) {
          setImage(null);
          setImgs([]);
          setAnnotationList([]);
        } else if (images.length === index + 1) {
          setImage(images[0]);
        } else {
          setImage(images[index+1]);
        }
      }

      setImages(images.filter(i => i.id !== img.id));
    }

    setPopupPos(null);
  };

  return html`
    <${Menu}
      title="IMAGES"
      items=${imgs}
      onSelect=${handleSelectImage}
      getItemClass=${getImageClass}
      onContextMenu=${onDeleteContextMenu}
    />

    ${popupPos &&
      html`
        <${Popup}
          labels=${[{id: 'remove', value: imgToBeDeleted}]}
          popupPos=${popupPos}
          onSelect=${handleDeleteImage}
          title="image"
        />
      `
    }
  `;
}
