import React, { useEffect, useRef, useState } from "react";

import useEventListener from "@use-it/event-listener";

import anagrams from "./anagrams";
import allWords from "./all_words";

import backspace from "./backspace.png";

let WRONG_PLACE = "text-white bg-yellow border-yellow";
let RIGHT_PLACE = "text-white bg-green border-green";
let ALL_WRONG = "text-white bg-grey border-grey";
let PENDING = "bg-offwhite border-offwhite";

function randomAnagram() {
  let i = Math.floor(Math.random() * anagrams.length);
  return anagrams[i];
}

function findInvalidWord(guess, solution) {
  let rest = guess;
  for (let solutionWord of solution) {
    let guessLetters = rest.slice(0, solutionWord.length);
    rest = rest.slice(solutionWord.length);
    let word = guessLetters.join("");
    if (!allWords[word]) {
      return word;
    }
  }
}

let LetterDisplay = ({ letter, key, padLeft, style }) => {
  let className = "h-10 w-6 ml-1 border text-xl";
  if (padLeft) {
    className += " ml-3";
  }
  className += " " + style;
  return (
    <button className={className} key={key}>
      {letter}
    </button>
  );
};

let Guess = ({ letters, solution, styles, submitted }) => {
  // Track what indexes mark the start of words, not counting the first one
  let starts = {};
  let accum = 0;
  for (let word of solution) {
    accum += word.length;
    starts[accum] = true;
  }

  let paddedLetters = letters.concat();
  while (paddedLetters.length < accum) {
    paddedLetters.push(" ");
  }

  return (
    <div className="flex justify-center items-center py-2">
      {paddedLetters.map((letter, index) =>
        LetterDisplay({
          letter,
          key: index,
          style: submitted ? styles[index] : PENDING,
          padLeft: starts[index]
        })
      )}
    </div>
  );
};

// Button styles
let normal = "h-14 w-8 border mr-1 text-xl focus:outline-none";
let special = "h-14 w-12 px-4 border mr-1 text-xl focus:outline-none";

let LetterButton = ({ letter, callback, style }) => {
  let className = letter.match(/^[A-Z]$/) ? normal : special;
  className += " " + style;
  return (
    <button className={className} key={letter} onClick={() => callback(letter)}>
      {letter}
    </button>
  );
};

let ImageButton = ({ alt, image, onClick }) => {
  return (
    <button className={special + " " + PENDING} key={alt} onClick={onClick}>
      <img src={image} alt={alt} />
    </button>
  );
};

let Message = ({ message }) => {
  if (!message) {
    return null;
  }
  return (
    <div className="flex justify-center items-center py-3">
      <div className="text-lg">{message}</div>
    </div>
  );
};

