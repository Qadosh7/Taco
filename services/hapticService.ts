
export const HapticService = {
  vibrateCard: () => {
    if ("vibrate" in navigator) navigator.vibrate(40);
  },
  vibrateTurn: () => {
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
  },
  vibrateAction: () => {
    if ("vibrate" in navigator) navigator.vibrate(10);
  },
  vibrateLoss: () => {
    if ("vibrate" in navigator) navigator.vibrate([300, 100, 300]);
  },
  vibrateJoin: () => {
    if ("vibrate" in navigator) navigator.vibrate([50, 30, 50]);
  }
};
