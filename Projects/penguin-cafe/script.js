// Put your real WhatsApp number here: country code + number, no + or spaces
const WHATSAPP_NUMBER = "91XXXXXXXXXX";

document.getElementById("yr").textContent = new Date().getFullYear();

/* ---------- Falling snow effect ---------- */
(function () {
  const canvas = document.getElementById("snow");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let w, h, flakes;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(90, Math.floor(w / 14));
    flakes = Array.from({ length: count }, () => makeFlake(true));
  }

  function makeFlake(randomY) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -10,
      r: 1.5 + Math.random() * 3.5,
      speed: 0.4 + Math.random() * 1.1,
      drift: Math.random() * Math.PI * 2
    };
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    flakes.forEach(function (f) {
      f.y += f.speed;
      f.drift += 0.01;
      f.x += Math.sin(f.drift) * 0.5;
      if (f.y > h + 10) Object.assign(f, makeFlake(false));
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
})();

/* ---------- Booking form ---------- */
const when = document.getElementById("when");
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
when.min = now.toISOString().slice(0, 16);

document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.replace(/\D/g, "");
  const guests = document.getElementById("guests").value;
  const slot = when.value;
  const err = document.getElementById("err");

  if (!name) return (err.textContent = "Enter your name.");
  if (phone.length !== 10) return (err.textContent = "Enter a 10-digit phone number.");
  if (!slot) return (err.textContent = "Choose a date and time.");
  err.textContent = "";

  const text =
    "Table booking%0AName: " + encodeURIComponent(name) +
    "%0APhone: " + phone +
    "%0AGuests: " + guests +
    "%0AWhen: " + encodeURIComponent(slot.replace("T", " "));
  window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text, "_blank", "noopener");
});