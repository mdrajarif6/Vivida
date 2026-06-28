export async function generateMetaImage(prompt: string): Promise<string> {
  const response = await fetch('/resizzy/backend/api/meta_generate.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate image with Meta AI');
  }

  return data.image;
}

export async function applyMetaSAM(imageSrc: string): Promise<string> {
  const response = await fetch('/resizzy/backend/api/meta_sam.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: imageSrc })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to apply Meta SAM');
  }

  return data.image;
}
