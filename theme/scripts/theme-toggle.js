const themeToggleBtn = document.querySelector(".theme-toggle");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const currentTheme = localStorage.getItem("theme");

if (currentTheme == "dark"
    || (currentTheme === null && prefersDarkScheme.matches)) {
    toggleTheme();
}

function updateUtterancesTheme(theme) {
    const iframe = document.querySelector('.utterances-frame');
    if (iframe) {
        const message = {
            type: 'set-theme',
            theme: theme
        };
        iframe.contentWindow.postMessage(message, 'https://utteranc.es');
    }
}

function toggleTheme() {
    if (document.body.classList.contains("dark-theme")) {
        document.body.classList.remove("dark-theme");
        themeToggleBtn.innerText = "🌙";
        updateUtterancesTheme("github-light");
        localStorage.setItem("theme", "light");
    } else {
        document.body.classList.add("dark-theme");
        themeToggleBtn.innerText = "☀️";
        updateUtterancesTheme("github-dark");
        localStorage.setItem("theme", "dark");
    }
}

themeToggleBtn.addEventListener("click", toggleTheme);
