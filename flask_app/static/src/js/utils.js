export class Drawer {
  ctx = null;

  constructor({ lineWidth = 2, color = 'red'} = {}) {
    this.lineWidth = lineWidth;
    this.color = color;
  }

  _setProperties() {
    this.ctx.font = 'bold 14px monospace';
    this.ctx.strokeStyle = this.color;
    this.ctx.fillStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
  }

  drawRect(rect, scaleX = 1, scaleY = 1) {
    this._setProperties();

    this.ctx.strokeRect(
      rect.x * scaleX,
      rect.y * scaleY,
      rect.width * scaleX,
      rect.height * scaleY
    );
  }

  drawLabel(label, scaleX = 1, scaleY = 1) {
    this._setProperties();
    this.ctx.fillText(label.text, label.x * scaleX+ 4, label.y * scaleY + 12);
  }

  clearRect(rect) {
    this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
  }
}

export const saveAnnotation = async ({ id, body, setError, setSaving }) => {
  setSaving('Saving...');

  try {
    const res = await fetch(`/images/${id}/annotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    });

    if (!res.ok) {
      let error = new Error('Failed to save changes');

      if (res.status === 401) {
        window.location.href = '/signin';
      }
      else if (res.status === 404 || res.status === 400) {
        const data = await res.json();
        error = new Error(`${data.message}`);
      }

        throw error;
    }
  } catch (err) {
    setError(err.message);
    setTimeout(() => setError(''), 3000);
  } finally {
    setSaving('');
  }
}
