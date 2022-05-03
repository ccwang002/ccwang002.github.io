---
Title: Project management lessons I learned during my PhD
Slug: project-management-lessons-during-phd
Date: 2022-05-05
Tags: en, zh
Category: misc
Lang: en
---

(Read this in [Mandarin][zh-post]; 閱讀[中文版][zh-post])

[en-post]: {filename}./things_phd.md
[zh-post]: {filename}./things_phd.zh.md

During my PhD in computational biology/bioinformatics, I had the opportunity to lead both independent and collaborative [research projects][google scholar], ranging from a few colleagues (less than 10) to a large list of people (100-ish people) across institutions.
I admit that my projects didn't cover the full spectrum of the possible teamwork styles.
Research can definitely be done by much fewer people, like [my wife's phenomenal work][clarice's paper], which is done by just her and the PI.
That said, I have experience of different collaboration styles due to the nature of the teamwork.
And a significant proportion of my time went in to project management.

[google scholar]: https://scholar.google.com/citations?user=-tdb3hcAAAAJ
[clarice's paper]: https://doi.org/10.1101/gr.276025.121

Thus, this post is to document my project management setup and lessons I learned.
Since my projects are mostly dry lab genomic data analysis in academia, I will be specific about the tools/services I use, which may not be useful to wet lab experiments, other research fields, or research in the private sector.
Anyway, my post won't be generic.

[TOC]

<!-- cSpell:words Toggl Todoist -->


## Manage the research project *agile-ish*
Research projects and startups share a lot of similarities, hence both can be benefited by an agile management.
Research and startups reward innovations and novel discoveries.
A clear end goal exists for both activities, being either a publication or a product.
And resources to accomplish the goal are limited (time, people, equipments, and money).

[Agile management][agile-software-dev] has been adopted ubiquitously by startups, particularly in software development.
Actually, the classic book on agile management for software development, [*The Mythical Man-Month*][man-month-book], greatly influenced me regarding how I planned and carried out research projects with large collaborations.
In my experience, relevant rules of an agile management include:

1. Make incremental and iterative builds
2. Keep short and direct feedback cycles
3. Implement easy (automatic) way to ensure things are going as expected

These rules can be applied to research well.
For rule #1, instead of targeting for publications or developing all the features of a tool (end goal), set up milestones and minimal viable products (MVP).
For example, to develop a tool that classify genomic variants, implement a *simpler* tool, a MVP, that checks only one basic rule of the classification (even a dummy rule) but it takes in the inputs and produces outputs in the desired format.
For analysis, subaims are good milestones because their outcomes are well defined and natural steps toward the completion of the aim.

For rule #2, set up regular feedback on the results, and the key here is short and direct.
No one likes a lengthy and boring meeting (conference call).
And there are many many meetings in a large collaboration on different things, so I want to save time on my analysis and tool development.
An asynchronous feedback (email or message) can save even more time when it make senses.
There are a few aspects of being direct: make direct/measurable suggestions and go to direct person involved.


If the feedback can be done automatically, say unit/behavior tests for code, or positive/negative control for analysis, it's better.



The rules above definitely are used widely outside of running an agile management.
They are reasonable and helpful guidelines.
So I don't believe there can only be agile or non-agile.
Hence the *agile-ish* style.
I just think that agile bundles the rules together as a framework and creates the mindset.
They are not fixed instructions.
We should feel free to relax some rules whichever fit the situation.

There are already good articles that talk about implementing agile management in an academic setting.
For example, [this blog post][pm-academia-101] compares the traditional (waterfall) project management with the agile project management in academia.
*Nature* publishes a few columns ([1][nature-six-tip], [2][nature-agile], [3][nature-scrum]) covering this subject from the broad concept to the actual methods of running agile methods (scrum).
Though I never tried to implement the fixed 2-week lab scrum for my research projects, as I find it very intrusive (might face huge pushbacks) and unnecessary (timeline is more flexible in academia).
More on this in the lesson I learned later.

I was aware of the inevitable complexity when the team grows and the increasing time spent on communications.
So I prepared for the complexity and beware of my role to keep everyone on the same page, rather than spending all of my time on analysis or things "productive".


[agile-software-dev]: https://en.wikipedia.org/wiki/Agile_software_development
[man-month-book]: https://en.wikipedia.org/wiki/The_Mythical_Man-Month
[pm-academia-101]: https://thenewpi.blogspot.com/2018/04/project-management-for-academia-101.html
[nature-six-tip]: https://www.nature.com/articles/d41586-018-07860-6
[nature-agile]: https://www.nature.com/articles/d41586-019-01184-9
[nature-scrum]: https://www.nature.com/articles/d41586-019-02620-6


### Lesson: Be flexible with principles; sharing the same vision is more important

Research is not like running a company.
It's not trying to be efficient, just *efficient enough*.



Stuff I want to talk about:

- Project management
    - Startup-ish agile
        - MVP
        - Incremental builds
    - Trello
- Wiki
    - Confluence
    - Notion
- Personal task management
    - Toggl
    - Todoist
- Dry lab notebook
    - Daily Markdown
    - Later notion
    - Periodic high level summary through slides
- Mentoring
    - one on one
    - page to keep track of their progress
- PhD toolchain/toolbox
    - Raw/large data on the lab cluster and cloud
    - Summarized local data as SummarizedExperiment objects
        - Single cell and imaging
    - Low level scripts on github
    - Job running notifications through slack
    - analysis scripts in the project folder
    - project folder
        - reproducible analysis code (r markdown; not r notebook)
        - why not workflow engines?
        - ripgrep
        - data processing and plotting

- Cloud based environment
    - R Studio Server in a Docker image
        - Cons
    - VSCode remote session
    - Shared cluster

- Things I would like to have
    - Automatic snapshot of working folder (ZFS)
    - Language agnostic SummarizedExperiment object (anndata)
        - Arrow



Notification through Slack

```bash
function slack-me --description "Slack myself a job's ended"
    # Capture the previous job status
    set -l prev_status $status

    if not set -q SLACK_BOT_TOKEN; or not set -q SLACK_BOT_CHANNEL
        echo -s "Error: Slack bot integration is not set up. " \
            "Configure the shell variables below:"\n \
            "  set -U SLACK_BOT_TOKEN 'xoxb-....'"\n \
            "  set -U SLACK_BOT_CHANNEL 'channel_id'" \
            1>&2
        return 1
    end

    /usr/bin/curl \
        -F token="$SLACK_BOT_TOKEN" \
        -F channel="$SLACK_BOT_CHANNEL" \
        -F text="A job on "(hostname)" has ended (exit $prev_status): $argv" \
        https://slack.com/api/chat.postMessage
end
```

```bash
cellranger xxx; slack-me '10x multiome cellranger complete'
```

https://fortelabs.co/blog/para/
https://dsebastien.net/blog/2022-04-03-25-years-of-personal-knowledge-management
https://news.ycombinator.com/item?id=30903940
