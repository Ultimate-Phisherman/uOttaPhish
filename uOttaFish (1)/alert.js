let fishByRarity = {};

fetch(chrome.runtime.getURL("fish.txt"))
.then(res => res.text())
.then(text => {
    fishByRarity = parseFishFile(text);
    console.log("Fish loaded:", fishByRarity);
});

chrome.storage.local.get("phishingData", (result) => {
    const data = result.phishingData;

    document.getElementById("title").textContent = "This email is a\nPHISHING email!";
    document.getElementById("title").classList.add("phishing");
    document.getElementById("description").textContent = data.description;

    document.getElementById("helpBtn").style.display = "block";
});

function parseFishFile(text) {
    const lines = text.split("\n");

    const fishByRarity = {};
    let currentRarity = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line)
            return;

        // Section header like [Very Common]
        if (line.startsWith("[") && line.endsWith("]")) {
            currentRarity = line.slice(1, -1);
            fishByRarity[currentRarity] = [];
            return;
        }

        if (currentRarity) {
            fishByRarity[currentRarity].push(line);
        }
    });

    return fishByRarity;
}

function catchFish() {
    const result = rollCatchResult();

    if (result.type === "none") {
        return {
            fish: null,
            rarity: null
        };
    }

    const pool = fishByRarity[result.type];
    const fish = pool[Math.floor(Math.random() * pool.length)];

    return {
        fish,
        rarity: result.type
    };
}

function rollCatchResult() {
    const roll = Math.random() * 100;

    if (roll < 5)
        return {
            type: "none"
        }; // 5%
    if (roll < 50)
        return {
            type: "Very Common"
        }; // 45%
    if (roll < 75)
        return {
            type: "Common"
        }; // 25%
    if (roll < 90)
        return {
            type: "Uncommon"
        }; // 15%
    if (roll < 97)
        return {
            type: "Rare"
        }; // 7%
    return {
        type: "Very Rare"
    }; // 3%
}

//open link on button click and catch a fish, then store it.
helpBtn.addEventListener("click", () => {
    chrome.tabs.create({
        url: "https://www.surveymonkey.com/r/RTLS6ZN"
    });
    const { fish, rarity } = catchFish();

    if (!fish) {
        title.textContent = "No luck this time";
        description.textContent = "The fish got away… try again next time!";
    } else {
        saveCaughtFish(fish);

        title.textContent = "Fish Caught!";
        description.innerHTML = `
      You caught a <b>${fish}</b><br>
      <span style="font-size:12px;">Rarity: ${rarity}</span>
    `;
    }

    helpBtn.disabled = true;
    helpBtn.textContent = "Done";
});

function saveCaughtFish(fishName) {
    chrome.storage.local.get(["caughtFish"], (result) => {
        const caughtFish = result.caughtFish || {};
        caughtFish[fishName] = (caughtFish[fishName] || 0) + 1;
        chrome.storage.local.set({
            caughtFish
        });
    });
}
