const API = "https://reminiscent-jaguar-550.convex.site/api";

const seed = async () => {
  // 1. Upload cards
  const cards = [
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

  for (const c of cards) {
    await fetch(`${API}/hero/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c)
    });
  }

  // 2. Upload stats
  const stats = [
    { stat_value: "42", stat_label: "Research papers", is_visible: true, display_order: 1 },
    { stat_value: "3", stat_label: "Events", is_visible: true, display_order: 2 },
    { stat_value: "DMU alumni", stat_label: "Academic background", is_visible: true, display_order: 3 }
  ];

  for (const s of stats) {
    await fetch(`${API}/hero/stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s)
    });
  }
  console.log("Seeding complete!");
};

seed();
