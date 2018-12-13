---
Title: Make Firefox fullscreen borderless on macOS 
Slug: firefox-borderless-fullscreen-macos
Date: 2018-12-13
Tags: en
Category: Coding
---

Firefox fullscreen on macOS by default contains the address bar and the tab bar. Although it does not take up too much vertical space, while RStudio server

<div class="figure">
  <img src="{attach}pics/rstudio_fullscreen.png">
  <p class="caption"></p>
</div>

```css
#navigator-toolbox[inFullscreen] {
    height: 0.5rem;
    margin-bottom: -0.5rem;
    opacity: 0;
    overflow: hidden;
}

#navigator-toolbox[inFullscreen]:hover,
#navigator-toolbox[inFullscreen]:focus-within {
    /*
     * Add some padding between the navbar and the top screen edge 
     * to be more visible while the macOS hidden menu bar shows up. 
     * The macOS menubar will hide after a few seconds.
     */
    padding-top: 1rem;
    height: auto;
    margin-bottom: 0rem;
    opacity: 1;
    overflow: visible;
}
```

<div class="figure">
  <img src="{attach}pics/rstudio_fullscreen.modified.png">
</div>

<div class="figure">
  <video auto autoplay loop>
    <source src="{attach}pics/fullscreen_switch_tabs.webm" type="video/webm">
    <source src="{attach}pics/fullscreen_switch_tabs.mp4" type="video/mp4">
    Your browser doesn't support HTML5 video. You can still download the <a href="{attach}pics/fullscreen_switch_tabs.mp4">screencast</a> and view it locally.
  </video>
  <p class="caption">Switch tabs in the borderless fullscreen of Firefox.</p>
</div>

<div class="figure">
  <video controls>
    <source src="{attach}pics/fullscreen_focus.webm" type="video/webm">
    <source src="{attach}pics/fullscreen_focus.mp4" type="video/mp4">
    Your browser doesn't support HTML5 video. You can still download the <a href="{attach}pics/fullscreen_focus.mp4">screencast</a> and view it locally.
  </video>
  <p class="caption">Address bar is shown automatically when it is focused using shortkey.</p>
</div>

<div class="figure">
  <video controls>
    <source src="{attach}pics/fullscreen_hover_for_menubar.webm" type="video/webm">
    <source src="{attach}pics/fullscreen_hover_for_menubar.mp4" type="video/mp4">
    Your browser doesn't support HTML5 video. You can still download the <a href="{attach}pics/fullscreen_hover_for_menubar.mp4">screencast</a> and view it locally.
  </video>
</div>

### Notes for screen case encoding
[previous post][notebook-progressbar-post]

```bash
# VP9 (WEBM)
ffmpeg -i fullscreen_switch_tabs.mov \
    -vcodec libvpx-vp9 -b:v 200K \
    -pass 1 -an -r 24 -f webm /dev/null
ffmpeg -i fullscreen_switch_tabs.mov \
    -vcodec libvpx-vp9 -b:v 200K \
    -pass 2 -an -r 24 fullscreen_switch_tabs.webm

# H.264 (MP4)
ffmpeg -i fullscreen_switch_tabs.mov \
    -vcodec h264 \
    -strict -2 -crf 40 -preset slow -r 24 \
    fullscreen_switch_tabs.mp4
```

[notebook-progressbar-post]: {filename}../2016-03/0323_notebook_progressbar.md