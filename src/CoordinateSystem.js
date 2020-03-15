class CoordinateSystem {
  constructor() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;

    this.prevMouseX = null;
    this.prevMouseY = null;

    this.callbacks = [];
    this.mousedown = false;
    this.panning = false;
  }

  transform(worldCoord) {
    let worldX = worldCoord.x;
    let worldY = worldCoord.y;
    return {
      x: (worldX + this.translateX) * this.scale,
      y: (worldY + this.translateY) * this.scale
    };
  }

  registerEventListeners(element) {
    // Pan
    element.addEventListener('pointerdown', () => {
      this.mousedown = true;
    });

    document.addEventListener('pointermove', (event) => {
      if (this.mousedown && this.prevMouseX && this.prevMouseY) {
        this.panning = true;

        this.translateX += event.clientX - this.prevMouseX;
        this.translateY += event.clientY - this.prevMouseY;
        this.emitChange();
      }

      this.prevMouseX = event.clientX;
      this.prevMouseY = event.clientY;
    });

    document.addEventListener('pointerup', (event) => {
      if (this.panning) {
        // Stop the event from triggering any other listeners (e.g. the listener that creates a new text input)
        event.stopPropagation();
      }

      this.mousedown = false;
      this.panning = false;
    });

    // Zoom
    document.addEventListener('wheel', (event) => {
      if (event.deltaY < 0) {
        this.scale += 0.1;
      } else {
        this.scale -= 0.1;
      }
      this.emitChange();
    });
  }

  onChange(fn) {
    this.callbacks.push(fn);
  }

  emitChange() {
    this.callbacks.forEach((fn) => fn());
  }
}

export { CoordinateSystem };
