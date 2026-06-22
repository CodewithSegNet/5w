const API = "https://reminiscent-jaguar-550.convex.site/api";

const main = async () => {
  const res = await fetch(`${API}/auth/users`);
  const users = await res.json();
  console.log("Users:", users);
  
  for (const u of users) {
    if (u.full_name && (u.full_name.toLowerCase().includes('administrator') || u.full_name.toLowerCase().includes('test'))) {
      console.log(`Updating user ${u.email}...`);
      await fetch(`${API}/auth/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          full_name: "admin user",
          email: u.email
        })
      });
      console.log("Done updating!");
    }
  }
};

main();
