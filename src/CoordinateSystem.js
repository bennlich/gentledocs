class CoordinateSystem {
  constructor() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;

    this.prevMouseX = null;
    this.prevMouseY = null;

    this.callbacks = [];
    this.mousedown = false;
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
    element.addEventListener('mousedown', () => {
      this.mousedown = true;
    });

    document.addEventListener('mousemove', (event) => {
      if (this.mousedown && this.prevMouseX && this.prevMouseY) {
        this.translateX += event.clientX - this.prevMouseX;
        this.translateY += event.clientY - this.prevMouseY;
        this.emitChange();
      }

      this.prevMouseX = event.clientX;
      this.prevMouseY = event.clientY;
    })

    document.addEventListener('mouseup', () => {
      this.mousedown = false;
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
