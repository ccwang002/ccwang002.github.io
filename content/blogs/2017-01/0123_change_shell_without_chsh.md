---
Title: Changing login shell without chsh
Slug: without-chsh
Date: 2017-01-23
Tags: en, fish, shell
Category: Coding
---

For my daily life in terminal, I use [fish shell] all the time. Fish shell is a relatively new shell that can be largely described by its headline on the official website:

> **Finally, a command line shell for the 90s**<br>
> fish is a smart and user-friendly command line
shell for macOS, Linux, and the rest of the family.

[fish shell]: https://fishshell.com/

Among all of its features, I particularly enjoy how the autocompletions are widely available among all common commands and operations. I think I've got spoiled by the autocompletion that sometimes I can get very lazy to type the full word at all. Undoubtly, fish has become my login shell.

Most of the time, if one wants to change the login shell, running the command `chsh` will do. In order to let `chsh` accept the new fish shell, it must be added into the list of all accepted shells which requires root permission. However, from time to time and especially on server one may not has such permission.  

#### Replacing login shell by `exec`

Alternative solution will be calling the new shell upon the execution of current shell. For example, most people have Bash as the default, during reading the `.profile` configuration file, the following command execute fish and sweep the process with bash. 

```shell
exec -l $SHELL -l
```

`-l` tells shell to act like a login shell. More explanation about login and non-login (as well as (non-)interactive) shells can be found at [this StackOverflow anwser][login-shell-so]. By pointing `$SHELL` to the desired shell binary, one can achieve the similar behavior to `chsh`.

However putting `exec` in the login profile comes with a risk that one cannot establish proper shell connections if the new shell executible brokes, which I've had for a couple of times. Since the shell crashes as soon as it loads the profile, one cannot set up the proper terminal session, or simply put, one will fail to login. It will not be fun at all to recover.

[login-shell-so]: http://unix.stackexchange.com/a/46856

#### Fail-safe shell changing

I use the following code in my `~/.profile` to change the shell.

```bash
FISH_BIN="$HOME/.linuxbrew/bin/fish"

# The replacement is only done in non-fish login interactive shell in
# SSH connection and fish executable exists.
if [                                                            \
     "$SHELL" != "$FISH_BIN" -a -n "$SSH_TTY" -a -x "$FISH_BIN" \
] ; then
    # we first check whether fish can be executed, otherwise the
    # replacement will cause immediate crash at login (not fun)
    if "$FISH_BIN" -c 'echo "Test fish running" >/dev/null' ; then
        export SHELL="$FISH_BIN"
        echo "One can launch the fish shell by 'exec -l \$SHELL -l'"
        # exec -l $SHELL -l   # launch the fish login shell
    else
        echo "Failed to launch fish shell. Go check its installation!"
        echo "Fall back to default shell $SHELL ..."
    fi
fi
```

So basically we told fish to run `echo '...'` to ensure it works before we change the shell. By uncommenting the `exec ..` line one will get automatically directed to fish shell. But the safest option is to run the shell change oneself.

The actual setting is quite straight-forward. While the backstory here is that I messed up a few times and I was lucky enough to keep another session alive. At first I only checked `fish --version` but it was not sufficient since it didn't actually execute and I got a illegal instruction after changing to fish even though printing its version was fine.
