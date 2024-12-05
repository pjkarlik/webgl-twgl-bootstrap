
// Simple Mouse Class //
class Mouse {
    constructor(element) {
      // Element or Window object for Adding Listner
      this.element = element || window;
      this.drag = false;
      // Get Floor Half the size of Screen Width/Height
      this.x =
        ~~(document.documentElement.clientWidth, window.innerWidth || 0) / 2;
      this.y =
        ~~(document.documentElement.clientHeight, window.innerHeight || 0) / 2;
      this.getCoordinates = this.getCoordinates.bind(this);
      // Event List to Track
      this.events = ["mouseenter", "mousemove"];
      this.events.forEach((eventName) => {
        this.element.addEventListener(eventName, this.getCoordinates);
      });
      // Mouse Click Toggle
      this.element.addEventListener("mousedown", () => {
        this.drag = true;
      });
      this.element.addEventListener("mouseup", () => {
        this.drag = false;
      });
      window.addEventListener("resize", this.reset);
    }
    // Reset Size
    reset = () => {
      this.x =
        ~~(document.documentElement.clientWidth, window.innerWidth || 0) / 2;
      this.y =
        ~~(document.documentElement.clientHeight, window.innerHeight || 0) / 2;
    };
    // Tracking Loop
    getCoordinates(event) {
      event.preventDefault();
      if (this.drag) {
        this.x = event.pageX;
        this.y = event.pageY;
      }
    }
  }

  export default Mouse;
  