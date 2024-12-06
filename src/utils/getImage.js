
// Texture Loading Promise Factory
const getImage = (url) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.addEventListener("load", (e) => resolve(img));
    img.addEventListener("error", () => {
      reject(new Error(`Failed to load image's URL: ${url}`));
    });
    img.src = url;
  });
};

export default getImage;
