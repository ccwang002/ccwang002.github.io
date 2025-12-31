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
    updateGiscusTheme(colorScheme)
}

// Map system theme to a cycle of steps
const cycles = {
    dark: ["auto", "light", "dark"],  // auto (dark) → light → dark
    light: ["auto", "dark", "light"],  // auto (light) → dark → light
}

// Map the current color scheme to Giscus theme
const giscusThemes = {
    auto: prefersDark.matches ? "noborder_gray" : "noborder_light",
    light: "noborder_light",
    dark: "noborder_gray",
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
const loadGiscus = (colorScheme = getColorScheme()) => {
    const theme = giscusThemes[colorScheme]
    const section = document.querySelector('.giscus')
    if (section) {
        let s = document.createElement('script');
        s.src = 'https://giscus.app/client.js';
        s.setAttribute('data-repo', section.getAttribute('data-repo'));
        s.setAttribute('data-repo-id', section.getAttribute('data-repo-id'));
        s.setAttribute('data-category', section.getAttribute('data-category'));
        s.setAttribute('data-category-id', section.getAttribute('data-category-id'));
        s.setAttribute('data-mapping', section.getAttribute('data-mapping'));
        s.setAttribute('data-strict', section.getAttribute('data-strict'));
        s.setAttribute('data-reactions-enabled', section.getAttribute('data-reactions-enabled'));
        s.setAttribute('data-emit-metadata', section.getAttribute('data-emit-metadata'));
        s.setAttribute('data-input-position', section.getAttribute('data-input-position'));
        s.setAttribute('data-theme', theme);
        s.setAttribute('data-lang', section.getAttribute('data-lang'));
        s.setAttribute('data-loading', 'lazy');
        s.setAttribute('crossorigin', 'anonymous');
        s.setAttribute('async', '');  // optional
        section.appendChild(s);
    }
}

// Update Giscus theme when the blog theme changes
const updateGiscusTheme = (colorSheme = getColorScheme()) => {
    const theme = giscusThemes[colorSheme]
    const iframe = document.querySelector('iframe.giscus-frame')
    if (iframe) {
        const message = {
            setConfig: {
                theme: theme
            }
        }
        iframe.contentWindow.postMessage({giscus: message}, 'https://giscus.app')
    }
}

// Update Pygments state (the page theme is initialised inline, see page.html)
document.addEventListener("DOMContentLoaded", () => {
    setColorScheme()
    loadGiscus()  // load Giscus later to only set its theme once
})

