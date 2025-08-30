// Mouse (and Touch) Class for movements and attaching to DOM
class Mouse {
  constructor(element) {
    this.element = element || window;
    this.drag = false;

    // Start at center
    this.x = (window.innerWidth || 0) / 2;
    this.y = (window.innerHeight || 0) / 2;

    this.getCoordinates = this.getCoordinates.bind(this);

    // Mouse events
    ["mouseenter", "mousemove"].forEach((eventName) => {
      this.element.addEventListener(eventName, this.getCoordinates, {
        passive: false
      });
    });

    this.element.addEventListener("mousedown", () => {
      this.drag = true;
    });
    this.element.addEventListener("mouseup", () => {
      this.drag = false;
    });

    // Touch events
    this.element.addEventListener(
      "touchstart",
      (e) => {
        this.drag = true;
        this.getCoordinates(e);
      },
      { passive: false }
    );

    this.element.addEventListener("touchmove", this.getCoordinates, {
      passive: false
    });

    this.element.addEventListener("touchend", () => {
      this.drag = false;
    });

    window.addEventListener("resize", this.reset);
  }

  reset = () => {
    this.x = (window.innerWidth || 0) / 2;
    this.y = (window.innerHeight || 0) / 2;
  };

  getCoordinates(event) {
    event.preventDefault();

    let pageX, pageY;

    if (event.type.startsWith("touch")) {
      if (event.touches.length > 0) {
        pageX = event.touches[0].pageX;
        pageY = event.touches[0].pageY;
      } else {
        return;
      }
    } else {
      pageX = event.pageX;
      pageY = event.pageY;
    }

    if (this.drag) {
      this.x = pageX;
      this.y = (window.innerHeight || 0) - pageY;
    }
  }
}

export default Mouse;
  