import React, { useEffect, useRef, useState } from 'react';
import './App.css'

const VideoPlayer = ({ videoPath }) => {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPaused, setWasPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const video = videoRef.current;

    const handlePlay = () => {
      setIsPaused(false);
    };

    const handlePause = () => {
      setIsPaused(true);
    };

    if (video) {
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleTimelineUpdate = (e) => {
    if (!isScrubbing) return;
    const video = videoRef.current;
    if (!video.paused) return; // Only update timeline position when scrubbing and video is paused
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
    e.currentTarget.style.setProperty("--progress-position", percent);
  };
  useEffect(() => {
    const video = videoRef.current;
    const updateTimeline = () => {
      const percent = (video.currentTime / video.duration) ;
      console.log("Current Time:", video.currentTime);
      console.log("Duration:", video.duration);
      console.log("Percent:", percent);
      const timeline = document.querySelector('.timeline');
      timeline.style.setProperty("--progress-position", percent );
    };
      
    const intervalId = setInterval(() => {
      if (!video.paused ) {
        updateTimeline();
      }
    }, 100); // Update timeline every 100 milliseconds
  
    return () => clearInterval(intervalId);
  }, [isScrubbing]); // Re-run effect when isScrubbing changes
  
//--------------------------------------------------------    
  const toggleScrubbing = (e) => {
    const video = videoRef.current;
    const rect = video.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
    setIsScrubbing(e.buttons === 1);
    if (isScrubbing) {
      setWasPaused(video.paused);
      video.pause();
    } else {
      video.currentTime = percent * video.duration;
      if (!wasPaused) video.play();
    }
    handleTimelineUpdate(e);
  };

  const handleSpeedChange = () => {
    let newSpeed = speed + 0.25;
    if (newSpeed > 2) {
      newSpeed = 0.25;
    }
    setSpeed(newSpeed);
  };
  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('00:00');

  useEffect(() => {
    const video = videoRef.current;

    const updateCurrentTime = () => {
      if (video) {
        setCurrentTime(formatDuration(video.currentTime));
        const percent = (video.currentTime / video.duration) * 100;
      }
    };

    const setLoadedData = () => {
      if (video) {
        setTotalTime(formatDuration(video.duration));
      }
    };

    if (video) {
      video.addEventListener('timeupdate', updateCurrentTime);
      video.addEventListener('loadeddata', setLoadedData);
    }

    return () => {
      if (video) {
        video.removeEventListener('timeupdate', updateCurrentTime);
        video.removeEventListener('loadeddata', setLoadedData);
      }
    };
  }, []);

  const formatDuration = (time) => {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    return `${hours === 0 ? '' : hours + ':'}${leadingZeroFormatter(minutes)}:${leadingZeroFormatter(seconds)}`;
  };

  const leadingZeroFormatter = (num) => {
    return num.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
  };

//------------------------------------------------------------------------------------------------------
const [volume, setVolume] = useState(1);
const [isMuted, setIsMuted] = useState(false);

useEffect(() => {
  const video = videoRef.current;

  const handlePlay = () => {
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleVolumeChange = () => {
    setVolume(video.volume);
    setIsMuted(video.muted);
  };

  if (video) {
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }
}, []);
const handleToggleMute = () => {
  const video = videoRef.current;
  video.muted = !video.muted;
};

const handleVolumeChange = (e) => {
  const video = videoRef.current;
  const newVolume = parseFloat(e.target.value);
  video.volume = newVolume;
};

//-----------------------------------------------------------------------------------
const videoContainerRef = useRef(null);
const [isTheaterMode, setIsTheaterMode] = useState(false);
const [isFullScreen, setIsFullScreen] = useState(false);
const [isMiniPlayer, setIsMiniPlayer] = useState(false);

useEffect(() => {
  const video = videoRef.current;
  const videoContainer = videoContainerRef.current;

  const handleFullScreenChange = () => {
    setIsFullScreen(!!document.fullscreenElement);
  };

  const handleEnterPictureInPicture = () => {
    setIsMiniPlayer(true);
  };

  const handleLeavePictureInPicture = () => {
    setIsMiniPlayer(false);
  };

  document.addEventListener('fullscreenchange', handleFullScreenChange);
  video.addEventListener('enterpictureinpicture', handleEnterPictureInPicture);
  video.addEventListener('leavepictureinpicture', handleLeavePictureInPicture);

  return () => {
    document.removeEventListener('fullscreenchange', handleFullScreenChange);
    video.removeEventListener('enterpictureinpicture', handleEnterPictureInPicture);
    video.removeEventListener('leavepictureinpicture', handleLeavePictureInPicture);
  };
}, []);


const toggleTheaterMode = () => {
  setIsTheaterMode(!isTheaterMode);
};

const toggleFullScreenMode = () => {
  const videoContainer = videoContainerRef.current;
  if (!isFullScreen) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const toggleMiniPlayerMode = () => {
  const video = videoRef.current;
  if (!isMiniPlayer) {
    video.requestPictureInPicture();
  } else {
    document.exitPictureInPicture();
  }
};
//--------------------------------------------------------------------------------
const handleTimelineClick = (e) => {
  const video = videoRef.current;
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;

  // Set the progress position
  e.currentTarget.style.setProperty("--progress-position", percent);

  // Set the timeline progress color to red
  e.currentTarget.style.setProperty("--timeline-progress-color", "red");

  // Update the video's current time based on the click position
  if (video) {
    video.currentTime = percent * video.duration;
  }
};


  return (
    <div
      className={`video-container ${isTheaterMode ? 'theater' : ''} ${
        isPaused ? 'paused' : ''
      }`}
      data-volume-level={isMuted || volume === 0 ? 'muted' : volume >= 0.5 ? 'high' : 'low'}
      ref={videoContainerRef}
    >
      <video ref={videoRef} src={videoPath} className="video-element">
        <track kind="captions" srclang="en" src="assets/subtitles.vtt" />
      </video>
      <img className="thumbnail-img" />
      <div className="video-controls-container">
        <div className="timeline-container"  onMouseMove={handleTimelineUpdate} onMouseDown={toggleScrubbing}>
          <div className="timeline" onClick={handleTimelineClick}>
            <div className="thumb-indicator"></div>
          </div>
        </div>
        <div className="controls">
          <button className="play-pause-btn" onClick={handlePlayPause}>
            <svg className="play-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
            <svg className="pause-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
            </svg>
          </button>
          <div className="volume-container">
            <button className="mute-btn" onClick={handleToggleMute}>
            <svg className="volume-high-icon" viewBox="0 0 24 24">
              {/* You can change the mute and unmute icons accordingly */}
              {isMuted || volume === 0 ? (
                <path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V4L7,9H3V5H5V4C5,4 4.92,3.96 4.83,3.9C4.75,3.85 4.65,3.82 4.54,3.82C4.43,3.82 4.27,3.89 4.27,4M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12Z" />
              ) : (
                <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
              )}
            </svg>
          </button>

          <input
            className="volume-slider"
            type="range"
            min="0"
            max="1"
            step="any"
            value={volume}
            onChange={handleVolumeChange}
          />
          </div>
          <div className="duration-container">
            <div className="current-time">{currentTime}</div>
            /
            <div className="total-time">{totalTime}</div>
          </div>
          <button className="speed-btn wide-btn" onClick={handleSpeedChange}>
            {speed}x
          </button>
          
          <button className="mini-player-btn" onClick={toggleMiniPlayerMode}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z" />
            </svg>
          </button>
          <button className="theater-btn" onClick={toggleTheaterMode}>
            <svg className="tall" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z" />
            </svg>
            <svg className="wide" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z" />
            </svg>
          </button>
          <button className="full-screen-btn" onClick={toggleFullScreenMode}>
            <svg className="open" viewBox="0 0 24 24">
              <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
            <svg className="close" viewBox="0 0 24 24">
              <path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
