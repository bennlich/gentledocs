class CoordinateSystem {
  constructor() {
    this.scale = 1;
    this.originX = 0;
    this.originY = 0;

    this.prevMouseX = null;
    this.prevMouseY = null;

    this.callbacks = [];
    this.mousedown = false;
    this.panning = false;
  }

  // transform(worldCoord) {
  //   let worldX = worldCoord.x;
  //   let worldY = worldCoord.y;
  //   return {
  //     x: (worldX + this.originX) * this.scale,
  //     y: (worldY + this.originY) * this.scale
  //   };
  // }

  invert(screenCoord) {
    let screenX = screenCoord.x;
    let screenY = screenCoord.y;
    return {
      x: screenX / this.scale - this.originX,
      y: screenY / this.scale - this.originY
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

        this.originX += (event.clientX - this.prevMouseX);
        this.originY += (event.clientY - this.prevMouseY);
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
      let prevScale = this.scale;
      if (event.deltaY < 0) {
        this.scale += 0.1;
        this.originX += (event.clientX - this.originX) * (1 - this.scale / prevScale);
        this.originY += (event.clientY - this.originY) * (1 - this.scale / prevScale);
      } else {
        this.scale -= 0.1;
        this.originX += (event.clientX - this.originX) * (1 - this.scale / prevScale);
        this.originY += (event.clientY - this.originY) * (1 - this.scale / prevScale);
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
