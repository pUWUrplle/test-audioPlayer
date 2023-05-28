import { useState, useRef, useEffect } from "react";
import "./audioPlayer.scss";
//there has to be a beter way to do this, surely :/
import playButton from "../svg/play.svg";
import progressBar from "../svg/progressBar.svg";
import progressThumb from "../svg/progressThumb.svg";
import volumeProgressBar from "../svg/volumeProgressBar.svg";
import volumeThumb from "../svg/volumeThumb.svg";
import progressBar2 from "../svg/progressBar2.svg";
import volumeProgressBar2 from "../svg/volumeProgressBar2.svg";
import linkSubmitButton from "../svg/linkSubmitButton.svg";
//tried using "currentColor" in svgs, but react or <img> tag interfears with it :/

const AudioPlayer = () => {
  const [link, setLink] = useState("https://c5.radioboss.fm:18084/stream");
  const [newLink, setNewLink] = useState(
    "https://d.lalal.ai/media/split/ebf6a7a0-2d14-4761-a898-3fc2100fd6a8/bcd093a8-7cf1-4178-a7b1-9a9d00a5625e/no_vocals"
  );
  const [playerState, setPlayerState] = useState(false); //false=paused, true=playing
  const [playerMinutes, setPlayerMinutes] = useState("00");
  const [playerSeconds, setPlayerSeconds] = useState("00");
  const [playerProgress, setPlayerProgress] = useState(0); //0->1;
  const [playerVolume, setPlayerVolume] = useState(1); // 0->1;
  const [uiState, setUiState] = useState("input"); //input, loading, player
  const audioRef = useRef();
  const changeLink = () => {
    if (validateLink(newLink)) {
      setLink(newLink);
      audioRef.current.load();
      audioRef.current.play();
      setPlayerState(true);
      updateTime();
      setUiState("player");
    } else {
      setPlayerState(false);
      console.log("link error");
    }
  };
  const validateLink = (utlToCheck) => {
    return fetch(utlToCheck, {})
      .then(
        (res) => res.ok && res.headers.get("content-type").startsWith("audio")
      )
      .catch((err) => console.log(err.message));
  };
  const playTrack = () => {
    if (playerState) {
      audioRef.current.pause();
      setPlayerState(false);
    } else {
      audioRef.current.play();
      setPlayerState(true);
    }
  };
  const updateTime = () => {
    var sec = Math.floor(audioRef.current.currentTime % 60);
    if (sec < 10) sec = "0" + sec;
    setPlayerSeconds(sec);
    var min = Math.floor(audioRef.current.currentTime / 60);
    if (min < 10) min = "0" + min;
    setPlayerMinutes(min);
    setPlayerProgress(audioRef.current.currentTime / audioRef.current.duration);
  };
  const setTime = (newTime) => {
    if (typeof newTime === "number" && newTime !== Infinity) {
      var sec = Math.floor(audioRef.current.currentTime % 60);
      if (sec < 10) sec = "0" + sec;
      setPlayerSeconds(sec);
      var min = Math.floor(audioRef.current.currentTime / 60);
      if (min < 10) min = "0" + min;
      setPlayerMinutes(min);
      setPlayerProgress(newTime / audioRef.current.duration);
      audioRef.current.currentTime = newTime;
    }
  };
  const updateVolume = () => {
    setPlayerVolume(audioRef.current.volume);
  };
  const setVolume = (newVolume) => {
    if (newVolume >= 0 && newVolume <= 1) {
      setPlayerVolume(newVolume);
      audioRef.current.volume = newVolume;
    }
  };
  const volumeBarClick = () => {
    var volumeSliderData = document
      .getElementById("volumeSlider")
      .getBoundingClientRect();
    var newPercent =
      (mousePos.x - volumeSliderData.left) / volumeSliderData.width;
    setVolume(newPercent);
  };
  const progressBarClick = () => {
    var progressBarData = document
      .getElementById("progressBar")
      .getBoundingClientRect();
    var newPercent =
      (mousePos.x - progressBarData.left) / progressBarData.width;
    setTime(newPercent * audioRef.current.duration);
  };
  const handleInputChange = (e) => setNewLink(e.target.value);
  const handleInputEnter = (e) => {
    if (e.keyCode === 13) {
      changeLink();
    }
  };

  const [mousePos, setMousePos] = useState({});

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div>
      <div style={{ display: uiState === "input" ? "inline" : "none" }}>
        <div className="insetText">Insert the link</div>
        <div className="linkInputRow">
          <input
            className="linkInputText"
            value={newLink}
            onChange={handleInputChange}
            onKeyUp={handleInputEnter}
            autoFocus
          />
          <img
            src={linkSubmitButton}
            className="linkSubmitButton"
            alt="linkSubmitButton"
            onClick={changeLink}
          />
        </div>
      </div>
      <div style={{ display: uiState === "player" ? "inline" : "none" }}>
        <div className="backButton" onClick={() => setUiState("input")}>
          ← Back
        </div>
        <audio
          id="player"
          onTimeUpdate={updateTime}
          onVolumeChange={updateVolume}
          ref={audioRef}
        >
          <source src={link} type="audio/ogg" />
          audio tag is not supported by browser
        </audio>
        <div className="audioControls">
          <div className="playButton" onClick={playTrack}>
            <img src={playButton} className="play" alt="play button" />
            <div />
          </div>
          <div
            id="progressBar"
            className="progressBar"
            onClick={progressBarClick}
          >
            <div style={{ width: 100 + "%" }}>
              <img
                src={progressBar}
                className="progressTrack"
                alt="progressTrack"
              />
              <img
                src={progressBar2}
                className="progressTrackComplete"
                alt="progressTrackComplete"
                style={{
                  width: playerProgress * 100 + "%"
                }}
              />
            </div>
            <img
              src={progressThumb}
              className="progressThumb"
              alt="progressThumb"
              style={{ left: playerProgress * 100 + "%" }}
            />
          </div>
          <div
            id="timerVolumeRow"
            className="timerVolumeRow"
            onClick={volumeBarClick}
          >
            <div className="timer">{playerMinutes + ":" + playerSeconds}</div>
            <div id="volumeSlider" className="volumeSlider">
              <div style={{ width: 100 + "%" }}>
                <img
                  src={volumeProgressBar}
                  className="progressTrack"
                  alt="progressTrack"
                />
                <img
                  src={volumeProgressBar2}
                  className="progressTrackComplete"
                  alt="progressTrackComplete"
                  style={{
                    width: playerVolume * 100 + "%"
                  }}
                />
              </div>
              <img
                src={volumeThumb}
                className="progressThumb"
                alt="progressThumb"
                style={{ left: playerVolume * 100 + "%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
