---
Title: Project management lessons I learned during my PhD
Slug: project-management-during-phd
Date: 2022-10-01
Tags: en, zh
Category: misc
Lang: en
Status: draft
---

(Read this in [Mandarin][zh-post]; 閱讀[中文版][zh-post])

[en-post]: {filename}./things_phd.md
[zh-post]: {filename}./things_phd.zh.md

Modern science is often a teamwork.

I've learned that an effective teamwork requires non-trivial time and effort, however, traditional academic training does not emphasize on how to collaborate *effectively*.
The training I received generally taught me how to think critically and how to apply my knowledge to problem-solving.
I only learned how to teamwork professionally through experience.
And experience-based learning is limiting when the team grows and a new style of teamwork is required.

During my PhD, I had the opportunity to lead [some collaborative projects][google scholar] in computational biology/bioinformatics.
The scale of my project can range from a few close colleagues (less than 10) to a long list of people (100-ish) across institutions.

The style of teamwork is very different for a project of just three people sitting in adjacent cubicles versus a project of a few teams of people in different states who I might never meet in person.
When the team grows, the cost and overhead for (mis)communications grow *exponentially*.
As a result, a significant proportion of my time and effort during PhD went in to project management and learning it from my mistakes.

Thus, I decided to write down my lessons and setup for project management.
This post will focus on the challenges when we have a large team of people contribute to a research project together.
My projects are mostly about genomic data analysis in academia, so my experience is bespoke to this field and mostly dry lab; YMMV.

Before we jump in, let me put some disclaimers upfront.
My experience only covers a small aspect of research and teamwork.
I never run a lab, never do hybrid experiments and analysis on my own, and research in the private sector probably works out quite differently.
I will continue to learn and find a better solution.

[google scholar]: https://scholar.google.com/citations?user=-tdb3hcAAAAJ

[TOC]

<!-- cSpell:words Toggl Todoist xoxb -->


## Go agile
Managing a research project is similar to running a startup in many ways.
Both research and startups reward innovations and novel discoveries.
A clear end goal exists, being a publication or a product.
And resources to accomplish the goal are limited (e.g., time, people, equipments, and fundings).

[Agile management][agile-software-dev] has been used by startups and software development ubiquitously.
In fact, in my large collaboration projects, I tried to apply what I learned from a classic book on agile management for software development, [*The Mythical Man-Month*][man-month-book].

I think these agile principles are helpful to research:

1. Make incremental and iterative builds
2. Keep short and direct feedback cycles
3. Implement easy or automatic way to ensure things are going as expected

For incremental/iterative builds, instead of planning all the way to a publication or the full features of a tool, set up milestones and minimal viable products (MVP) along the way.

For example, to develop a tool that classifies genomic variants, implement a *simpler* tool.
The MVP can just execute one simple rule of the classification (even a dummy rule) but it takes in the inputs and produces outputs in the desired format.
To complete an analysis project, set sub-aims or tasks in each sub-aim as milestones because their outcomes are well-defined, and sub-aims and tasks are the natural steps toward the completion of the aim and the project eventually.

To have an effective feedback cycles, make the feedback short and direct.
Everyone hates a lengthy meeting (conference call), and these meetings don't scale well with the increasing size and scope of the project.
Often a meeting is not even required for a short feedback.
A message or an email works much better since they are asynchronous both time and space wise.
To make a direct feedback, go to the person in action directly and provide measurable suggestions.
Use automatic reminders to periodically follow up on the progress.

On the other hand, to achieve short and direct feedback cycles, we save our effort over simple things.
Say, unit or behavior tests are great for tool development and positive or negative controls for analysis.

<!-- Start here -->
Here are some great articles about agile management in an academic setting.
For example, [this blog post][pm-academia-101] compares the traditional (waterfall) project management with the agile project management in academia.
*Nature* publishes a few columns ([1][nature-six-tip], [2][nature-agile], [3][nature-scrum]) covering this subject from the broad concept to the actual methods of running agile methods (scrum).
Though I never tried to implement the fixed 2-week lab scrum for my research projects, as I find it very intrusive (might face huge pushbacks) and unnecessary (timeline is more flexible in academia).
More on this in the lesson I learned later.

The rules above definitely are used widely outside of running an agile management.
They are reasonable and helpful guidelines.
So I don't believe there can only be agile or non-agile.
Hence the *agile-ish* style.
I just think that agile bundles the rules together as a framework and creates the mindset.
They are not fixed instructions.
We should feel free to relax some rules whichever fit the situation.


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


Collaboration Team Science: A Field Guide by NIH
https://ombudsman.nih.gov/collaborationTS
https://www.cancer.gov/about-nci/organization/crs/research-initiatives/team-science-field-guide/collaboration-team-science-guide.pdf
