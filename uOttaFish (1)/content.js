function extractOutlookEmail() {
    if (!scanningEnabled)
        return;
    // Subject
    const subjectEl = document.querySelector('[id$="_SUBJECT"] .JdFsz');
    const subject = subjectEl ? subjectEl.innerText.trim() : null;

    // Sender email
    let senderEmail = null;
    const senderEl = document.querySelector('[data-automation-id="SenderPersona"]');
    if (senderEl) {
        const spans = senderEl.querySelectorAll("span");
        spans.forEach(s => {
            const text = s.innerText.trim();
            if (text.includes("@")) {
                senderEmail = text;
            }
        });
    }

    const { images, plainText } = extractImagesAndText();

    if (subject === null || plainText === null || images === null)
        return;

//${images.length ? images.map(url => `- ${url}`).join("\n") : "(none)"}

    const combinedPrompt = `
Send this to a phisherman to determine if it's phishing: 
Subject:
${subject}

Image Links:
"(none)"

Body:
${plainText}
`.trim();

    console.log(combinedPrompt);

    const formData = new FormData();

    formData.append("agent_name", "OrchestratorAgent");
    formData.append("prompt", combinedPrompt);

    fetch("http://localhost:8080/api/v2/tasks", {
        method: "POST",
        headers: {
            "Authorization": "Bearer token",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            agent_name: "OrchestratorAgent",
            prompt: combinedPrompt
        })
    });
}

function extractImagesAndText() {
    const container = document.querySelector('[data-test-id="mailMessageBodyContainer"]');
    let images = [];
    let plainText = "";

    if (!container) {
        return {
            images: null,
            plainText: null
        };
    }

    // Find ALL tbodys and trs under mailMessageBodyContainer
    const rows = container.querySelectorAll('tbody tr');

    rows.forEach(row => {
        // Extract images
        const imgEls = row.querySelectorAll('img');
        imgEls.forEach(img => {
            const src = img.src || img.getAttribute("data-src");
            if (src)
                images.push(src);
        });

        // Extract text
        const text = row.innerText.trim();
        if (text.length > 0) {
            plainText += text + "\n";
        }
    });

    plainText = plainText.trim();
    return {
        images,
        plainText
    };
}

let debounceTimer = null;

const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        extractOutlookEmail();
    }, 300); // wait 300ms after last mutation
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

//scanning checkbox
let scanningEnabled = true;

chrome.storage.sync.get(["enabled"], (result) => {
    scanningEnabled = result.enabled ?? false;
});

// Listen for changes from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TOGGLE_CHANGED") {
        scanningEnabled = message.enabled;
    }
});

function rollRarity() {
    const roll = Math.random() * 100;

    if (roll < 45)
        return "Very Common"; // 45%
    if (roll < 70)
        return "Common"; // 25%
    if (roll < 87)
        return "Uncommon"; // 17%
    if (roll < 97)
        return "Rare"; // 10%
    return "Very Rare"; // 3%
}
