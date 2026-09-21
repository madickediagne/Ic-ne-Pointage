const fs = require('fs');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#1d4ed8"/>
  <text x="50%" y="50%" font-family="Arial" font-size="280" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central">IC</text>
</svg>`;

// We don't have sharp, but we can just save it as SVG and update manifest if needed.
// Wait, manifest specifies "image/png" and points to .png. 
// Can we just use a small base64 png? Yes. Here is a valid 1x1 transparent PNG just to not be 0 bytes, 
// or better, let's use a simple node canvas if installed. 
// Actually, let's just create an SVG and change the manifest to use the SVG for now, and warn the user to replace it.
// Many modern browsers support SVG for PWA icons.

fs.writeFileSync('public/icons/icon-192x192.svg', svgIcon);
fs.writeFileSync('public/icons/icon-512x512.svg', svgIcon);

console.log("SVG icons generated.");
