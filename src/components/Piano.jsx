import React, { useEffect, useState } from "react";
import * as Tone from "tone";
import notes, { urls } from "../stores";

function PianoSampler() {
  const [activeKeys, setActiveKeys] = useState({});

  useEffect(() => {
    // Initialize Tone.js sampler
    const sampler = new Tone.Sampler({
      urls: {
        ...urls,
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    const handleKeyPress = (e) => {
      const note = notes.find((n) => n.key === e.key);
      if (note) {
        setActiveKeys((prevKeys) => ({ ...prevKeys, [note.key]: true }));
        sampler.triggerAttackRelease(note.name, "8n");
      }
    };

    const handleKeyRelease = (e) => {
      const note = notes.find((n) => n.key === e.key);
      if (note) {
        setActiveKeys((prevKeys) => ({ ...prevKeys, [note.key]: false }));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyRelease);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyRelease);
    };
  }, []);

  const playNote = (note) => {
    Tone.start();
    const sampler = new Tone.Sampler({
      urls: {
        ...urls,
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();
    sampler.triggerAttackRelease(note, "8n");
  };

  //   TODO:
  //  1. Store the played keys and add a button to re-play them again
  //  2. Add a list of famous music to play automatically
  //  3. Seperate each octave (12 notes) to have differant colors when active
  //  4. Group 3s and 2s keys for each octave

  return (
    <div className="pianoPage">
      <div className="piano">
        {notes.map((note, index) => {
          const isWhiteKey = index % 2 === 0;
          const isActive = activeKeys[note.key];
          const octaveClass = `o${note.octave}`;
          const keyClass = isWhiteKey ? "white-key" : "black-key";

          const activeClass = isActive
            ? `${keyClass}-active-${octaveClass}`
            : keyClass;
          return (
            <div
              onClick={() => playNote(note.name)}
              className={`${isWhiteKey ? "white-key" : "black-key"} ${
                isActive ? activeClass : ""
              }`}
              key={index}
            >
              <p className={isWhiteKey ? "white-key-text" : "black-key-text"}>
                {note.key}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PianoSampler;
