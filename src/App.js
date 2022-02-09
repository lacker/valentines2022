import React, { useEffect, useRef, useState } from "react";

import useEventListener from "@use-it/event-listener";

let WRONG_PLACE = "text-white bg-yellow";
let RIGHT_PLACE = "text-white bg-green";
let ALL_WRONG = "text-white bg-grey";
let PENDING = "";

let LetterButton = ({ letter, key, padLeft, style }) => {
  let className = "h-20 w-20 m-1 px-5 border border-black text-5xl";
  if (padLeft) {
    className += " ml-5";
  }
  className += " " + style;
  return (
    <button className={className} key={key}>
      {letter}
    </button>
  );
};

let Guess = ({ letters, solution, submitted }) => {
  // Track what indexes mark the start of words, not counting the first one
  let starts = {};
  let accum = 0;
  for (let word of solution) {
    accum += word.length;
    starts[accum] = true;
  }

  let flatSolution = [];
  let letterCount = {};
  for (let word of solution) {
    for (let letter of word) {
      flatSolution.push(letter);
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
  }

  let paddedLetters = letters.concat();
  while (paddedLetters.length < flatSolution.length) {
    paddedLetters.push(" ");
  }

  let hasError = false;
  let styles = [];
  for (let i = 0; i < letters.length; i++) {
    if (flatSolution[i] === letters[i]) {
      styles.push(RIGHT_PLACE);
      letterCount[letters[i]] -= 1;
    } else {
      styles.push(ALL_WRONG);
      hasError = true;
    }
  }
  for (let i = 0; i < letters.length; i++) {
    if ((letterCount[letters[i]] || 0) > 0 && styles[i] == ALL_WRONG) {
      console.log(letters[i], "has count", letterCount[letters[i]]);
      styles[i] = WRONG_PLACE;
      letterCount[letters[i]] -= 1;
    }
  }

  return (
    <div className="flex justify-center items-center py-2">
      {paddedLetters.map((letter, index) =>
        LetterButton({
          letter,
          key: index,
          style: submitted ? styles[index] : PENDING,
          padLeft: starts[index]
        })
      )}
    </div>
  );
};

function App() {
  // Just a list of letters
  let [guess, setGuess] = useState([]);

  // A list of lists of letters
  let [pastGuesses, setPastGuesses] = useState([]);

  // A list of words
  let [solution, setSolution] = useState(["TACO", "CAT"]);

  let solutionLength = 0;
  for (let word of solution) {
    solutionLength += word.length;
  }

  let guessIsFull = guess.length >= solutionLength;

  function handler({ key }) {
    let s = String(key);
    console.log("handling", s);
    if (s.length === 1 && s.match(/[a-z]/i) && !guessIsFull) {
      // They are adding a letter to the guess
      console.log("adding a letter to the guess");
      s = s.toUpperCase();
      setGuess(guess.concat([s]));
    } else if (s === "Enter" && guessIsFull) {
      // They are making a guess
      setPastGuesses(pastGuesses.concat([guess]));
      setGuess([]);
    } else if (s === "Backspace" && guess.length > 0) {
      setGuess(guess.slice(0, -1));
    }
  }

  useEventListener("keydown", handler);

  console.log("guess:", guess);

  return (
    <div style={{ height: "90vh" }}>
      <div className="h-full flex flex-col justify-start items-center">
        <div className="flex justify-center items-center py-5">
          <div className="text-xl">ELDANNADLE</div>
        </div>
        {pastGuesses.map((g, index) => (
          <Guess letters={g} solution={solution} key={index} submitted={true} />
        ))}
        <Guess
          letters={guess}
          solution={solution}
          key="current"
          submitted={false}
        />
      </div>
    </div>
  );
}

export default App;
