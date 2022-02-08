import React, { useEffect, useRef, useState } from "react";

import useEventListener from "@use-it/event-listener";

let LetterButton = ({ letter, key, padLeft }) => {
  let className =
    "h-20 w-20 m-1 px-5 border shadow-md border-black rounded-lg text-5xl focus:outline-none";
  if (padLeft) {
    className += " ml-5";
  }
  return (
    <button className={className} key={key}>
      {letter}
    </button>
  );
};

let Guess = ({ letters, solution }) => {
  // Track what indexes mark the start of words, not counting the first one
  let starts = {};
  let accum = 0;
  for (let word of solution) {
    accum += word.length;
    starts[accum] = true;
  }

  return (
    <div className="flex justify-center items-center py-2">
      {letters.map((letter, index) =>
        LetterButton({ letter, key: index, padLeft: starts[index] })
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
          <Guess letters={g} solution={solution} key={index} />
        ))}
        <Guess letters={guess} solution={solution} key="current" />
      </div>
    </div>
  );
}

export default App;
