chrome.storage.local.get("phishingData", (result) => {
    const data = result.phishingData;

    document.getElementById("title").textContent = "This email is a\nPHISHING email!";
    document.getElementById("title").classList.add("phishing");
    document.getElementById("description").textContent = data.description;

    document.getElementById("helpBtn").style.display = "block";
});
