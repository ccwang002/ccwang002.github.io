---
Title: Changing login shell without chsh
Slug: without-chsh
Date: 2017-01-23
Tags: en, fish, shell
Category: Coding
---

For my daily terminal life, I use [fish shell]. Fish shell can be largely described by the headline on its official website:

> **Finally, a command line shell for the 90s**<br>
> fish is a smart and user-friendly command line
shell for macOS, Linux, and the rest of the family.

[fish shell]: https://fishshell.com/

Among all of its features, I particularly enjoy how the autocompletions are widely available and easy to use for generally all common commands and operations. I think I've got spoiled by the autocompletion so much that sometimes I get lazy at typing the full commands. Undoubtedly, fish is my login shell, replacing the ubiquitous Bash shell.

Most of the time, one can change the login shell by the command `chsh`. In order to let `chsh` accept the new fish shell, it must be added into the list of all accepted shells which requires root permission. However, in many occasions including working on a large shared server, one may not has the permission to add new shell and thus the options for the login shell are often limited.  


#### Replacing login shell by `exec`

Alternative solution will be calling the new shell upon the execution of current shell.  A POSIX-compliant shell[^posix] should always read the `.profile` configuration file upon login, the following command execute fish and sweep the process with the current running shell (usually, bash). 

```shell
exec -l $SHELL -l
```

`-l` tells shell to act like a login shell. For more explanation about login and non-login (as well as (non-)interactive) shells can be found at [this StackOverflow answer][login-shell-so]. By pointing `$SHELL` to the desired shell binary, one can achieve the similar behavior to `chsh`.

However putting `exec` in the login profile comes with a risk that if the new shell executable crashes (e.g. failed symlink, erroneous compilation and failed dynamic library linking), one cannot establish proper shell connections. I've experienced these catastrophic failures for a couple of times. Since the new shell crashes when the original shell is replacing its process, one cannot set up the proper terminal session, or simply put, one will fail to login. It was not fun at all to recover.

[login-shell-so]: http://unix.stackexchange.com/a/46856
[^posix]: Interestingly, fish is not a POSIX-compliant shell so it won't read `~/.profile` configuration file.


#### Fail-safe shell changing

To provide a fail-safe mechanism, I use the following code in my `~/.profile` to change the shell. Only login shells will read this file so it won't be executed when one runs a bash script.

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

Basically we ensure whether fish executable work by running `echo '...'` before we change the shell. By uncommenting the `exec ..` line one will get automatically directed to fish shell. But the safest option is to run the shell change oneself. This kind of "shell swapping" will only happen when we log in the server by ssh

The actual setting is quite straight-forward. While the backstory here is that I messed up a few times and I was lucky enough to keep another session alive. At first I only checked `fish --version` but it was not sufficient, since it didn't actually execute fish's main code instructions. I got a illegal instruction after changing to fish even though printing its version was fine.
