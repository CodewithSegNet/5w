const fs = require('fs');

const API = "https://reminiscent-jaguar-550.convex.site/api";

const uploadImage = async (filePath) => {
  const content = fs.readFileSync(filePath);
  
  // 1. Get upload URL
  const res1 = await fetch(`${API}/upload-url`, { method: "POST" });
  const { uploadUrl } = await res1.json();
  
  // 2. Upload to Convex Storage
  const res2 = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" }, // approx
    body: content
  });
  const { storageId } = await res2.json();
  
  // 3. We can just hit /api/save-image with no recordId to get the public URL back!
  const res3 = await fetch(`${API}/save-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storageId })
  });
  const data = await res3.json();
  return data.image_url;
};

const main = async () => {
  // Get existing hero cards
  const res = await fetch(`${API}/hero/cards`);
  const cards = await res.json();
  
  for (const c of cards) {
    if (c.image_url && c.image_url.startsWith('images/')) {
      console.log(`Uploading ${c.image_url}...`);
      try {
        const publicUrl = await uploadImage(c.image_url);
        console.log(`Uploaded! New URL: ${publicUrl}`);
        
        // Update in DB
        await fetch(`${API}/hero/cards/${c.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: publicUrl })
        });
      } catch (e) {
        console.error("Failed to upload", c.image_url, e);
      }
    }
  }
  console.log("Done uploading images!");
};

main();
