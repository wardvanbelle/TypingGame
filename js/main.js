// define main variables
var timer_start = false
var language = "Dutch"
let NUM_WORDS = 15;
let TIME_LIMIT = 60;
let CURR_MODE = "time";
let WORDS_LIMIT = 25;
let QUOTE_TYPE = "all";
 
// selecting required elements
let timer_text = document.querySelector(".curr_time");
let accuracy_text = document.querySelector(".curr_accuracy");
let error_text = document.querySelector(".curr_errors");
let cpm_text = document.querySelector(".curr_cpm");
let wpm_text = document.querySelector(".curr_wpm");
let screen_text = document.querySelector(".text_screen");
let input_area = document.querySelector(".input_area");
let restart_btn = document.querySelector(".restart_btn");
let cpm_group = document.querySelector(".cpm");
let wpm_group = document.querySelector(".wpm");
let error_group = document.querySelector(".errors");
let accuracy_group = document.querySelector(".accuracy");
let mode_group = document.querySelector(".mode_group");
let mode_subgroups = document.querySelector(".mode_subgroups");
 
let timeLeft = TIME_LIMIT;
let wordsLeft = WORDS_LIMIT;
let quoteDone = false;
let timeElapsed = 0;
let total_errors = 0;
let errors = 0;
let accuracy = 0;
let characterTyped = 0;
let current_quote = "";
let quoteNo = 0;
let timer = null;

let quotes_array = [
    "Wees niet bang om te falen. Je hoeft het maar een keer bij het juiste eind te hebben.",
    "Ik kies nooit voor veilig en probeer altijd tegen de stroom in te gaan. Als ik iets bereikt heb, leg ik de lat nog iets hoger. Zo ben ik gekomen waar ik nu ben.",
    "Wie onvervangbaar wil zijn, moet zich blijvend onderscheiden.",
    "De enige wijsheid die echt telt is weten dat je niets weet.",
    "Als piraat bereik je meer dan wanneer je bij de marine gaat.",
    "Het woord crisis wordt in het Chinees met twee karakters geschreven. Het ene staat voor gevaar, het andere voor mogelijkheden.",
    "Krankzinnigheid is keer op keer hetzelfde doen en een ander resultaat verwachten. Als je uit bent op andere resultaten, doe dan niet weer hetzelfde.",
    "Een pessimist ziet in elke kans de moeilijkheden. Een optimist ziet in elke moeilijkheid de kansen."
];
let words_array = [];

// on load events
function InitGame() {

  input_area.focus();

  if (CURR_MODE === "quote") {
    updateQuote();
  } else if (CURR_MODE === "time") {
    updateWords(NUM_WORDS);
  } else {
    if (wordsLeft >= NUM_WORDS) {
      updateWords(NUM_WORDS);
    } else {
      updateWords(wordsLeft);
    };
    wordsLeft = wordsLeft - NUM_WORDS;
  };
}

window.addEventListener("load", InitGame, true);

async function TXTtoArray(url) {
  try {
    var output_array = [];
    output_array = fetch(url).then(response => response.text()).then(data => data.split("\n"));
    return output_array
  } catch (err) {
    console.error(err);
  }
}

// function to get n random elements from an array

