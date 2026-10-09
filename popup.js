const checkButton = document.getElementById("checkNews");
const status = document.getElementById("status");
const result = document.getElementById("result");

checkButton.addEventListener("click", async () => {

    status.textContent = "Reading article...";
    result.className = "result";
    result.textContent = "";

    try {

        // --------------------------------------------------
        // Get the active browser tab
        // --------------------------------------------------

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab || !tab.id) {
            throw new Error("Could not access the current tab.");
        }


        // --------------------------------------------------
        // Extract article text from webpage
        // --------------------------------------------------

        const [{ result: articleData }] =
            await chrome.scripting.executeScript({

                target: {
                    tabId: tab.id
                },

                func: () => {

                    const article =
                        document.querySelector("article") ||
                        document.querySelector("main") ||
                        document.querySelector('[role="main"]');

                    const text = article
                        ? article.innerText
                        : document.body.innerText;

                    // Try to find a headline
                    const headlineElement =
                        document.querySelector("h1") ||
                        document.querySelector("h2") ||
                        document.querySelector("meta[property='og:title']");

                    let headline = "";

                    if (headlineElement) {

                        if (headlineElement.tagName === "META") {
                            headline =
                                headlineElement.getAttribute("content") || "";
                        } else {
                            headline =
                                headlineElement.innerText || "";
                        }
                    }

                    return {
                        headline: headline.trim(),
                        article_text: text.trim(),
                        url: window.location.href
                    };
                }
            });


        // --------------------------------------------------
        // Check article text
        // --------------------------------------------------

        if (
            !articleData ||
            !articleData.article_text ||
            articleData.article_text.trim().length === 0
        ) {

            status.textContent =
                "No article text found.";

            return;
        }


        // --------------------------------------------------
        // Show loading message
        // --------------------------------------------------

        status.textContent =
            "Searching live web sources...";


        // --------------------------------------------------
        // Send article to Flask verification API
        // --------------------------------------------------

        const response = await fetch(
            "http://127.0.0.1:5000/verify",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    headline: articleData.headline,
                    article_text: articleData.article_text,
                    url: articleData.url
                })
            }
        );


        const data = await response.json();


        // --------------------------------------------------
        // Handle API errors
        // --------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.error || "Verification failed."
            );
        }


        // --------------------------------------------------
        // Clear loading message
        // --------------------------------------------------

        status.textContent = "";

        result.className = "result";


        // --------------------------------------------------
        // Select result style
        // --------------------------------------------------

        if (
            data.verification_level === "strong" ||
            data.verification_level === "supported"
        ) {

            result.classList.add("real");

        } else if (
            data.verification_level === "contradicted"
        ) {

            result.classList.add("fake");

        } else {

            result.classList.add("limited");
        }


        // --------------------------------------------------
        // Create live source list
        // --------------------------------------------------

        let articlesHTML = "";


        if (
            data.live_articles &&
            data.live_articles.length > 0
        ) {

            articlesHTML = `
                <div class="live-news">

                    <div class="live-news-title">
                        Live Web Evidence
                    </div>

                    <div class="live-news-subtitle">
                        Current related coverage found online
                    </div>
            `;


            data.live_articles.forEach((article) => {

                articlesHTML += `
                    <div class="news-article">

                        <a
                            href="${article.url}"
                            target="_blank"
                        >
                            ${article.title || "Related news article"}
                        </a>

                        <div class="news-domain">
                            ${article.source || ""}
                        </div>

                    </div>
                `;
            });


            articlesHTML += `
                </div>
            `;

        } else {

            articlesHTML = `
                <div class="live-news no-evidence">

                    <div class="live-news-title">
                        Live Web Evidence
                    </div>

                    <div class="live-news-subtitle">
                        No related recent coverage was found.
                    </div>

                </div>
            `;
        }


        // --------------------------------------------------
        // Display verification result
        // --------------------------------------------------

        result.innerHTML = `

            <div class="prediction-text">
                ${data.prediction}
            </div>

            <div class="verification-status">
                ${data.verification_status}
            </div>

            <div class="confidence">
Live evidence strength: ${data.confidence}%
            </div>

            <div class="explanation">
                ${data.explanation}
            </div>

            <div class="search-query">
                <strong>Search used:</strong>
                ${data.search_query}
            </div>

            ${articlesHTML}

            <div class="disclaimer">
                This system analyzes currently available web evidence.
                It does not guarantee that a claim is true or false.
            </div>
        `;


    } catch (error) {

        console.error(
            "Verification error:",
            error
        );

        status.textContent =
            "Error: Could not verify this article.";

        result.className = "result";

        result.innerHTML = `
            <div class="error-message">
                Could not connect to the live verification service.
            </div>
        `;
    }

});