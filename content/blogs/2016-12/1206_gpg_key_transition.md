---
Title: GPG Key Transition
Slug: gpg-key-transition-2016
Date: 2016-12-06
Tags: en, gpg
Category: Coding
---

I started using GPG key as one of my small experiments in March, 2015. Throughout the setup, I made some mistakes, which I revoked later, and explored several usage scenarios. Although like what was said in the post [*I'm giving up on PGP*][give-up-pgp], I don't really use the encryption in daily email communication, it is still good to have an online identity.

A year later, which is 3 months before my *experimental* key expires, I think now is a good time to roll out a new one. I followed Alex's post [*Creating the Perfect GPG Keypair*][perfect-key-pair] to create a signing subkey for daily usage and keep my master key sperately in a safe place. The following is my transition statement.

[give-up-pgp]: https://blog.filippo.io/giving-up-on-long-term-pgp/ 
[perfect-key-pair]: https://alexcabal.com/creating-the-perfect-gpg-keypair/

```text
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

I am transitioning GPG keys from an old 4192-bit RSA key to a new
4096-bit RSA key.  The old key will continue to be valid for some
time, but I prefer all new correspondance to be encrypted in the new
key, and will be making all signatures going forward with the new key.

This transition document is signed with both keys to validate the
transition.

If you have signed my old key, I would appreciate signatures on my new
key as well, provided that your signing policy permits that without
reauthenticating me.

The old key, which I am transitioning away from, is:

  pub   4096R/30A45011B233544E 2015-03-21 [expires: 2017-03-22]
      Key fingerprint = 6ECD C5B8 235C D44D 2471  866E 30A4 5011 B233 544E

The new key, to which I am transitioning to, is:

  pub   4096R/44D10E44730992C4 2016-12-04 [expires: 2018-12-04]
      Key fingerprint = 85DF A3EB 72CD DE7D 3F2A  127C 44D1 0E44 7309 92C4

To fetch the full new key from a public key server using GnuPG, run:

  gpg --keyserver hkps://hkps.pool.sks-keyservers.net --recv-key 44D10E44730992C4

If you have already validated my old key, you can then validate that
the new key is signed by my old key:

  gpg --check-sigs 44D10E44730992C4

If you then want to sign my new key, a simple and safe way to do that
is by using caff (shipped in Debian as part of the "signing-party"
package) as follows:

  caff 44D10E44730992C4

Please contact me via e-mail at <me@liang2.tw> if you have any
questions about this document or this transition.

                                            Liang-Bo Wang
                                            (liang2, ccwang002)
                                            me@liang2.tw
                                            Dec 06, 2016

-----BEGIN PGP SIGNATURE-----

iQIcBAEBCgAGBQJYR5q3AAoJEPhHjvdXantXlzEP/iEgSd2NcfcBThmrY84U+MXR
UOLED3Ax6YvDUv/nInkMAH74SyqujeF7E7+ZuZmDEWRCVS6pQtpuLTvKBviDPyWx
W/hS03AU5nV9llSYZ4I/FzQdVtdY5PBBNCHxK34LoqJQVr3LPdAQOO2m9g8M11z0
+7FjmyNOjvZIxqhU+PK7VNEcZQ9X30ndjgkwCZQFE/8Wz9FnPt5QdwZoxNRBfx7Q
tMtHpMxKNTHV1t3lCcOubf5zQLFQ07SZv2f2rmfDPlsrvzp4bzq8QWEEo/XvClRc
hyFpbM55FqlJE+5lg/Dj/XC5AN0LS8HNd9x7UBWZnNQhg00elc+CXxgNc+wMVj+N
uPXYP2n1oZ4T4Fr45eFg9nJagBpIUsu+M5hoNGXtCdLcYPzJeERPebt/VZJQybse
T60hO8K15A5WCkZYnw1mXu/JangNGY8Bxq3xm7VzXHLJktf33gIIMUQC2ZCn/I0N
MQIjkMrARFpsGfb1DEglyWk/QdK4A8Cy3eKsNaKvz4A+PMr4Eskn8zhO05yJQlux
3IkXt1lnn2YTF5fjInYQPo22bNCuub4qoJhthOoySy2Zv04NHnOtmYPBZMv14aZe
MPcv4Kvn8szNeBRDT/zKqCWoHmxIbxIs7ZvSIfvj/NpugtkSkJVtvr7gpXmqObcc
L7kJSEXjkLiqvFrq6MkxiQIcBAEBCgAGBQJYR5q3AAoJEDCkUBGyM1ROlzEQAJ3i
gpH6z/rHrAVCNxru7ATLmVZYGF0uxLvth0hUnOvmhWb7a60v4KwRgTBFJ9vdUB24
MW0T0BdxN8zJPrN6hGj9RxML5UpzH///oeL1gINM8IEhZWaG1/th7bx5f/ip8xN+
dbkA8Hp3LW/LAB09uJOITLbLaPa+N2Umcsu6stPXL+Z/06JSUYIliDRDkzzpb/qw
/OZD6sj1oI25A7KYEUPiNn+FxtBmNiFetDqwhCJSglEF3SBl8ZlrbgMDxIudZX/5
+ihTn2Za5q59c7u2ESMmInP1n8/lFxYxi/DWE2n8vrw84PwQ5lG5zdiiYQf78QeB
j77giQzYibzvRHZlslJEM0lSeNLQ72svT5SIFB+45wqtfVIAfZCxTppv35MkpyDw
gtYW/zL6U+Qx+chPgVpBLkpC7LbBvrJozIU0oHw8V837IByaeqBPu9rm+F3M++Mo
taLmkzNvhX6wozw9Tj0gnW6e8ytH7Xi8K8IYO7xSSOGih/oKF2PrWPd8gufMiIML
lOtcuwZOCQqAB2yAQ2BHliwrm78XELARZXM1sbWJTpXBJPAZ+ZbvnNFK6fUwnclK
H35TsvRJK7hH+4d10EdURleyRj7d0EcXlHqki4urKlwSzRebLzq365vADzXEjFYp
DmfC2ISS64uLqHgJ3HHxhSmTLdc8KSJqzFi90ZUu
=JS7v
-----END PGP SIGNATURE-----
```
