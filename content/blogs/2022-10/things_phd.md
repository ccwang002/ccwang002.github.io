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

During my PhD, I had the opportunity to lead [some collaborative projects][google scholar] in computational biology/bioinformatics.
The scale of my project can range from a few close colleagues (less than 10) to a long list of people (100-ish) across institutions.

My experience-based learning was shown to be quite limiting when the team grew and called for a rethinking of the existing teamwork methods.
The style of teamwork was very different for a project of just three people sitting in adjacent cubicles versus a project of a few teams of people in different states who I never met in person.
Particularly, the cost and overhead for (mis)communications grew *exponentially* when the team size increased.
As a result, a significant proportion of my time and effort during PhD went in to project management and learning it from my mistakes.

Thus, I decided to write down my lessons and setup for project management.
This post will focus on the challenges when we have a large team of people contribute to a research project together.
My projects are mostly about genomic data analysis, so my experience is bespoke to this field and mostly dry lab.

Before we jump in, I am well aware that my experience only covers a small aspect of research and teamwork.
I never run a lab, never do hybrid experiments and analysis on my own, and research in the private sector probably works out quite differently.
I will continue to learn and find a better solution.

[google scholar]: https://scholar.google.com/citations?user=-tdb3hcAAAAJ

[TOC]

<!-- cSpell:words Toggl Todoist xoxb -->


## Go agile
Managing a research project is similar to running a startup in many ways:

- Both research and startups reward innovations and novel discoveries
- A clear end goal exists, being a publication or a product
- Resources to accomplish the goal are limited (e.g., time, people, equipments, and fundings)

[Agile management][agile-software-dev] has been used by startups and software development ubiquitously.
In fact, in my large collaboration projects, I tried to apply what I learned from a classic book on agile management for software development, [*The Mythical Man-Month*][man-month-book].

I think these agile principles are helpful to research:

1. Make incremental and iterative builds
2. Keep short and direct feedback cycles
3. Implement easy or automatic ways to ensure things are going as expected

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

To learn more about agile management in an academic setting, here are some resources:

- [This blog post][pm-academia-101] compares the traditional project management(waterfall) to the agile management in academia
- *Nature* publishes a few columns ([1][nature-six-tip], [2][nature-agile], [3][nature-scrum]) covering this subject from the broad concept to the actual methods of running agile methods (aka [scrum]).
  Though I never implemented a 2-week lab scrum myself.
  It is probably too intrusive (might face huge pushbacks) and unnecessary (timeline is more flexible in academia).

In many cases, going *agile-ish* by adopting just some of the approaches above can already go a long way.
While the concept is quite simple and well known, I often come back to it whenever my projects go stale.


[agile-software-dev]: https://en.wikipedia.org/wiki/Agile_software_development
[man-month-book]: https://en.wikipedia.org/wiki/The_Mythical_Man-Month
[pm-academia-101]: https://thenewpi.blogspot.com/2018/04/project-management-for-academia-101.html
[nature-six-tip]: https://www.nature.com/articles/d41586-018-07860-6
[nature-agile]: https://www.nature.com/articles/d41586-019-01184-9
[nature-scrum]: https://www.nature.com/articles/d41586-019-02620-6
[scrum]: https://en.wikipedia.org/wiki/Scrum_(software_development)


## Mentoring

## Project management toolbox
In the subsequent posts, I am going to cover different aspects of my project management experience, including:

- Tools and services for project management
- Mentoring

Stuff I want to talk about:

- Wiki
    - Confluence
    - Notion
- Task management
    - Trello
    - Toggl
    - Todoist
- Mentoring
    - one on one
    - page to keep track of their progress

