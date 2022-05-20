// Dynamically load utterances based on the current theme
function loadUtterances(theme) {
    const section = document.querySelector('.utterances');
    if (section) {
        let s = document.createElement('script');
        s.src = 'https://utteranc.es/client.js';
        s.setAttribute('repo', section.getAttribute('data-repo'));
        s.setAttribute('issue-term', section.getAttribute('data-issue-term'));
        s.setAttribute('theme', theme);
        s.setAttribute('crossorigin', 'anonymous');
        s.setAttribute('async', '');  // optional
        section.appendChild(s);
    }
}


// Update utterances theme when the blog theme changes
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


// Toggle the blog theme
function toggleTheme() {
    if (document.body.classList.contains("dark-theme")) {
        document.body.classList.remove("dark-theme");
        updateUtterancesTheme("github-light");
        localStorage.setItem("theme", "light");
    } else {
        document.body.classList.add("dark-theme");
        updateUtterancesTheme("github-dark");
        localStorage.setItem("theme", "dark");
    }
}


// Default blog theme is light, so only toggle the theme
// when a user prefers the dark theme or they previously chose so
const themeToggleBtn = document.querySelector(".theme-toggle");
const initialTheme = localStorage.getItem("theme");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

if (initialTheme == "dark"
    || (initialTheme === null && prefersDarkScheme.matches)) {
    toggleTheme();
    loadUtterances("github-dark");
} else {
    loadUtterances("github-light");
}
themeToggleBtn.addEventListener("click", toggleTheme);
