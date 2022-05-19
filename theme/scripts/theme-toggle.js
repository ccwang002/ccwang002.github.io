const themeToggleBtn = document.querySelector(".theme-toggle");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const currentTheme = localStorage.getItem("theme");

if (currentTheme == "dark"
    || (currentTheme === null && prefersDarkScheme.matches)) {
    toggleTheme();
}

function toggleTheme() {
    if (document.body.classList.contains("dark-theme")) {
        document.body.classList.remove("dark-theme");
        themeToggleBtn.innerText = "🌙";
        localStorage.setItem("theme", "light");
    } else {
        document.body.classList.add("dark-theme");
        themeToggleBtn.innerText = "☀️";
        localStorage.setItem("theme", "dark");
    }
}
themeToggleBtn.addEventListener("click", toggleTheme);
