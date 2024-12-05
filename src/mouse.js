
// Mouse Class for movments and attaching to dom //
class Mouse {
    constructor(element) {
      this.element = element || window;
      this.drag = false;
      this.x =
        ~~(document.documentElement.clientWidth, window.innerWidth || 0) / 2;
      this.y =
        ~~(document.documentElement.clientHeight, window.innerHeight || 0) / 2;
      this.getCoordinates = this.getCoordinates.bind(this);
      this.events = ["mouseenter", "mousemove"];
      this.events.forEach((eventName) => {
        this.element.addEventListener(eventName, this.getCoordinates);
      });
      this.element.addEventListener("mousedown", () => {
        this.drag = true;
      });
      this.element.addEventListener("mouseup", () => {
        this.drag = false;
      });
      window.addEventListener("resize", this.reset);
    }
    reset = () => {
      this.x =
        ~~(document.documentElement.clientWidth, window.innerWidth || 0) / 2;
      this.y =
        ~~(document.documentElement.clientHeight, window.innerHeight || 0) / 2;
    };
    getCoordinates(event) {
      event.preventDefault();
      if (this.drag) {
        this.x = event.pageX;
        this.y = event.pageY;
      }
    }
  }

  export default Mouse;
  