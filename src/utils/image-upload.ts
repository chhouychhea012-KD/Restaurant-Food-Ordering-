export function readImageFile(file: File, maxBytes = 3_000_000) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > maxBytes) {
    const limitMb = Math.round((maxBytes / 1_000_000) * 10) / 10;
    throw new Error(`Image must be ${limitMb} MB or smaller.`);
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read this image.'));
    reader.readAsDataURL(file);
  });
}