// define main variables
var timer_start = false

// define the time limit
let TIME_LIMIT = 60;
 
// selecting required elements
let timer_text = document.querySelector(".curr_time");
let accuracy_text = document.querySelector(".curr_accuracy");
let error_text = document.querySelector(".curr_errors");
let cpm_text = document.querySelector(".curr_cpm");
let wpm_text = document.querySelector(".curr_wpm");
let quote_text = document.querySelector(".quote");
let input_area = document.querySelector(".input_area");
let restart_btn = document.querySelector(".restart_btn");
let cpm_group = document.querySelector(".cpm");
let wpm_group = document.querySelector(".wpm");
let error_group = document.querySelector(".errors");
let accuracy_group = document.querySelector(".accuracy");
let mode_group = document.querySelector(".mode_group");
let mode_subgroups = document.querySelector(".mode_subgroups");
 
let timeLeft = TIME_LIMIT;
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

// on load events
function InitGame() {
  updateQuote();
  input_area.focus();
}

window.addEventListener("load", InitGame, true);



// Pick & show random quote
function updateQuote() {

    quote_text.textContent = null;
    current_quote = quotes_array[Math.floor(Math.random()*quotes_array.length)];
   
    // separate each character and make an element
    // out of each of them to individually style them
    current_quote.split('').forEach(char => {
      const charSpan = document.createElement('span')
      charSpan.innerText = char
      quote_text.appendChild(charSpan)
    })
   
  }

function processCurrentText() {

    // if timer not started, start timer
    if (!timer_start) {
      timer = setInterval(updateTimer, 1000);
      timer_start = true
    }

    // get current input text and split it
    curr_input = input_area.value;
    curr_input_array = curr_input.split('');
   
    // increment total characters typed
    characterTyped++;
   
    errors = 0;
   
    quoteSpanArray = quote_text.querySelectorAll('span');
    quoteSpanArray.forEach((char, index) => {
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
        quoteSpanArray[index].classList.add('curr_char');
        if (index > 0) {
          quoteSpanArray[index-1].classList.remove('curr_char');
        }
   
        // incorrect character
      } else {
        char.classList.add('incorrect_char');
        char.classList.remove('correct_char');

        // move cursor
        quoteSpanArray[index].classList.add('curr_char');
        if (index > 0) {
          quoteSpanArray[index-1].classList.remove('curr_char');
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
    if (curr_input.length == current_quote.length) {
      updateQuote();
   
      // update total errors
      total_errors += errors;
   
      // clear the input area
      input_area.value = "";
    }
}

function startGame() {

    resetValues();
   
    // clear old and start a new timer
    clearInterval(timer);
}
   
function resetValues() {
    timeLeft = TIME_LIMIT;
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
    timer_text.textContent = timeLeft + 's';
    error_text.textContent = 0;
    cpm_group.style.display = "none";
    wpm_group.style.display = "none";
}

function updateTimer() {
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

function finishGame() {
    // stop the timer
    clearInterval(timer);
   
    // disable and clear the input area
    input_area.value = "";
    input_area.disabled = true;
   
    // show finishing text
    quote_text.textContent = "Click on restart to start a new game.";
   
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

    // change value of subbuttons based on mode

  }
});

mode_subgroups.addEventListener('click', event => {
  if (event.target.className === 'submode') {

    // change visual look
    document.querySelectorAll('.submode').forEach(n => n.classList.remove('mode_selected'));
    event.target.classList.add('mode_selected'); 
    
    // change according variables
    TIME_LIMIT = parseInt(event.target.textContent);

    // restart game to apply all changes
    restartGame();
  }
});

