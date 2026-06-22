const fs = require('fs');
const p = 'C:\\Users\\Casa\\Downloads\\manipro\\index.html';
let c = fs.readFileSync(p, 'utf8');

// Increase logo icon size from 80px to 110px
c = c.replace(/logo-icon\.png"[^>]*style="width:80px;height:80px/g, 
  'logo-icon.png" alt="ManiPro" style="width:110px;height:110px');

// Replace all scissors (✂) with nail emoji (💅)
c = c.replace(/✂️/g, '\uD83D\uDC85');
c = c.replace(/✂/g, '\uD83D\uDC85');
c = c.replace(/\u2702\uFE0F/g, '\uD83D\uDC85');
c = c.replace(/\u2702/g, '\uD83D\uDC85');

fs.writeFileSync(p, c, 'utf8');
console.log('Done! Scissors removed, icon enlarged');