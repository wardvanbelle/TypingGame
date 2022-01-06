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
let language_select = document.querySelector(".language_selection");
 
let timeLeft = TIME_LIMIT;
let wordsLeft = WORDS_LIMIT;
let quoteDone = false;
let timeElapsed = 0;
let total_errors = 0;
let errors = 0;
let accuracy = 0;
let characterTyped = 0;
let quoteNo = 0;
let timer = null;

//------------------
// ON LOAD EVENTS
//------------------

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

//--------------------
// UTILITY FUNCTIONS
//--------------------

language_select.addEventListener('change', function () {
  language = language_select.options[language_select.selectedIndex].value;
  restartGame();
});

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

//------------------------
// TEXT UPDATE + PROCESS
//------------------------

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
   
    TXTtoArray('https://wardvanbelle.github.io/TypingGame/Data/Quotes/' + language + '.txt').then(data => {
    current_quote = data[Math.floor(Math.random()*data.length)];
    screen_text.textContent = null;

    // separate each character and make an element
    // out of each of them to individually style them
    current_quote.split('').forEach(char => {
      const charSpan = document.createElement('span')
      charSpan.innerText = char
      screen_text.appendChild(charSpan)
    })
  });
}

function processCurrentText() {

    // if timer not started, start timer
    if (!timer_start) {
      if (CURR_MODE === "time") {
        timer = setInterval(countdownTimer, 1000);
      } else {
        timer = setInterval(countupTimer, 1000)
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

//---------------------
//    START + RESET
//---------------------

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

//----------------------
//        TIMERS
//---------------------

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

function countupTimer() {
    // increase the time elapsed
    timeElapsed++;
 
    // update the timer text
    timer_text.textContent = timeElapsed + "s";
}

//----------------------
// FINISH GAME
//----------------------

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

//--------------------------------------
// AUTO RESTART WHEN TAB + ENTER
//--------------------------------------

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

//------------------
// MODE SELECTION
//------------------

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

//------------------------
// STYLE SELECTION MENU
//------------------------

var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("selection_menu");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);