const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");

// Initialize function
async function init() {
  let currentRow = 0;
  let currentGuess = "";
  let done = false;
  let isLoading = true;

  // Show loading spinner initially
  setLoading(isLoading);

  // Fetch the word of the day
  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const { word: wordRes } = await res.json();
  const word = wordRes.toUpperCase();
  const wordParts = word.split("");
  isLoading = false;
  setLoading(isLoading);

  // Adds a letter to the current guess
  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess = currentGuess.slice(0, -1) + letter;
    }
    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText = letter;
  }

  // Commits a guess
  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) return;

    isLoading = true;
    setLoading(isLoading);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const { validWord } = await res.json();
    isLoading = false;
    setLoading(isLoading);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);
    let allRight = true;

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        continue;
      } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
        allRight = false;
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        map[guessParts[i]]--;
      } else {
        allRight = false;
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }

    currentRow++;
    currentGuess = "";
    if (allRight) {
      alert("You win!");
      document.querySelector(".brand").classList.add("winner");
      done = true;
    } else if (currentRow === ROUNDS) {
      alert(`You lose, the word was ${word}`);
      done = true;
    }
  }

  // Deletes the last letter
  function backspace() {
    currentGuess = currentGuess.slice(0, -1);
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
  }

  // Marks word as invalid
  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
      setTimeout(() => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"), 10);
    }
  }

  // Adds event listeners
  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) return;

    const action = event.key;
    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    }
  });
}

// Checks if a character is a letter
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

// Sets loading spinner visibility
function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

// Creates a frequency map for letters in the word
function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    obj[array[i]] = (obj[array[i]] || 0) + 1;
  }
  return obj;
}

init();
