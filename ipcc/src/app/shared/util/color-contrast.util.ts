export function getContrastYIQ(hexColor: string){
  let r = parseInt(hexColor.substring(1,3),16);
  let g = parseInt(hexColor.substring(3,5),16);
  let b = parseInt(hexColor.substring(5,7),16);
  let yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}
