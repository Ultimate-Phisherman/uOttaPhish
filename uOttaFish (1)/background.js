chrome.runtime.onMessageExternal.addListener((msg) => {
    if (msg.type === "SET_PHISHING_DATA") {

        // If phishing is false or missing, do nothing
        if (!msg.data || msg.data.phishing !== true) {
            return;
        }

        // Store the data and open the popup
        chrome.storage.local.set({
            phishingData: msg.data
        }, () => {
            chrome.windows.create({
                url: "alert.html",
                type: "popup",
                width: 350,
                height: 400
            });
        });
    }
});
