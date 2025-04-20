import { Popup } from './Popup.js';
import { Drawer } from '../utils/drawer.js';

import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useRef, useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function Annotator({imageUrl, savedBoxes = [], annotationColor, onSave, classes}) {
  const containerWidth = 900;
  const containerHeight = 400;

  const labels = Object.keys(classes);

  const newRectsRef = useRef([]);
  const drawerRef = useRef(new Drawer());

  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });

  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const isDrawingRef = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const currentPoint = useRef({ x: 0, y: 0 });

  const [popupPos, setPopupPos] = useState(null);

  useEffect(() => {
    const img = imageRef.current;
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      setNaturalSize({ width: naturalWidth, height: naturalHeight });

      const scaleX = containerWidth / naturalWidth;
      const scaleY = containerHeight / naturalHeight;
      setScale({ x: scaleX, y: scaleY });

      drawerRef.current.ctx = canvasRef.current.getContext('2d');
      drawAll(scaleX, scaleY);
    };
  }, [imageUrl, savedBoxes]);

  const getCurrentBox = (startPoint, currentPoint) => {
    return {
      id: null,
      class: null,
      box: {
        x: Math.min(startPoint.x, currentPoint.x) / scale.x,
        y: Math.min(startPoint.y, currentPoint.y) / scale.y,
        width: Math.abs(currentPoint.x - startPoint.x) / scale.x,
        height: Math.abs(currentPoint.y - startPoint.y) / scale.y,
        color: annotationColor
      }
    };
  };

  const drawAll = (scaleX, scaleY) => {
    const drawer = drawerRef.current;

    const drawBox = (boxProps) => {
      const box = boxProps.box;

      drawer.color = box.color;
      drawer.drawRect(box, scaleX, scaleY);

      if (boxProps.id) {
        const label = {
          x: box.x,
          y: box.y,
          text: boxProps.id
        };

        drawer.drawLabel(label, scaleX, scaleY);
      }
    };

    if (!drawer.ctx) return;
    drawer.clearRect({
      x: 0,
      y: 0,
      width: containerWidth,
      height: containerHeight
    });

    // Draw saved boxes
    savedBoxes.forEach(drawBox);

    // Draw new boxes
    newRectsRef.current.forEach(drawBox);

    // Draw active box
    if (isDrawingRef.current) {
      const boxProps = getCurrentBox(startPoint.current, currentPoint.current);
      drawBox(boxProps);
    }
  };

  const handleLabelSelect = (className) => {
    const boxProps =  newRectsRef.current.pop();

    if (className) {
      const sameClass = newRectsRef.current.filter(a => a.class === className);

      // Get existing numbers
      const numbers = sameClass.map(a =>
        parseInt(a.id.replace(className, ''), 10)
      ).sort((a, b) => a - b);

      // Find the smallest missing number
      let newNumber = 1;
      for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] !== i + 1) {
          newNumber = i + 1;
          break;
        }
        newNumber = numbers.length + 1;
      }

      const cls = classes[className];
      const newId = `${className}${newNumber}`;

      boxProps.id = newId;
      boxProps.class = className;
      boxProps.box.color = cls.color;
      newRectsRef.current.push(boxProps);
    }

    setPopupPos(null);
    drawAll(scale.x, scale.y);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    startPoint.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    currentPoint.current = startPoint.current;
    isDrawingRef.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();

    currentPoint.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    drawAll(scale.x, scale.y);
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const boxProps = getCurrentBox(startPoint.current, currentPoint.current);
    const box = boxProps.box;

    // Ignore very small boxes
    if (box.width < 20 || box.height < 20) {
      drawAll(scale.x, scale.y);
      return;
    }

    newRectsRef.current.push(boxProps);
    setPopupPos({
      x: (box.x + box.width) * scale.x,
      y: (box.y + box.width) * scale.y
    });

    if (onSave) {
      onSave(box); // Save to backend or local state
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scale]);

  return html`
    <div class="relative" style="width: ${containerWidth}px; height: ${containerHeight}px;">
      <img
        ref=${imageRef}
        src=${imageUrl}
        alt="annotatable"
        class="absolute top-0 left-0 w-full h-full object-contain"
      />

      <canvas
        ref=${canvasRef}
        width=${containerWidth}
        height=${containerHeight}
        class="absolute top-0 left-0 cursor-crosshair"
      />

      ${popupPos &&
        html`
          <${Popup}
            labels=${labels}
            popupPos=${popupPos}
            onSelect=${handleLabelSelect}
            title="select a class"
          />
        `}
    </div>
  `;
};
