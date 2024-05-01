---
title: The case against self-closing tags in HTML
date: 2023-07-06 01:00:00
summary: The history, facts, and opinions.
meta: The history, facts, and opinions.
image: './img.png'
---

Let's talk about `/>`:

```html
<input type="text" />
<br />
<img src="…" />
```

You'll see this syntax on my blog because [it's what Prettier does](https://prettier.io/playground/#N4Igxg9gdgLgprEAuEAeAllADgVxgAhgE8s4BeAHRHgA8YqA+EAGhAixnWgGdlQBDAE6CIAdwAKQhLxT8ANqP5FerAEaD+YANZwYAZX4BbOABlMcZADN53OGo3bderJswBzZDEE47IOIdU4ABMg4JN+KDccfjc4ADEIQUN+GE5I5BB+PAgWEAALGEM5AHU89HhuFzA4PWly9AA3cqIMsG4VEExbQRhxDTdkqxtfACtuGj13OTgARRwIeCG5W1YXQW6MgqLcrEFMGGL0IJg85AAOAAZVkVtijSwM3bhuhotWAEd5+D72GUzuAC0UDgwWCuUEcE+6AhfRigyQ1mWvlshnQnm8yKmcAAgqk9qo8HBxHBBGZgUsViBuFi5gsLAjhqwYPxVIdjqckAAmJkadBydwAYQghnhfm4AFZcjhbAAVFkyRGUho+ACSUFCsD0YD2HGx6r0xGmFLgAF8TUA), and I really like Prettier. However, I don't think `/>` is a good thing.

First up:

# The facts

## Enter XHTML

Back in the late 90s and early 2000s, the W3C had a real thing for XML, and thought that it should replace HTML syntax.

There were good reasons for this. At the time there was no HTML parsing spec, so when it came to anything non-trivial, you'd often end up with 4 browser engines interpreting the same HTML document 4 different ways. On the other hand, XML has a fully defined parser.

But, it would have been a huge change to do this all at once, so in 2000, [XHTML 1.0 became a recommendation](https://www.w3.org/TR/2000/REC-xhtml1-20000126/), and proposed writing HTML in a way that was compatible with both existing HTML parsers, and XML parsers.

That meant:

<!-- prettier-ignore -->
```html
<!-- Instead of: -->
<HTML LANG="en">

<!-- You'd write: -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
```

Because we've got to scare away newcomers right?

<!-- prettier-ignore -->
```html
<!-- Instead of: -->
<option value=foo selected>…</option>

<!-- You'd write: -->
<option value="foo" selected="selected">…</option>
```

Because, in XML, attributes require values, and they must be quoted with double quotes.

And also:

<!-- prettier-ignore -->
```html
<!-- Instead of: -->
<img src="…">

<!-- You'd write: -->
<img src="…" />
```

Because in XML, tags have to explicitly close, and XML has a short-hand for self-closing tags: `/>`.

In XML, it would generally be formatted like `<this/>`, without the space before the `/`, but Netscape Navigator 4 couldn't cope with `<input type="text"/>`, where the `/` immediately followed an attribute, so the spec recommended a space before the `/`.

## But, browsers didn't care

These rules were purely for XML parsers, and because documents were being served as HTML (if you're that one guy who served their site as `application/xhtml+xml`, you don't need to tell me), these syntactical 'extras' were ignored.

With `<option selected="selected">`, the value was ignored, so `<option selected="">` worked too, as would `<option selected="false">` (the `false` would be ignored), but for 'consistency' it was decided that repeating the attribute name was a good idea.

If you forgot to quote an attribute, the browser didn't complain, it just got on with the job of rendering the page.

If you ended a tag with `/>`, the browser saw it as a parsing error and ignored it. And that's where I start to take issue with it.

<!-- prettier-ignore -->
```html
<br /> The br is closed. This text is not inside the br.

But also:

<br> The br is closed. This text is not inside the br.

And this is where it gets confusing:

<div /> The div is open. This text is inside the div.
```

In XML, `<div />` would be a self-closing div, but not in HTML. In HTML, it isn't the `/>` that closes the `br`, it's the "br". It's part of a special list of elements that can never have children, and therefore they self-close. `<div />` doesn't self-close, because "div" isn't on that list.

## Exit XHTML

The 'transitional' phase of XHTML ended with XHTML 1.1. At this point the spec required the document to be served and parsed as XML. XML parsing rules were well defined, except for when invalid syntax was encountered. The best thing browsers could do there is just show an error page, else we'd be back to browsers just making stuff up, and each behaving differently. And to that, browsers said… no thanks.

Well, they didn't exactly say no, they supported it, and still do today. Here's [a valid XHTML document served as `application/xhtml+xml`](https://random-server-stuff.glitch.me/xhtml/), and [here's an invalid one](https://random-server-stuff.glitch.me/xhtml-broken-drs/). But browsers didn't see it as the future.

Ask yourself: If you visit the website of your local doctor's surgery to find out the opening hours, which browser is best: The one that displays the opening hours of the surgery, or the one that displays an XML parsing error message?

One of the great things about browsers is they're error-tolerant, and browsers weren't interested in giving that up.

XHTML was eventually abandoned, because a new thing came along that browsers were happier with:

## Enter HTML5

HTML5 entered the scene in 2008, and one of the major things it introduced was a parsing spec. And, unlike the XML parsing spec, it detailed what browsers should do when they encounter weird and invalid markup.

It did away with all of the XML requirements introduced in XHTML, and leaned into the looseness of HTML parsers that existed at the time. It does handle `/>` specifically, but only to specifically ignore it.

## Enter SVG-in-HTML

In the early 2010s, the ability to include `<svg>` in HTML was spec'd and started appearing in browsers.

```html
<div>
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" />
  </svg>
</div>
```

Although SVG is an XML format, when it's embedded in an HTML document it's parsed by the HTML parser. However, to increase compatibility with copy-pasted SVG content, when the HTML parser is within an `<svg>` tag, it switches to a ["foreign content" mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign), where `/>` is actually meaningful.

<!-- prettier-ignore -->
```html
<div/> The div is open. This text is inside the div.

Whereas:

<svg>
  <g><text>This is inside the group</text></g>
  <g/><text>This is outside the group</text>
</svg>
```

Other foreign content such as MathML behaves the same.

And that's where things are today. `/>` is mostly meaningless in HTML documents, with foreign content being the exception.

# Opinions

Although, as an industry, we generally discarded most of the XHTML requirements, this self-closing-tag decoration seems to have persisted, despite being a remnant from a spec that was abandoned over 10 years ago. Folks even include the space before the `/`, which was added for compatibility with a browser engine from the previous millennium.

I think it's a confusing relic from a time past, and I don't think tools like Prettier should be pushing it. To make my case, I'll respond to counter-arguments that came up in [a Twitter thread](https://twitter.com/jaffathecake/status/1676843832284004353).

## "Self-closing tags make it easier to read, and are helpful for newcomers! You don't need to remember which tags are self-closing."

Outside of foreign content, elements that self-close will always self-close. All other elements, won't.

<!-- prettier-ignore -->
```html
<input />This text is outside the input.

<input>This text is outside the input.</input>

<div>This text is inside the div.</div>

<div />This text is inside the div.
```

The examples of `/>` above simply don't do anything. The only way you know that `<input />` is acceptable and `<div />` isn't, is learning and remembering which elements self-close. It sucks, but that's the way it is.

But, does `/>` have to _work_ to be useful? Code comments don't 'work'. Just like `/>`, they're an indication, they might be misleading, but that isn't a good argument for removing code comments. The problem with `/>` is it doesn't look like a comment, and worse, it doesn't always behave like a comment, due to the rules around foreign content.

I think that's particularly bad for newcomers. Imagine you'd never seen `<img src="…">` before. You'd see, unlike other elements, it doesn't have a closing tag. Debuggers and validators don't complain about it, suggesting there's something particular about this element you need to learn – it doesn't need to close, it self-closes, and it's particular in this behaviour.

Now imagine you'd never seen `<img src="…" />` before. You look up this new syntax you've discovered, and learn that it means a tag is "self-closing". At this point, why wouldn't you assume `<iframe />` is self closing too? Or that `<img src="…"></img>` is valid? Given this, I'm particularly sad that [MDN uses self-closing tags](https://github.com/orgs/mdn/discussions/242) in its beginner-facing documentation.

Edit: [Here is the result of that confusion in the wild](https://www.reddit.com/r/webdev/comments/1cceb03/i_thought_i_knew_html_until_i_saw_this/).

## "It's consistent with JSX"

JSX and HTML are different formats. They aren't consistent with each other. Pretending they're consistent is misleading.

```html
<div>
  <span>Hello</span>
  <span>world</span>
</div>
```

The above HTML renders as "Hello world".

```jsx
const Component = () => (
  <div>
    <span>Hello</span>
    <span>world</span>
  </div>
);
```

The above JSX renders as "Helloworld". The formats work differently.

<!-- prettier-ignore -->
```html
<main>
  <div />
  Hello
</main>
```

With the above HTML, the text is _inside_ the `div`.

```jsx
const Component = () => (
  <main>
    <div />
    Hello
  </main>
);
```

With the above JSX, the text is _outside_ the `div`. It's a different system!

```html
<div classname="foo"></div>
```

The above HTML produces a div with a `classname` attribute.

```jsx
const Component = () => <div classname="foo"></div>;
```

The above JSX produces a div with a `class` attribute. Ok, that's more of a React thing than a JSX thing, but that's a really common way to use JSX.

I don't think there's an argument for consistency here. Despite visual similarities, they're different formats that work differently.

## "It means I can parse HTML with an XML parser"

Call me some sort of purist, but if I want to parse an HTML document, I'll use an HTML parser. I wouldn't try and write JSON so it can be parsed by a YAML parser, so I don't see why I'd do the same with HTML and XML.

There are many great HTML parsing libraries out there, for almost every language. And, since the parser is specified, the results are consistent.

## "It makes the markup faster to parse"

I heard this a few times, and I think it comes from the assumption that, the more information you give, the better the processor can optimise, or something. But let's compare the two:

Parsing `<br>`:

1. `<`: Oh, there's a new tag!
1. `br`: Now I know what element to create.
1. `>`: End of tag, and `br` doesn't go onto the stack of open elements, because it's one of the self-closing ones.

Parsing: `<br/>`:

1. `<`: Oh, there's a new tag!
1. `br`: Now I know what element to create.
1. **`/`: I'll just ignore this.**
1. `>`: End of tag, and `br` doesn't go onto the stack of open elements, because it's one of the self-closing ones.

So, technically, `<br/>` is slower to parse, as it contains the extra `/` junk. It isn't slower in any meaningful way, but it definitely isn't faster.

## "It looks pretty"

Sure, that's subjective. I thought `/>` looked ugly the first time I worked on a codebase that required it, but I got used to it. I also got used to missing it out.

If prettiness is the goal, hey, we could use `<input type="text" 🛑>`!

But seriously, I think aesthetics should take a back seat, given how misleading the syntax is.

# Prettier should be more opinionated

I respect Prettier's "our way or the highway" approach, but I don't think it's consistent here.

It will change `<br>` to `<br />`, but it won't do anything with `<div />`. In fact, if you give it `<div/>` it'll reformat it as `<div />`.

I think Prettier should either [drop `/>` in cases where it's meaningless to the parser](https://github.com/prettier/prettier/issues/5246), or [fix cases where `/>` is actively misleading](https://github.com/prettier/prettier/issues/5864). As in:

<!-- prettier-ignore -->
```html
<div />
Hello
```

…should reformat to:

```html
<div>Hello</div>
```

…similar to how [it already treats unclosed tags](https://prettier.io/playground/#N4Igxg9gdgLgprEAuEAeAJgSwG4D4A6UqADrqgPSkgA0IExMm0AzsqAIYBOnEA7gApcErFOwA2vdgE9WtAEad2YANZwYAZXYBbOABlMUOMgBm45nHmKVa9cSUGA5shicArhZBwtcuOnS-ddigHV3YHOAAxCE4tdhhGYOQQdlcYCBoQAAsYLTEAdUzMeGY7MDh1YSKcIqkksGZZEANzThh+RQdYkzMPACtmAA91RzE4AEVXCHhusXNaO04WpOzcjOJOAxg8zHQYTOQADgAGeZ5zPMViJPW4FuwjWgBHSfh2+hFk5gBaQ19fDM4cGemEB7TCXSQplmHnMWkwzjcMJGcAAgvENnJUnB+HBOPpDDM5iBmMiJlMjJCerQYOw5NtdvskAAmamKTBiRwAYQgWghnmYAFYMq5zAAVWkiKFE7DuACSUH8sHUYA2DBRCvUMCko0JcAAvnqgA).

# Or could HTML allow closing tags everywhere?

A major part of the problem is that `/>` is sometimes ignored, and sometimes not, within the same HTML document. Could we have an option to switch the parsing rules so `/>` is always meaningful? As in, `<div/>` is actually self-closing. I [filed an issue for this](https://github.com/whatwg/html/issues/9491), but I suspect it's a no-go due to incompatibility with existing libraries, particularly security-sensitive ones.

Oh well.
