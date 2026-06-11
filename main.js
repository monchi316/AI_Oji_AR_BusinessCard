const intro = document.querySelector("#intro");
const startButton = document.querySelector("#startButton");
const statusLabel = document.querySelector("#status");
const scene = document.querySelector("#arScene");
const target = document.querySelector("#target");
const video = document.querySelector("#cardVideo");
const videoPlane = document.querySelector("#videoPlane");

const setStatus = (message) => {
  statusLabel.textContent = message;
};

const enableStart = () => {
  startButton.disabled = false;
  startButton.textContent = "開始";
  setStatus("開始してください");
};

if (scene.hasLoaded) {
  enableStart();
} else {
  scene.addEventListener("loaded", enableStart, { once: true });
}

const warmUpVideo = async () => {
  try {
    video.muted = true;
    video.playsInline = true;
    await video.play();
    video.pause();
    video.currentTime = 0;
  } catch (error) {
    console.warn("Video warm-up failed:", error);
  }
};

startButton.addEventListener("click", async () => {
  startButton.disabled = true;
  setStatus("カメラを起動中...");

  await warmUpVideo();

  try {
    await scene.systems["mindar-image-system"].start();
    intro.hidden = true;
    setStatus("名刺をカメラに映してください");
  } catch (error) {
    console.error(error);
    startButton.disabled = false;
    setStatus("カメラを起動できませんでした。Safariのカメラ許可を確認してください。");
  }
});

target.addEventListener("targetFound", async () => {
  videoPlane.setAttribute("visible", "true");
  setStatus("認識中");

  try {
    await video.play();
  } catch (error) {
    console.warn("Video play failed:", error);
  }
});

target.addEventListener("targetLost", () => {
  video.pause();
  videoPlane.setAttribute("visible", "false");
  setStatus("名刺をカメラに映してください");
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    video.pause();
  }
});
