// rem * 10px * 8/7, then convert back to rem
const increaseSize = (size: number) => Math.round(size * 10 * 8 / 7) / 10;

export default increaseSize;
