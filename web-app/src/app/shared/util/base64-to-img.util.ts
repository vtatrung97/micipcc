export function getImgFromBase64(string64: string, fileName: string, fileExtension: string): File {
  const trimmedString = string64.replace(/data:image\/(jpeg|png|jpg);base64,/, '');
  const imageContent = atob(trimmedString);
  const buffer = new ArrayBuffer(imageContent.length);
  const view = new Uint8Array(buffer);
  for (let n = 0; n < imageContent.length; n++) {
    view[n] = imageContent.charCodeAt(n);
  }
  const type = `image/${fileExtension}`;
  const blob = new Blob([buffer], { type });
  return new File([blob], `${fileName}.${fileExtension}`, { lastModified: new Date().getTime(), type });
}
