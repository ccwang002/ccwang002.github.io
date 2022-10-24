---
Title: My productivity toolbox during PhD
Slug: my-phd-productivity-toolbox
Date: 2022-11-01
Tags: en
Category: misc
Lang: en
Status: draft
---

- Dry lab notebook
    - Daily Markdown
    - Later notion
    - Periodic high level summary through slides
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
