---
Title: Change the blog commenting system to utterances
Slug: blog-comment-utterances
Date: 2022-02-20
Tags: en,
Category: Coding
Lang: en
---

My blog is statically generated, so it needs an external service for commenting. I chose [Disqus] when I started my blog because it was a popular choice, and it is free and easy to setup. However, there's been increasing concern about its extensive user tracking, ads, and therefore a toll on the page loading performance[^disqus downsides]. Heck, I don't even load Disqus myself when I check my own blog:

<figure>
    <img src="{attach}pics/disqus_blocked_by_privacy_badger_screenshot.png">
    <figcaption>What my blog looks like from my end, where Disqus is blocked by <a href="https://privacybadger.org/Privacy">Privacy Badger</a> by default.</figcaption>
</figure>

[Disqus]: https://disqus.com/
[^disqus downsides]:
    There are already many summaries on these issues. For example: [*Replacing Disqus with  Comments*](https://donw.io/post/github-comments/) ([Discussion on Hacker News](https://news.ycombinator.com/item?id=14170041)) and [*Disqus, the dark commenting system*](https://supunkavinda.blog/disqus) ([Discussion on Hacker News](https://news.ycombinator.com/item?id=26033052)).

Recently, I was finally able to look into the alternatives to Disqus. I landed on [utterances], a commenting widget based on GitHub Issues. I like it for a few reasons:

- Free and open source
- No trackings and ads (for now at least)
- Comments are tied to the blog's code repository
- Moderation using existing GitHub tools/interface

[utterances]: https://utteranc.es/

Switch to a new commenting systems can be hard due to the loss of the old comments. But since there are only a total of 75 comments on my blog, I don't have a lot to miss :) I did back up the old comments because I enjoyed the discussions, and they are one of the main motiviations to keep me going. Disqus offers a way to export all the comments, and here is the frequency of all the comments over time:

<figure>
    <img src="{attach}pics/number_comments_per_post.png">
    <figcaption>Number of comments on my blog over time</figcaption>
</figure>

Since this post, my blog will be using the new utterances comment widget. For comparison, I attached a screenshot of the old interface using Disqus below:

<figure>
    <img src="{attach}pics/disqus_screenshot.png">
    <figcaption>Old commenting widget using Disqus on my blog.</figcaption>
</figure>