function check(pastGuesses, guess, solution) {
  let answer = {
    pastStyles: [],
    greenLetters: {},
    yellowLetters: {},
    greyLetters: {},
    correct: false
  };

  let flatSolution = [];
  for (let word of solution) {
    for (let letter of word) {
      flatSolution.push(letter);
    }
  }

  for (let pastGuess of pastGuesses) {
    let letterCount = {};
    for (let letter of flatSolution) {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    let hasError = false;
    let styles = [];
    for (let i = 0; i < pastGuess.length; i++) {
      let letter = pastGuess[i];
      if (flatSolution[i] === letter) {
        styles.push(RIGHT_PLACE);
        letterCount[letter] -= 1;
        answer.greenLetters[letter] = true;
      } else {
        styles.push(ALL_WRONG);
        answer.greyLetters[letter] = true;
        hasError = true;
      }
    }

    if (!hasError) {
      answer.correct = true;
    }

    for (let i = 0; i < pastGuess.length; i++) {
      let letter = pastGuess[i];
      if ((letterCount[letter] || 0) > 0 && styles[i] == ALL_WRONG) {
        styles[i] = WRONG_PLACE;
        answer.yellowLetters[letter] = true;
        letterCount[letter] -= 1;
      }
    }

    answer.pastStyles.push(styles);
  }

  return answer;
}

function getStyle(checker, letter) {
  if (checker.greenLetters[letter]) {
    return RIGHT_PLACE;
  }
  if (checker.yellowLetters[letter]) {
    return WRONG_PLACE;
  }
  if (checker.greyLetters[letter]) {
    return ALL_WRONG;
  }
  return PENDING;
}

let Keyboard = ({ checker, callback }) => {
  let makeLetter = letter => (
    <LetterButton
      letter={letter}
      key={letter}
      callback={callback}
      style={getStyle(checker, letter)}
    />
  );

  return (
    <>
      <div className="flex justify-center items-center mb-1">
        {Array.from("QWERTYUIOP").map(makeLetter)}
      </div>
      <div className="flex justify-center items-center mb-1">
        {Array.from("ASDFGHJKL").map(makeLetter)}
      </div>
      <div className="flex justify-center items-center mb-3">
        <LetterButton
          letter="???"
          key="Enter"
          style={PENDING}
          callback={() => callback("Enter")}
        />
        {Array.from("ZXCVBNM").map(makeLetter)}

        <ImageButton
          alt="backspace"
          image={backspace}
          onClick={() => callback("Backspace")}
        />
      </div>
    </>
  );
};

function App() {
  // Just a list of letters
  let [guess, setGuess] = useState([]);

  // A list of lists of letters
  let [pastGuesses, setPastGuesses] = useState([]);

  // A list of words
  let [solution, setSolution] = useState([]);

  let [errorMessage, setErrorMessage] = useState(null);

  let solutionLength = 0;
  for (let word of solution) {
    solutionLength += word.length;
  }

  let guessIsFull = guess.length >= solutionLength;

  let checker = check(pastGuesses, guess, solution);

  function handler({ key }) {
    let s = String(key);
    console.log("handling", s);
    if (s.length === 1 && s.match(/[a-z]/i) && !guessIsFull) {
      // They are adding a letter to the guess
      console.log("adding a letter to the guess");
      s = s.toUpperCase();
      setGuess(guess.concat([s]));
    } else if (s === "Enter") {
      if (checker.correct) {
        newGame();
      } else if (guessIsFull) {
        // They are making a guess
        let word = findInvalidWord(guess, solution);
        if (!word) {
          setPastGuesses(pastGuesses.concat([guess]));
          setGuess([]);
        } else {
          setErrorMessage(word + " is not a word");
        }
      }
    } else if (s === "Backspace" && guess.length > 0) {
      setGuess(guess.slice(0, -1));
      setErrorMessage(null);
    }

    document.activeElement.blur();
  }

  useEventListener("keydown", handler);

  function newGame() {
    console.log("new game");
    setGuess([]);
    setPastGuesses([]);
    setSolution(randomAnagram());
    setErrorMessage(null);
  }

  if (solution.length === 0) {
    newGame();
    return <div>loading...</div>;
  }

  let callback = checker.correct
    ? () => {}
    : letter => handler({ key: letter });

  return (
    <div className="absolute inset-0">
      <div className="h-full flex flex-col justify-between">
        <div className="flex flex-col items-center">
          <Message message="ELDANNADLE" />
          {pastGuesses.map(
            (g, index) =>
              pastGuesses.length - index <= 5 && (
                <Guess
                  letters={g}
                  solution={solution}
                  styles={checker.pastStyles[index]}
                  key={index}
                  submitted={true}
                />
              )
          )}
          {checker.correct ? (
            <>
              <button className="m-1 p-2 border text-lg" onClick={newGame}>
                Nice! Play Again
              </button>
            </>
          ) : (
            <Guess
              letters={guess}
              solution={solution}
              key="current"
              submitted={false}
            />
          )}
          <Message message={errorMessage} />
        </div>
        <div className="flex flex-col justify-end items-center">
          <Keyboard checker={checker} callback={callback} />
        </div>
      </div>
    </div>
  );
}

export default App;
