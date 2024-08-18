import React from "react";

function Piano() {
  // Define the number of keys and their layout
  const totalKeys = 61;

  // Generate boolean array representing the keys colors
  const keys = Array.from({ length: totalKeys }, (_, index) => index % 2 === 0);

  return (
    <div className="pianoPage">
      <div className="piano">
        {keys.map((key, index) => (
          <div className={key ? "white-key" : "black-key"} key={index}>
            <p className={key ? "white-key-text" : "black-key-text"}>HI</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Piano;
