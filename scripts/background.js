const keyTimes = [
  { time: 5, color1: '#FF9A9E', color2: '#FAD0C4' },    // Sunrise start (5am)
  { time: 8, color1: '#A1C4FD', color2: '#C2E9FB' },    // Day start (8am)
  { time: 17, color1: '#FBC7A4', color2: '#F6D365' },   // Sunset start (5pm)
  { time: 20, color1: '#FAD0C4', color2: '#FF9A9E' },   // Night start (8pm)
  { time: 24, color1: '#a6ffd7', color2: '#78d6ff' },   // Midnight (12am)
  { time: 0, color1: '#92ff92', color2: '#ffee33' }     // Midnight (0am) - loops smoothly
];

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 8) hex = hex.slice(0, 6); // Remove alpha if present
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function interpolateColor(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  return rgbToHex(r, g, b);
}

function getCurrentGradient() {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  let i = 0;
  for (; i < keyTimes.length - 1; i++) {
    if (hour >= keyTimes[i].time && hour < keyTimes[i+1].time) break;
  }

  const start = keyTimes[i];
  const end = keyTimes[i+1];
  const totalTime = (end.time > start.time) ? (end.time - start.time) : (24 - start.time + end.time);
  let timePassed = hour - start.time;
  if (timePassed < 0) timePassed += 24; // handle wrap past midnight

  const factor = timePassed / totalTime;

  // Only interpolate the first color (color1)
  const topColor = interpolateColor(start.color1, end.color1, factor);

  // Gradient from topColor (top) to white (bottom)
  return `linear-gradient(to bottom, ${topColor} 0%, ${topColor} 60%, #ffffff 100%)`;
}

function updateBackgroundGradient() {
  const gradient = getCurrentGradient();

  if (window.innerWidth <= 799) {
    // Mobile: make gradient taller & fixed
    $('body').css({
      'background-image': gradient,
      'background-repeat': 'no-repeat',
      'background-attachment': 'fixed',
      'background-size': '100% 200vh', // taller gradient on mobile
      'transition': 'background-image 1s ease'
    });
  } else {
    // Desktop: normal gradient style
    $('body').css({
      'background-image': gradient,
      'background-repeat': 'repeat-x', // or 'no-repeat' if you prefer
      'background-attachment': 'scroll',
      'background-size': 'auto',
      'transition': 'background-image 1s ease'
    });
  }
}

$(function() {
  const $window = $(window);
  const $header = $('#banner');
  let isWhite = true;

  function updateBackgroundPosition() {
    const scrollPosition = $window.scrollTop();
    $header.css({'background-position': `0px -${scrollPosition - 100}px`});

    const shouldBeWhite = scrollPosition >= 0;
    if (shouldBeWhite && !isWhite) {
      $("body").css({
        "background-color": "white",
        "transition": "background-color 0.5s ease"
      });
      isWhite = true;
    } else if (!shouldBeWhite && isWhite) {
      $("body").css({
        "background-color": "#dafffd",
        "transition": "background-color 0.5s ease"
      });
      isWhite = false;
    }
  }

  // Initial gradient update
  updateBackgroundGradient();

  // Update gradient every minute (smooth color transition over time)
  setInterval(updateBackgroundGradient, 60 * 1000);

  // Update background position & color on scroll
  $window.on('scroll', updateBackgroundPosition);

  // Initial call to set positions/colors properly on load
  updateBackgroundPosition();
});