function canvasBlob(canvas:HTMLCanvasElement, type:string, quality:number){
  return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file:File){
  if (!file.type.startsWith('image/')) throw new Error('Choose an image.');
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read that image.'));
      el.src = url;
    });
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
    canvas.height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not prepare that image.');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    let quality = 0.86;
    let blob = await canvasBlob(canvas, 'image/jpeg', quality);
    while (blob && blob.size > 1200000 && quality > 0.5) {
      quality = Math.round((quality - 0.12) * 100) / 100;
      blob = await canvasBlob(canvas, 'image/jpeg', quality);
    }
    if (!blob) throw new Error('Could not prepare that image.');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
