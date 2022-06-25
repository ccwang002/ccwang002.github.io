/* Cycle color schemes (auto, light, dark)
 * Adapted from https://github.com/python/peps under MIT license
 * https://github.com/python/peps/blob/f1af4a7c886cb9fb4bbb536923cccfd3b555a2ab/pep_sphinx_extensions/pep_theme/static/colour_scheme.js
 */

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")

const getColorScheme = () => document.documentElement.dataset.color_scheme
const setColorScheme = (colorScheme = getColorScheme()) => {
    document.documentElement.dataset.color_scheme = colorScheme
    localStorage.setItem("color_scheme", colorScheme)
    setPygments(colorScheme)
    updateUtterancesTheme(colorScheme)
}

// Map system theme to a cycle of steps
const cycles = {
    dark: ["auto", "light", "dark"],  // auto (dark) → light → dark
    light: ["auto", "dark", "light"],  // auto (light) → dark → light
}

// Map the current color scheme to Utterances theme
const utterancesThemes = {
    auto: prefersDark.matches ? "github-dark" : "github-light",
    light: "github-light",
    dark: "github-dark",
}

const nextColorScheme = (colorScheme = getColorScheme()) => {
    const cycle = cycles[prefersDark.matches ? "dark" : "light"]
    return cycle[(cycle.indexOf(colorScheme) + 1) % cycle.length]
}

const setPygments = (colorScheme = getColorScheme()) => {
    const pygmentsDark = document.getElementById("pyg-dark")
    const pygmentsLight = document.getElementById("pyg-light")
    pygmentsDark.disabled = colorScheme === "light"
    pygmentsLight.disabled = colorScheme === "dark"
    pygmentsDark.media = colorScheme === "auto" ? "(prefers-color-scheme: dark)" : ""
    pygmentsLight.media = colorScheme === "auto" ? "(prefers-color-scheme: light)" : ""
}

// Dynamically load utterances based on the current theme
const loadUtterances = (colorScheme = getColorScheme()) => {
    const theme = utterancesThemes[colorScheme]
    const section = document.querySelector('.utterances')
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
const updateUtterancesTheme = (colorSheme = getColorScheme()) => {
    const theme = utterancesThemes[colorSheme]
    const iframe = document.querySelector('.utterances-frame')
    if (iframe) {
        const message = {
            type: 'set-theme',
            theme: theme
        }
        iframe.contentWindow.postMessage(message, 'https://utteranc.es')
    }
}

// Update Pygments state (the page theme is initialised inline, see page.html)
document.addEventListener("DOMContentLoaded", () => {
    setColorScheme()
    loadUtterances()  // load Utternances later to only set its theme once
})

