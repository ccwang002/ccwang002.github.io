---
Title: GPG Key Transition
Slug: gpg-key-transition-2018
Date: 2018-10-20
Tags: en, gpg
Category: Coding
---

I am transiting my GPG key again.  However, for this time, I expect to use the new GPG master key longer and will start building this identity unless there is a concern about the key strength or I accidentally lose the key. 

Back in [my GPG key transition in 2016][my-post-gpg-2016], I've created the subkeys for daily usage and isolated the master key into a secret offline place. I learned more about PGP throughout the years, sadly though, I still seldom have a chance to use it extensively in my daily life. 

This time, I am moving the subkeys to a YubiKey. I found [drduh's guide][yubikey-guide] on GitHub very informative to set up both the GPG key and the yubikey, as well as get my hands on the various possible applications. Another notable change is that I no longer set an expiration date on my master key.

I will revoke my old keys once the transition is done.

[my-post-gpg-2016]: {filename}../2016-12/1206_gpg_key_transition.md
[yubikey-guide]: https://github.com/drduh/YubiKey-Guide

```text
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

I am transitioning GPG keys from an old 4096-bit RSA key to a new
4096-bit RSA key.  The old key will continue to be valid for some
time, but I prefer all new correspondance to be encrypted in the new
key, and will be making all signatures going forward with the new key.

This transition document is signed with both keys to validate the
transition.

The old key, which I am transitioning away from, is:

  pub   rsa4096/0x44D10E44730992C4 2016-12-04 [SC] [expires: 2018-12-04]
        Key fingerprint = 85DF A3EB 72CD DE7D 3F2A  127C 44D1 0E44 7309 92C4

The new key, to which I am transitioning to, is:

  pub   rsa4096/0x69BAE333BC4DC4BA 2018-10-17 [SC]
        Key fingerprint = 978B 49B8 EFB7 02F3 3B3F  F2E5 69BA E333 BC4D C4BA

To fetch the full new key from a public key server using GnuPG, run:

  gpg --recv-key 0x69BAE333BC4DC4BA

If you have already validated my old key, you can then validate that
the new key is signed by my old key:

  gpg --check-sigs 0x69BAE333BC4DC4BA

Please contact me via e-mail at <me@liang2.tw> if you have any
questions about this document or this transition.

                                            Liang-Bo Wang
                                            (liang2, ccwang002)
                                            me@liang2.tw
                                            Oct 20, 2018
-----BEGIN PGP SIGNATURE-----

iQIzBAEBCgAdFiEExQ3ldlbp0O+Zc1vXBS+kcT+kX08FAlvLdGkACgkQBS+kcT+k
X092fw/8DFGIIMHtf3JAt8nGth8Y94oyTgrorqzu7TXCxvUiGk6Qd/WBLiMvh//9
7mVounqtPSGuYHiWm6gtDlT+YRoFoJH3IZ9aboMzd8e/p4TspKhXAsF5bhp6U9ED
HCds+VRoVBGPtO3Ogizl5wpynYp7OzwqgwTteFlJ167mmqL05n/xLHnsvii3UFO4
MWwWMxVmwvEpJINsYOJ+mFxOXeD23ckKt3GQh2NF2Dpa+apEvq5l9vjmk4Vnqau2
WKXygbz1Rm0b629dblV8vU9iwgIsSlXz8oopkETadpkaGk9s/p8AYPupmqfCiwHx
/gYlAgIV0DmePfOjYGZ0RJTVHFnG5ong3kUyoeuAwCMWLC/QQ6pCIL+pRnXOT1/q
oXCTK7HUUZjWpRyHf/ptHpQOeYH+AuYAYJNwQA3xjzv57kkGT/gR3Q4APmA6l5lN
swHVL63QYjcKCNm+fR7pr2ka50WSrerFyLWinAT9G9w+h/31Zcl0cBqEM45nlaye
B5fYaU/G6ehFxWgVEjS7z7FSLQVNJu7aAXVZy9QlKcduNXBUZsDkcDI1iyKVhvl4
41SNhLXMO2Jk69kHtuE803/aVgw8N3Y/E5zjlBNXWSpPMPFeKZl9W6eqnl50kQcd
fKbZGV8bxFl40iBi4mfIrdOXrBQ9Oohp7UVWTHG1qYMruVRmW3aJAjMEAQEKAB0W
IQS66Rw2AWA1VmCbiTP4R473V2p7VwUCW8t0bgAKCRD4R473V2p7V8DqD/9YpnFP
usbOW9p3GwUgbvqPdefLszFZZb5LNsgL9eTSKwMUTn5AGldFquDM3hbjiZ+e/nbD
TwFKbKRt//48R5UTYsYJVxcNVW3CXxMtl+8B5PJORfUbz0/HSEsnKTMlHP1M4ybw
gZCI45sP4wT1prU3ngkZGHJJY9ojNOCrzHA+DVEp+vROn/zyg6AbLcr0+/yjCHO0
pxDbGUgEOV93GFKXl85u7qCXUTrIt2fkeFeEQoh248oBJQHPjD9WyOV/O3QNdT7d
6g7lJcSSpwevtTsWFaWCxRM2IwHlXJiWU/9bA2Jrb8E07mJGlmil7xCe4rPFD69F
/y9MBfMG0KVjAFgs6vAR5zHnN865d18JCunQ4OhY0tDnhi4q3O0OdehGqyX92pwL
hMKtHRHLuhYoDud2kdxizmtov1bHghO0kKSTlDGhZvs9Fpod4MKQHaZx4VbpA8np
OpmPBkX7+34AmnLnJP2GOA4UhsRpX1iyqTaGePjhtA0gqz5285bL02JGx/m7HDtX
MYI4yoc3rdZz37axnRinWmW7Lu5JmQGeVLJZ7Z2b83BEHVnapXPW2kFp8PcqbNnA
Lbb9XLkbHNOaiC4EFm07uFmMVkV6aKW3xV1YIlDeovRfNC0cyZDnUNFqaDGtZAeO
UifqHyDqNjBJX0a8miUMZDOXsZFD2jzm3pjS/Q==
=JRPp
-----END PGP SIGNATURE-----
```
