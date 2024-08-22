import React, { useState, useEffect } from "react";

function Piano() {
  const totalKeys = 61;

  const keyLetters =
    "QWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%^&*()-=_+[]{}|;:'\",.<>?";

  const BASE_FREQUENCY = 261.63; // Middle C
  const HALF_STEP = Math.pow(2, 1 / 12);

  const keys = Array.from(
    { length: totalKeys },
    (_, index) => keyLetters[index]
  );

  const frequencies = [];
  for (let i = 0; i < totalKeys; i++) {
    const frequency = BASE_FREQUENCY * Math.pow(HALF_STEP, i);
    frequencies.push(Math.round(frequency * 10) / 10);
  }

  // ADSR envelope parameters for piano-like sound
  const attackTime = 0.01; // Fast attack for immediate sound
  const decayTime = 0.2; // Short decay to reach sustain level
  const sustainLevel = 0.8; // High sustain while key is pressed
  const fastReleaseTime = 0.05; // Fast release when key is released
  const sustainPedalReleaseTime = 1.5; // Longer release when sustain pedal is engaged

  const [audioContext] = useState(
    () => new (window.AudioContext || window.AudioContext)()
  );
  const [activeKeys, setActiveKeys] = useState(Array(totalKeys).fill(false));
  const [keyDownMap, setKeyDownMap] = useState({});
  const [sustainPedal, setSustainPedal] = useState(false); // To manage sustain pedal state

  const playSound = (frequency) => {
    if (!isFinite(frequency) || frequency <= 0) {
      console.warn("Invalid frequency:", frequency);
      return () => {};
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    // Oscillator and Gain Nodes
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Low-pass filter to smoothen sound
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(1500, audioContext.currentTime);

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine"; // Sine wave for smoother sound
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    const now = audioContext.currentTime;

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attackTime); // Fast attack
    gainNode.gain.linearRampToValueAtTime(
      sustainLevel,
      now + attackTime + decayTime
    ); // Sustain level

    oscillator.start(now);

    return () => {
      const stopTime = audioContext.currentTime;
      const releaseTime = sustainPedal
        ? sustainPedalReleaseTime
        : fastReleaseTime;
      gainNode.gain.cancelScheduledValues(stopTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, stopTime);
      gainNode.gain.linearRampToValueAtTime(0, stopTime + releaseTime);
      oscillator.stop(stopTime + releaseTime);
    };
  };

  const handleKeyDown = (event) => {
    const key = event.key.toUpperCase();
    const index = keys.indexOf(key);

    if (index !== -1 && !keyDownMap[key]) {
      // Mark key as pressed
      setKeyDownMap((prevMap) => ({ ...prevMap, [key]: true }));

      const frequency = frequencies[index];
      const stopSound = playSound(frequency);

      setActiveKeys((prevState) => {
        const newState = [...prevState];
        newState[index] = true;
        return newState;
      });

      // Handle key release
      const handleKeyUp = () => {
        stopSound();
        setActiveKeys((prevState) => {
          const newState = [...prevState];
          newState[index] = false;
          return newState;
        });

        setKeyDownMap((prevMap) => ({ ...prevMap, [key]: false }));
        document.removeEventListener("keyup", handleKeyUp);
      };

      document.addEventListener("keyup", handleKeyUp);
    }

    // Handle sustain pedal (Shift key)
    if (event.key === "Shift") {
      setSustainPedal(true);
    }
  };

  const handleKeyUp = (event) => {
    // Release sustain pedal when Shift key is released
    if (event.key === "Shift") {
      setSustainPedal(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyDownMap, sustainPedal]);

  return (
    <div className="pianoPage">
      <div className="piano">
        {keys.map((key, index) => {
          const isWhiteKey = index % 2 === 0;
          const isActive = activeKeys[index];

          return (
            <div
              className={`${isWhiteKey ? "white-key" : "black-key"} ${
                isActive ? "active" : ""
              }`}
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
