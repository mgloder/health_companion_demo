export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function chatEasing() {
  return (t) => {
    if (t < 0.5) {
      return 2 * t * t; // 缓入
    } else {
      return -1 + (4 - 2 * t) * t; // 缓出
    }
  };
}
