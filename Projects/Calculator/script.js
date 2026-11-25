/* =====================================================
   Simple Calculator – script.js
   ===================================================== */

// ---------- State ----------
// current   : the number being typed (as a string, so "0." and "5.0" work)
// previous  : the first operand, stored after an operator is pressed
// operator  : the pending operator (+, -, *, /) or null
// justEvaluated : true right after "=", so the next digit starts a new number
const state = {
  current: "0",
  previous: null,
  operator: null,
  justEvaluated: false,
  error: false,
};

// ---------- DOM references ----------
const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");
const keysEl = document.querySelector(".keys");

// Symbols shown to the user for each internal operator
const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

/**
 * updateDisplay()
 * Writes the current state to the screen:
 * the big line shows the current number (or an error),
 * the small line shows the pending expression, e.g. "12 ×".
 */
function updateDisplay() {
  resultEl.textContent = state.current;
  resultEl.classList.toggle("error", state.error);
  expressionEl.textContent =
    state.previous !== null && state.operator
      ? `${state.previous} ${SYMBOLS[state.operator]}`
      : "";
}

/**
 * resetAll()
 * Clears everything and returns the calculator to its starting state.
 * Also used to recover after an error such as division by zero.
 */
function resetAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.justEvaluated = false;
  state.error = false;
}

/**
 * showError(message)
 * Displays a friendly error message and clears the pending operation.
 * The next key press will start fresh (see guardError()).
 */
function showError(message) {
  resetAll();
  state.current = message;
  state.error = true;
}

/**
 * guardError()
 * If an error is currently shown, reset before handling the next key.
 * This stops the user from typing digits onto "Cannot divide by 0".
 */
function guardError() {
  if (state.error) resetAll();
}

/**
 * formatNumber(n)
 * Rounds floating-point noise (0.1 + 0.2 = 0.30000000000000004)
 * and returns the result as a string. Very large/small numbers
 * are shown in exponential form so they fit on the display.
 */
function formatNumber(n) {
  const rounded = parseFloat(n.toPrecision(12)); // trims float errors
  const text = String(rounded);
  return text.length > 14 ? rounded.toExponential(6) : text;
}

/**
 * calculate(a, b, op)
 * Performs one arithmetic operation and returns the result.
 * Returns null if the operation is invalid (division by zero).
 */
function calculate(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/":
      if (b === 0) return null; // invalid: cannot divide by zero
      return a / b;
    default:  return b;
  }
}

/**
 * inputDigit(d)
 * Appends a digit to the number being typed.
 * Replaces a lone "0" so we don't get numbers like "007".
 * d can also be "00" (the double-zero key).
 */
function inputDigit(d) {
  guardError();
  if (state.justEvaluated) {
    // Typing after "=" starts a brand-new calculation
    resetAll();
  }
  if (state.current.replace(/[-.]/g, "").length >= 12) return; // limit length
  // A lone "0" is replaced by the new digit; "00" on a lone "0" does nothing
  if (state.current === "0") {
    state.current = d === "00" ? "0" : d;
  } else {
    state.current += d;
  }
}

/**
 * inputDecimal()
 * Adds a decimal point, but only one per number.
 */
function inputDecimal() {
  guardError();
  if (state.justEvaluated) resetAll();
  if (!state.current.includes(".")) state.current += ".";
}

/**
 * chooseOperator(op)
 * Called when +, −, ×, ÷ is pressed.
 * If an operation is already pending, it is evaluated first,
 * so "2 + 3 +" immediately shows 5 (chained calculations).
 */
function chooseOperator(op) {
  guardError();

  // If the user already typed a second number, finish the pending operation
  if (state.operator && !state.justEvaluated && state.previous !== null) {
    const answer = calculate(
      parseFloat(state.previous),
      parseFloat(state.current),
      state.operator
    );
    if (answer === null) return showError("Cannot divide by 0");
    state.previous = formatNumber(answer);
  } else {
    state.previous = state.current;
  }

  state.operator = op;
  state.current = "0";
  state.justEvaluated = false;
}

/**
 * evaluate()
 * Called when "=" is pressed. Computes previous <operator> current
 * and shows the answer. Does nothing if there is no pending operator.
 */
function evaluate() {
  guardError();
  if (!state.operator || state.previous === null) return;

  const answer = calculate(
    parseFloat(state.previous),
    parseFloat(state.current),
    state.operator
  );

  // Handle invalid input gracefully instead of showing Infinity/NaN
  if (answer === null || !Number.isFinite(answer)) {
    return showError("Cannot divide by 0");
  }

  state.current = formatNumber(answer);
  state.previous = null;
  state.operator = null;
  state.justEvaluated = true;
}

/**
 * deleteLast()
 * Backspace: removes the last typed character.
 * Falls back to "0" when nothing is left.
 */
function deleteLast() {
  guardError();
  if (state.justEvaluated) return; // don't edit a finished answer
  state.current =
    state.current.length > 1 && state.current !== "-0"
      ? state.current.slice(0, -1)
      : "0";
}

/**
 * percent()
 * Converts the current number to a percentage (divides by 100).
 */
function percent() {
  guardError();
  state.current = formatNumber(parseFloat(state.current) / 100);
}

// ---------- Event handling ----------

/**
 * handleAction(action, value)
 * Central dispatcher: routes a button press (or key press)
 * to the correct function, then refreshes the display.
 */
function handleAction(action, value) {
  switch (action) {
    case "digit":    inputDigit(value);      break;
    case "decimal":  inputDecimal();         break;
    case "operator": chooseOperator(value);  break;
    case "equals":   evaluate();             break;
    case "clear":    resetAll();             break;
    case "delete":   deleteLast();           break;
    case "percent":  percent();              break;
  }
  updateDisplay();
}

// Mouse / touch: one listener on the grid handles every button
keysEl.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;
  handleAction(btn.dataset.action, btn.dataset.value);
});

// Keyboard support: digits, + - * /, Enter, Backspace, Escape, ., %
document.addEventListener("keydown", (event) => {
  const k = event.key;
  if (/^[0-9]$/.test(k))            handleAction("digit", k);
  else if (["+", "-", "*", "/"].includes(k)) {
    event.preventDefault();         // stop "/" opening quick-find in Firefox
    handleAction("operator", k);
  }
  else if (k === "." )              handleAction("decimal");
  else if (k === "Enter" || k === "=") {
    event.preventDefault();
    handleAction("equals");
  }
  else if (k === "Backspace")       handleAction("delete");
  else if (k === "Escape")          handleAction("clear");
  else if (k === "%")               handleAction("percent");
});

// Draw the initial "0"
updateDisplay();