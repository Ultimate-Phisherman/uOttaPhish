const checkbox = document.getElementById("toggleCheckbox");

chrome.storage.sync.get(["enabled"], (result) => {
  checkbox.checked = result.enabled ?? false;
});

checkbox.addEventListener("change", () => {
  const enabled = checkbox.checked;

  chrome.storage.sync.set({ enabled });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "TOGGLE_CHANGED",
      enabled,
    });
  });
});

//leaderboard
// ---- STATIC DATABASE ----
const players = [
  "Anish",
  "Adam",
  "Seunghoon",
  "Charbel"
];

// Assign random points (1–5)
const leaderboardData = players.map(name => ({
  name,
  points: Math.floor(Math.random() * 5) + 1
}));

// Sort descending by points
leaderboardData.sort((a, b) => b.points - a.points);

// Render leaderboard
const leaderboardEl = document.getElementById("leaderboard");

leaderboardData.forEach(player => {
  const row = document.createElement("div");
  row.className = "entry";

  row.innerHTML = `
    <span>${player.name}</span>
    <span>${player.points}</span>
  `;

  leaderboardEl.appendChild(row);
});

/* ---------------- USER'S FISH ---------------- */

fetch(chrome.runtime.getURL("fish.txt"))
  .then(res => res.text())
  .then(text => {
    const fish = text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("["));

    simulateCaughtFish(fish);
  });

function simulateCaughtFish(fishPool) {
  const caught = [];

  const catches = Math.floor(Math.random() * 10) + 5; // 5–15 catches
  for (let i = 0; i < catches; i++) {
    const randomFish = fishPool[Math.floor(Math.random() * fishPool.length)];
    caught.push(randomFish);
  }

  const counts = {};
  caught.forEach(fish => {
    counts[fish] = (counts[fish] || 0) + 1;
  });

  renderCaughtFish(counts);
}

function renderCaughtFish(counts) {
  const fishList = document.getElementById("fishList");

  Object.entries(counts).forEach(([fish, count]) => {
    const row = document.createElement("div");
    row.className = "entry";
    row.innerHTML = `<span>${fish}</span><span>x${count}</span>`;
    fishList.appendChild(row);
  });
}

/* ---------------- TAB SWITCHING ---------------- */

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});