/*
 * github actions needs this for some reason, maybe a filesystem thing, i don't know
 */
declare module '*.png' {
  export default string;
}
declare module '*.svg' {
  export default string;
}
