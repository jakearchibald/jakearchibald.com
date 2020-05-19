---
title: Do we need a new heading element? We don't know
date: 2017-02-20 12:15:56
summary: There's [a proposal for adding a new `<h>` element to the HTML
  spec](https://github.com/w3c/html/issues/774), but can we solve the problem in
  a way that benefits the existing web?
mindframe: ""
image: ""
meta: ""

---

There's [a proposal to add a new `<h>` element to the HTML spec](https://github.com/w3c/html/issues/774). It solves a fairly common use-case. Take this HTML snippet:

```html
<div class="promo">
  <h2>Do you find the "plot" a distraction in movies?</h2>
  <p>If so, you should check out "John Wick" - satisfaction guaranteed!</p>
</div>
```

This could be a web component, or a simple include. The problem is, by using `<h2>`, we've assumed the 'parent' heading is an `<h1>`. If this snippet is moved elsewhere in the DOM, this assumption may break the heading outline.

What if, instead, we could write:

```html
<section class="promo">
  <h>Do you find the "plot" a distraction in movies?</h>
  <p>If so, you should check out "John Wick" - satisfaction guaranteed!</p>
</section>
```

…where the `<h>` element is contextual to its parent `<section>`. Now this snippet can be moved around without breaking things - the heading always represents a subsection within its parent.

The structure of a document should be marked up in a nested manner, and this is mostly how HTML works: You put an `<ol>` within an `<li>` to express a list within a list. Sections & headings should work the same.

# This is old news

The `<h>` idea is at least 26 years old. It can be found in [an old www-talk email from 1991](https://lists.w3.org/Archives/Public/www-talk/1991SepOct/0003.html) (thanks to Jeremy Keith for pointing that out). It made it into [the XHTML2 spec](https://www.w3.org/TR/2004/WD-xhtml2-20040722/mod-structural.html#sec_8.5.) in 2004. It was also [rolled into the (then-named) HTML5 spec](https://html.spec.whatwg.org/multipage/semantics.html#headings-and-sections), but applied to existing headings to maintain *some* backwards compatibility.

```html
<h1>Level 1 heading</h1>
<section>
  <h1>Level 2 heading</h1>
  <h2>Level 3 heading</h2>
  <section>
    <h6>Level 3 heading</h6>
  </section>
</section>
```

The outline algorithm [as defined by the HTML spec](https://html.spec.whatwg.org/multipage/semantics.html#headings-and-sections) allows both the old numbered heading system to coexist with a contextual section-based system, which is a real bonus when working with existing content. For example, the posts in this blog use markdown, which uses a flat heading structure. The HTML outline meaning I can put this flat structure inside a section, and it becomes contextual to the section. Also, for user agents that don't understand sectioned headings, at least they see headings.

Browsers implemented some of this. `<section>` is a recognised element, and browsers give [`<h1>`s within sections a smaller font size](https://jsbin.com/jucorev/edit?html,output). Unfortunately, no browser implements the outline when it comes to the accessibility tree, meaning screen readers still see an `<h1>` as a level 1 heading no matter how many sections it's within.

This sucks. The outline was kinda the whole point.

# &lt;h&gt; to the rescue?

The suggestion is that `<h>` would solve this, as browsers would implement it & do the right thing in terms of the accessibility tree.

This is a common mistake in standards discussion - a mistake I've made many times before. You cannot compare the current state of things, beholden to reality, with a utopian implementation of some currently non-existent thing.

If you're proposing something almost identical to something that failed, you better know why your proposal will succeed where the other didn't.

We need evidence. And the first step is understanding what went wrong with the previous proposal.

# Why haven't browsers implemented the outline?

I don't know. I'm trying to find out, as are people at other browsers. But here are a few guesses:

* The accessibility part was given low priority & no one got round to it.
* The outline algorithm significantly impacts performance.
* By the time browsers got round to it, developers were using sections incorrectly, and adding the outline would have a negative impact on users.

If the reason is apathy or performance, the same applies to `<h>`, meaning `<h>` is likely to fail as hard, and in the same places.

But I stress, *I don't know*.

We have a bit of a global problem right now: confident assertion without evidence (or even despite evidence to the contrary) is valued higher than qualified uncertainty. We must rise above this in the web community. The first step is admitting what we don't know, then figuring that out before proceeding.

# Fixing the existing web

In terms of browser & standards work, making `<h>` a thing involves:

1. Spec the new element.
1. Update the outline algorithm.
1. Implement the new element.
1. Implement the outline algorithm.

To make `<h1>` perform the same function, all we need to do is:

1. Implement the outline algorithm.

And that's it - the spec & partial implementation exists already. The work needed to fix the existing web is a subset of creating a new element that does the same thing, but *doesn't* fix the existing web.

It's possible that implementing the outline for existing heading elements will negatively impact accessibility, and [there are anecdotes](https://twitter.com/stevefaulkner/status/833661375356481538) [that point to this](https://github.com/w3c/html/issues/774#issuecomment-278382514). However, it's also possible that, on the whole, it'd improve accessibility, as it'd make correctly-sectioned content work as the author intended. *I just don't know*. We need evidence.

If `<h>` becomes a standard, there'll be a period of time where it's used, but it's unsupported in user agents. Unless it's polyfilled, this element is no better than a `<span>` to these users. Given that [most screen reader users use headings to navigate pages](http://webaim.org/projects/screenreadersurvey5/#finding), sticking with existing heading elements is likely to be less disruptive. If possible, fixing the existing web is preferable.

If implementing the outline breaks more sites than it fixes, to the point where it becomes a blocker, can we fix the outline algorithm with a few tweaks? If not, can we make it opt in & switchable?

```html
<body outline="sectioned">
  <h1>Level 1 heading</h1>
  <section>
    <h1>Level 2 heading</h1>
    <section outline="flat">
      <h4>Level 4 heading</h4>
    </section>
  </section>
</body>
```

…where `outline` can appear on any [sectioning root](https://html.spec.whatwg.org/multipage/semantics.html#sectioning-root) or [sectioning content](https://html.spec.whatwg.org/multipage/dom.html#sectioning-content-2) element. This is preferable to a new element, as it has *some* meaning to existing user agents, and plays well with existing content.

If the problem is simply an apathy towards accessibility, we could expose the computed heading level in the DOM, or CSS ([as proposed by Amelia BR](https://github.com/w3c/html/issues/774#issuecomment-278404905)):

```css
:heading-level(1) {
  /* styles */
}
:heading-level(2) {
  /* styles */
}
```

This would be generally useful, and may encourage browsers to implement the outline.

But the important thing to admit is, *we don't know*. This, and most of the assertions in [the Github thread](https://github.com/w3c/html/issues/774), are just guesswork. We need to be better.

# Moving forward

Before we throw a new element at the platform that may solve nothing, we need to answer the following:

* Why haven't browsers implemented the outline for sectioned headings?
* What proportion of site would get worse / improve / remain unchanged if we implement the HTML outline as-is?
* Can we fix any breakages with tweaks to the outline algorithm?
* Are there significant users of sectioned headings that would benefit from an opt-in?

And we must measure the above against the likely breakages and potential failures of adding a new element.

Measuring the impact of the outline algorithm isn't easy, and I don't see how it can be automated given how subjective it is. We may need to organise some kind of test where users can be presented with two heading outlines, one flat & one sectioned, and assess the quality of each for a representative set of pages.

If you want to look at outlines for current pages, the W3C validator will output the heading outline both flat & sectioned. [Here are the results for this page](https://validator.w3.org/nu/?showoutline=yes&doc=https%3A%2F%2Fjakearchibald.com%2F2017%2Fdo-we-need-a-new-heading-element%2F#headingoutline).

Given that the original problem is worth solving, I really hope we can fix this.

<small>Many thanks to [Steve Faulkner](https://twitter.com/stevefaulkner) for a couple of valuable additions to this post, and in general for his years of work with HTML outlines.</small>