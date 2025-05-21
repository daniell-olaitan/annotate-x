import { Menu } from './Menu.js';
import { Popup } from './Popup.js';

import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function AnnotationList({
  image,
  annotations,
  setAnnotations,
  annotationList,
  setAnnotationList
}) {
  const [annotatn, setAnnotatn] = useState(null);
  const [popupPos, setPopupPos] = useState(null);

  useEffect(() => {
    if (!image || !annotations) return;

    const categories = {};
    const annotatns = [];
    annotations[image.id].forEach(a => {
      const category = a.category.name;

      if (category) {
        if (category in categories) {
          categories[category] += 1;
        } else {
          categories[category] = 1;
        }

        annotatns.push({id: a.id, value: `${category}${categories[category]}`});
      }
    });

    setAnnotationList(annotatns);
  }, [image, annotations]);

  const handleSelectedAnnotation = (a, e) => {
    const x = e.clientX;
    const y = e.clientY;
    const anotatn = annotations[image.id].find(an => an.id === a.id);

    setAnnotatn(anotatn);
    setPopupPos({x, y});
  };

  const handleAnnotationSelect = (annotatn) => {
    if (annotatn) {
      const updatedAnnotations = [...annotations[image.id].filter(a => a.id !== annotatn.id)];
      setAnnotations(prev => ({...prev, [image.id]: updatedAnnotations}));
    }

    setPopupPos(null);
  };

  return html`
    <${Menu}
      title="ANNOTATIONS"
      items=${annotationList}
      onSelect=${handleSelectedAnnotation}
    />

    ${popupPos &&
      html`
        <${Popup}
          labels=${[{id: 'remove', value: annotatn}]}
          popupPos=${popupPos}
          onSelect=${handleAnnotationSelect}
          title=${annotatn.category.name}
        />
      `
    }
  `;
}
