/* ===== Settings: change your email here ===== */
const MY_EMAIL = "pt5115775@gmail.com";

/* ===== Page elements we need ===== */
const root = document.documentElement;
const themeBtn = document.getElementById("themeBtn");
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const form = document.getElementById("contactForm");
const statusMsg = document.getElementById("formStatus");

/**
 * setTheme(theme)
 * Applies "light" or "dark" to the page, updates the button label
 * and remembers the choice so it is still there on the next visit.
 */
function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  const next = theme === "dark" ? "light" : "dark";
  themeBtn.textContent = next === "dark" ? "Dark" : "Light";
  themeBtn.setAttribute("aria-label", "Switch to " + next + " theme");
  try { localStorage.setItem("theme", theme); } catch (e) { /* storage blocked: ignore */ }
}

/**
 * toggleTheme()
 * Runs when the theme button is clicked. Switches between light and dark.
 */
function toggleTheme() {
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
}

/**
 * toggleMenu(forceClose)
 * Opens or closes the navigation menu on small screens.
 * If forceClose is true, the menu is always closed.
 */
function toggleMenu(forceClose) {
  const open = forceClose ? false : !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Close" : "Menu";
}

/**
 * typeCode()
 * Types the code snippet in the hero card one character at a time.
 * If the visitor prefers reduced motion, the full text is shown at once.
 */
function typeCode() {
  const text =
`const priya = {
  role: "Aspiring web developer",
  studying: "BCA",
  skills: ["HTML", "CSS", "JavaScript", "MATLAB"],
  learning: "every day"
};`;
  const target = document.getElementById("typed");
  if (!target) return; // this page has no hero card
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.textContent = text;
    return;
  }
  let i = 0;
  const timer = setInterval(function () {
    target.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(timer);
  }, 45);
}

/**
 * animateSkills()
 * Fills each skill bar to the percentage in its data-level attribute
 * when the Skills section scrolls into view.
 */
function animateSkills() {
  const fills = document.querySelectorAll(".fill, .vbar");
  if (fills.length === 0) return; // this page has no skill bars
  const fillAll = function () {
    fills.forEach(function (f) {
      // graph bars grow upwards (height), progress bars grow sideways (width)
      if (f.classList.contains("vbar")) f.style.height = f.dataset.level + "%";
      else f.style.width = f.dataset.level + "%";
    });
  };
  if (!("IntersectionObserver" in window)) { fillAll(); return; }
  const observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { fillAll(); observer.disconnect(); }
  }, { threshold: 0.3 });
  observer.observe(document.getElementById("skills"));
}

/**
 * showError(field, message)
 * Shows (or clears, if message is empty) the error text under a field
 * and marks the field red.
 */
function showError(field, message) {
  document.getElementById(field.id + "Error").textContent = message;
  field.classList.toggle("invalid", message !== "");
}

/**
 * validateForm()
 * Checks name, email and message. Returns true only if all three are valid.
 */
function validateForm() {
  const name = form.elements["name"];
  const email = form.elements["email"];
  const message = form.elements["message"];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let ok = true;

  if (name.value.trim() === "") { showError(name, "Please enter your name."); ok = false; }
  else showError(name, "");

  if (!emailPattern.test(email.value.trim())) { showError(email, "Please enter a valid email address."); ok = false; }
  else showError(email, "");

  if (message.value.trim().length < 10) { showError(message, "Please write at least 10 characters."); ok = false; }
  else showError(message, "");

  return ok;
}

/**
 * handleSubmit(event)
 * Runs when the contact form is submitted. Stops the normal page reload,
 * validates the fields, then opens the visitor's email app with the
 * message already filled in, addressed to MY_EMAIL.
 */
function handleSubmit(event) {
  event.preventDefault();
  statusMsg.textContent = "";
  if (!validateForm()) return;

  const name = form.elements["name"].value.trim();
  const email = form.elements["email"].value.trim();
  const message = form.elements["message"].value.trim();

  const subject = "Portfolio message from " + name;
  const body = message + "\n\nFrom: " + name + " (" + email + ")";
  window.location.href =
    "mailto:" + MY_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

  statusMsg.textContent = "Opening your email app. Press send there to deliver the message.";
  form.reset();
}

/* ===== Start everything when the page loads ===== */
let savedTheme = "light";
try { savedTheme = localStorage.getItem("theme") || "light"; } catch (e) { /* ignore */ }
setTheme(savedTheme);

themeBtn.addEventListener("click", toggleTheme);
menuBtn.addEventListener("click", function () { toggleMenu(false); });
nav.addEventListener("click", function (e) { if (e.target.tagName === "A") toggleMenu(true); });
if (form) form.addEventListener("submit", handleSubmit);

document.getElementById("year").textContent = new Date().getFullYear();
const mailLink = document.getElementById("mailLink");
if (mailLink) {
  mailLink.href = "mailto:" + MY_EMAIL;
  mailLink.textContent = MY_EMAIL;
}

typeCode();
animateSkills();