function getRandom(arr, n) {
  var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
  if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

// Pick & show 20 random words
function updateWords(num_words) {
  TXTtoArray('https://wardvanbelle.github.io/TypingGame/Data/Words/' + language + '.txt').then(data => {
    const result = getRandom(data,num_words);
    screen_text.textContent = null;

    // join words to one sentence
    current_words = result.join(' ');

    // separate each character and make an element
    // out of each of them to individually style them
    current_words.split('').forEach(char => {
      const charSpan = document.createElement('span')
      charSpan.innerText = char
      screen_text.appendChild(charSpan)
    })
  });
}



// Pick & show random quote
function updateQuote() {

    screen_text.textContent = null;
    current_quote = quotes_array[Math.floor(Math.random()*quotes_array.length)];
   
    // separate each character and make an element
    // out of each of them to individually style them
    current_quote.split('').forEach(char => {
      const charSpan = document.createElement('span')
      charSpan.innerText = char
      screen_text.appendChild(charSpan)
    })
   
  }

function processCurrentText() {

    // if timer not started, start timer
    if (!timer_start) {
      if (CURR_MODE === "time") {
        timer = setInterval(countdownTimer, 1000);
      } else if (CURR_MODE === "words") {
        timer = setInterval(checkWords, 1000)
      } else {
        timer = setInterval(checkQuote, 1000)
      };

      timer_start = true
    }

    // get current input text and split it
    curr_input = input_area.value;
    curr_input_array = curr_input.split('');
   
    // increment total characters typed
    characterTyped++;
   
    errors = 0;
   
    textSpanArray = screen_text.querySelectorAll('span');
    textSpanArray.forEach((char, index) => {
      let typedChar = curr_input_array[index]

      // character not currently typed
      if (typedChar == null) {
        char.classList.remove('correct_char');
        char.classList.remove('incorrect_char');
        char.classList.remove('curr_char');
   
        // correct character
      } else if (typedChar === char.innerText) {
        char.classList.add('correct_char');
        char.classList.remove('incorrect_char');

        // move cursor
        textSpanArray[index].classList.add('curr_char');
        if (index > 0) {
          textSpanArray[index-1].classList.remove('curr_char');
        }
   
        // incorrect character
      } else {
        char.classList.add('incorrect_char');
        char.classList.remove('correct_char');

        // move cursor
        textSpanArray[index].classList.add('curr_char');
        if (index > 0) {
          textSpanArray[index-1].classList.remove('curr_char');
        }

        // increment number of errors
        errors++;
      }
    });
   
    // display the number of errors
    error_text.textContent = total_errors + errors;
   
    // update accuracy text
    let correctCharacters = (characterTyped - (total_errors + errors));
    let accuracyVal = ((correctCharacters / characterTyped) * 100);
    accuracy_text.textContent = Math.round(accuracyVal);
   
    // if current text is completely typed
    // irrespective of errors
    if (CURR_MODE === "quote") {
      if (curr_input.length == current_quote.length) {
        updateQuote();
     
        // update total errors
        total_errors += errors;
     
        // clear the input area
        input_area.value = "";

        // finish the game
        finishGame();
      }
    } else {
      if (curr_input.length == current_words.length) {
        if (wordsLeft > 0 && CURR_MODE === "words") {
          if (wordsLeft >= NUM_WORDS) {
            updateWords(NUM_WORDS);
          } else {
            updateWords(wordsLeft);
          }; 
        } else {
          updateWords(NUM_WORDS);
        };
        
     
        // update total errors
        total_errors += errors;
     
        // clear the input area
        input_area.value = "";

        // if curr_mode = words check if finished
        if (CURR_MODE === "words") {
          if (wordsLeft <= 0) {
            finishGame();
          };

          wordsLeft = wordsLeft - NUM_WORDS;
        }
      }
    };
    
}

function startGame() {

    resetValues();
   
    // clear old and start a new timer
    clearInterval(timer);
}
   
function resetValues() {
    timeLeft = TIME_LIMIT;
    wordsLeft = WORDS_LIMIT;
    quoteDone = false;
    timeElapsed = 0;
    errors = 0;
    total_errors = 0;
    accuracy = 0;
    characterTyped = 0;
    quoteNo = 0;
    input_area.disabled = false;
    timer_start = false;
    input_area.value = "";
    accuracy_text.textContent = 100;
    if (CURR_MODE !== "time") {
      timer_text.textContent = timeElapsed + "s";
    } else {
      timer_text.textContent = timeLeft + 's';
    };
    error_text.textContent = 0;
    cpm_group.style.display = "none";
    wpm_group.style.display = "none";
}

function countdownTimer() {
    if (timeLeft > 0) {
      // decrease the current time left
      timeLeft--;
   
      // increase the time elapsed
      timeElapsed++;
   
      // update the timer text
      timer_text.textContent = timeLeft + "s";
    }
    else {
      // finish the game
      finishGame();
    }
}

function checkWords() {
    // increase the time elapsed
    timeElapsed++;
 
    // update the timer text
    timer_text.textContent = timeElapsed + "s";
}

function checkQuote() {
  // increase the time elapsed
  timeElapsed++;
 
  // update the timer text
  timer_text.textContent = timeElapsed + "s";
}

function finishGame() {
    // stop the timer
    clearInterval(timer);
   
    // disable and clear the input area
    input_area.value = "";
    input_area.disabled = true;
   
    // show finishing text
    screen_text.textContent = "Click on restart to start a new game.";
   
    // calculate cpm and wpm
    cpm = Math.round(((characterTyped / timeElapsed) * 60));
    wpm = Math.round((((characterTyped / 5) / timeElapsed) * 60));
   
    // update cpm and wpm text
    cpm_text.textContent = cpm;
    wpm_text.textContent = wpm;
   
    // display the cpm and wpm
    cpm_group.style.display = "block";
    wpm_group.style.display = "block";
}

function restartGame() {
  clearInterval(timer);
  resetValues();
  InitGame();
}

// Automatic restart when typing tab

var restart_down = false

input_area.addEventListener("keydown", function(event) {
  // Number 9 is the "Tab" key on the keyboard
  if (event.keyCode === 9) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    restart_btn.classList.add('restart_selected');

    restart_down = true
  } else {
    if (restart_down && event.keyCode === 13) {
      event.preventDefault();
      restart_btn.click();
    }
    restart_btn.classList.remove('restart_selected');
  }
});

// Mode selection

mode_group.addEventListener('click', event => {
  if (event.target.className === 'mode') {

    // change visual look
    document.querySelectorAll('.mode').forEach(n => n.classList.remove('mode_selected'));
    event.target.classList.add('mode_selected'); 
    
    // change mode and according variables
    CURR_MODE =  event.target.innerText;

    if (CURR_MODE === "time") {
      NUM_WORDS = 15;
      TIME_LIMIT = 60;
    } else if (CURR_MODE === "words") {
      WORDS_LIMIT = 25;
    } else {
      QUOTE_TYPE = "all";
    };

    // change value of subbuttons based on mode
    document.querySelectorAll('.subgroup').forEach(n => n.classList.add('hidden'));
    document.querySelector(`.mode_${CURR_MODE}`).classList.remove('hidden');

    // restart game to apply all changes
    restartGame();
  }
});

mode_subgroups.addEventListener('click', event => {
  if (event.target.className === 'submode') {

    // change visual look
    document.querySelectorAll('.submode').forEach(n => n.classList.remove('mode_selected'));
    event.target.classList.add('mode_selected'); 
    
    // change according variables
    if (CURR_MODE === "time") {
      TIME_LIMIT = parseInt(event.target.innerText);
    } else if (CURR_MODE === "words") {
      WORDS_LIMIT = parseInt(event.target.innerText);
    } else {
      QUOTE_TYPE = event.target.innerText;
    };

    // restart game to apply all changes
    restartGame();
  }
});

