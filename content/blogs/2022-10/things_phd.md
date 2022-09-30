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

Modern science is sometimes a science of a teamwork.

I've learned that an effective teamwork requires non-trivial time and effort, however, traditional academic training does not emphasize on how to collaborate *effectively*.
The training I received generally taught me how to think critically and how to apply my knowledge to problem-solving.
I only learned how to teamwork professionally through experience.
And experience-based learning is limiting when the team grows and a new style of teamwork is required.

During my PhD, I had the opportunity to lead [some collaborative projects][google scholar] in computational biology/bioinformatics.
The scale of my project can range from a few close colleagues (less than 10) to a long list of people (100-ish) across institutions.

As we could imagine, the style of teamwork is very different for a project of just three people sitting in adjacent cubicles versus a project of a few teams of people in different states who I might never meet in person.
When the team grows, the cost of communications and miscommunications grows *fast*.
As a result, a significant proportion of my time and effort during PhD went in to project management and learning it from my mistakes.

Thus, I wrote this post to share my lessons and setup for project management.
My projects are mostly genomic data analysis in academia, so my experience is bespoke to this field and mostly dry lab.

Before we jump in, here are some disclaimers.

My experience won't be comprehensive, nor I have the best solution.
In fact, I have a very narrow view point for how to conduct research.
I never run a lab, never do hybrid experiments and analysis on my own, and research in the private sector probably works out quite differently.
I have been constantly learning from other's approaches and related books even up to now.

Standalone research (by much fewer people) is still very possible and common.
For example, [my wife's phenomenal work][clarice's paper] is done by just herself and her PI.
My post focuses on the challenges when we have a large team of people contribute to a research project together.

[google scholar]: https://scholar.google.com/citations?user=-tdb3hcAAAAJ
[clarice's paper]: https://doi.org/10.1101/gr.276025.121

[TOC]

<!-- cSpell:words Toggl Todoist xoxb -->


## Go agile
A research project is similar to a startup in many ways, so we can learn from the best practices of running a startup.
Both research and startups reward innovations and novel discoveries.
A clear end goal exists, being a publication or a product.
And resources to accomplish the goal are limited (e.g., time, people, equipments, and grants/funds).

[Agile management][agile-software-dev] has been use by startups and software development ubiquitously.
In fact, in my large collaboration projects, I tried to apply what I learned from a classic book on agile management for software development, [*The Mythical Man-Month*][man-month-book].

I think these agile principles are helpful to research:

1. Make incremental and iterative builds
2. Keep short and direct feedback cycles
3. Implement easy (automatic) way to ensure things are going as expected

For the first principle of incremental builds, instead of targeting straight for publications or developing all the features of a tool (end goal), set up milestones and minimal viable products (MVP).
For example, to develop a tool that classify genomic variants, implement a *simpler* tool.
The MVP can just check one basic rule of the classification (even a dummy rule) but it takes in the inputs and produces outputs in the desired format.
For analysis, sub-aims or tasks in each sub-aim can be a good milestone because their outcomes are well-defined, and sub-aims and tasks are the natural steps toward the completion of the aim and so forth the project.

For the second principle on short feedback cycles, set up regular feedback on the results.
And the feedback being short and direct is the key.
No one likes a lengthy and boring meeting (conference call).
Long meetings also don't scale with the increasing project size and scope.

I want to save time on my analysis and tool development.
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


Collaboration Team Science: A Field Guide by NIH
https://ombudsman.nih.gov/collaborationTS
https://www.cancer.gov/about-nci/organization/crs/research-initiatives/team-science-field-guide/collaboration-team-science-guide.pdf
