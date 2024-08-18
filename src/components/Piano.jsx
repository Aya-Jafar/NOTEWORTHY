import React from "react";

function Piano() {
  // Define the number of keys and their layout
  const totalKeys = 61;

  // Define the layout of keys using keyboard letters
  const keyLetters = 'QWERTYUIOPASDFGHJKLZXCVBNM';

  // Generate the layout for keys based on the keyboard letters
  const keys = Array.from({ length: totalKeys }, (_, index) => {
    const letterIndex = index % keyLetters.length;
    return keyLetters[letterIndex];
  });

  return (
    <div className="pianoPage">
      <div className="piano">
        {keys.map((key, index) => {
          const isWhiteKey = index % 2 === 0;
          return (
            <div
              className={isWhiteKey ? "white-key" : "black-key"}
              key={index}
            >
              <p className={isWhiteKey ? "white-key-text" : "black-key-text"}>
                {key}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Piano;
