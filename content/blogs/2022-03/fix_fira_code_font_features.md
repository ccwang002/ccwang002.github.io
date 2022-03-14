---
Title: Fix Fira Code font ligatures and features
Slug: fix-fira-code-font-features
Date: 2022-03-01
Tags: en, font
Category: Coding
Lang: en
---

[Fira Code] has been my choice of the programming font for a while. It's also the default monospace font of my blog.
I like its ligatures such as `>=` and connected lines `======` `------`.
It evens renders the progress bar nicely ``.
It makes my plain text documents look neat.

That said, I don't like the default ampersands `&` and the at signs `@`.
I find them harder to read than their traditional looks.
To change their looks, we can enable the alternative ligatures and features of the font using [different OpenType features][opentype-features] (see also [the guide on MDN][opentype-features-mdn]).
In this case, `ss05` and `ss08` enable the traditional looks of ampersands and at signs, respectively.
Most modern editors and word processors are able to configure the feature sets in use.

<div class="figure">
    <img src="{attach}pics/fira_code_comparison.png">
    <p class="caption">Comparison of the Fira Code rendering with and without the features fixed (ss01, ss03, ss05, and ss08).</p>
</div>

Unfortunately, I encounter programs that are unable to configure the font features.
While tools like [pyftfeatfreeze (OpenType Feature Freezer)][pyftfeatfreeze] are able to swap specific glyphs by directly editing the font file, ligatures of those glyphs may fail.
For example, `ss08` feature (e.g., `==`, `!=`, and `===`) won't be permanently enabled using this approach.


## Permanently fix the font features
By changing the source code of the font generation, it should be possible to permanently fix any font features (aka patching).
As mentioned by [the original author (`@tonsky`)][tonsky-comment]:

> There is probably a simpler approach to patching the font, just concat whatever code there is in ssXX and add it to the end of calt feature.
> That should work on the current version of the font, but you’ll need to do your own research on which scripts to use for that

And that's exactly [my patch][feature-fix-patch] for `FiraCode.glyphs`.
Copy all the content of the features (say, ss01, ss03, ss05, and ss08) to `calt`. So the original code:

```text
# FiraCode.glyphs
{
code = "lookup less_bar_greater ...
... underscores;\012";
name = calt;
},
```

becomes:

```text
{
code = "lookup less_bar_greater ...
... underscores;\012
# ss01\012  sub r by r.ss01;
# ss03\012  sub ampersand by ampersand.ss03;...
# ss05\012  sub at by at.ss05;\012sub asciitilde.spacer'; ...
# ss08\012  sub equal_equal.liga by equal_equal.ss08;...
";
name = calt;
},
```

Then build the font from the `.glyphs` file using the Docker image:

```bash
docker run -it --rm \
    -v $PWD:/opt/FiraCode \
    tonsky/firacode ./FiraCode/script/build.sh
```

To set a different font name for the feature fixed fonts, I use [pyftfeatfreeze]:

```bash
parallel \
	pyftfeatfreeze \
		--suffix --usesuffix="'ss01 ss03 ss05 ss08'" \
        -v -n \
		'{}' 'features_enabled/{/.}.ss1358_enabled.ttf' \
		::: ttf/*.ttf
```


[Fira Code]: https://github.com/tonsky/FiraCode
[opentype-features]: https://ilovetypography.com/OpenType/opentype-features.html
[opentype-features-mdn]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Fonts/OpenType_fonts_guide
[pyftfeatfreeze]: https://twardoch.github.io/fonttools-opentype-feature-freezer/
[tonsky-comment]: https://github.com/tonsky/FiraCode/issues/869#issuecomment-548006778
[feature-fix-patch]: https://github.com/ccwang002/FiraCode/commit/cdc30ce57a8654cb88a6fa03db1dc5425f42fda7
