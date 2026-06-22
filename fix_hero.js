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
  console.log("Fetching existing cards...");
  const res = await fetch(`${API}/hero/cards`);
  const cards = await res.json();
  
  console.log("Deleting existing cards...");
  for (const c of cards) {
    await fetch(`${API}/hero/cards/${c.id}`, { method: "DELETE" });
  }

  const rawCards = [
    {
      title: "Case Studies",
      quote: "We have supported the launch of slow-fashion wellness brands such as Legendry Living and partnered with a luxury retailer to deliver data-driven, sustainability focused in-store events, combining research and project management expertise with commercial insight",
      image_url: "images/DSC_0014.JPG",
      is_visible: true,
      display_order: 1
    },
    {
      title: "",
      quote: "We have extensive experience working alongside fashion models, designers, buyers, C-Suite executives, researchers, attending industry events in the UK and Europe to continue building our networks and industry knowledge",
      image_url: "images/secondsimag.jpeg",
      is_visible: true,
      display_order: 2
    },
    {
      title: "Our research specialists",
      quote: "We are passionate about diverse areas of the fashion business and are always ready to educate and learn from others",
      image_url: "images/third.png",
      is_visible: true,
      display_order: 3
    },
    {
      title: "Events Agency",
      quote: "We create spaces for the next generation to discuss industry topics and learn about conscious consumption",
      image_url: "images/four.jpeg",
      is_visible: true,
      display_order: 4
    }
  ];

  console.log("Uploading images and creating new cards...");
  for (const c of rawCards) {
    const publicUrl = await uploadImage(c.image_url);
    console.log(`Uploaded ${c.image_url} -> ${publicUrl}`);
    c.image_url = publicUrl;
    
    await fetch(`${API}/hero/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c)
    });
  }
  
  console.log("All done!");
};

main();
