---
title: How should <selectedoption> work?
date: 2024-10-18 01:00:00
summary: It's part of the new customisable `<select>`, but there are some tricky details.
meta: It's part of the new customisable `<select>`, but there are some tricky details.
---

We're finally getting a way to fully style & customise `<select>` elements! But there's a detail I'd like everyone's opinion on.

# A brief intro to customisable `<select>`

If you want to hear about it in depth, [I talked about it on OTMT](https://offthemainthread.tech/episode/stylable-select-element/), and [there's a great post by Una Kravets](https://developer.chrome.com/blog/rfc-customizable-select). But here's a whirlwind tour:

```html
<style>
  /* Opt in to the customisable mode */
  select,
  ::picker(select) {
    appearance: base-select;
  }
</style>

<select>
  <!--
    The button is the thing that appears on the page.
    It's what you click to open the popover menu.
    You can style it and control its content as you would any other button.
  -->
  <button>
    …
    <!-- We'll get to this later -->
    <selectedoption></selectedoption>
  </button>

  <!--
    Any other content, which can include divs, images, etc etc,
    is displayed in the popover menu when the button is clicked.
    You can style these elements however you like.
  -->
  <option>…</option>
  <option>…</option>
  <option>…</option>
</select>
```

And that's as much background as you need for the rest of this post.

# What about `<selectedoption>`?

`<selectedoption>` automatically displays the currently selected `<option>`. It's entirely optional, so if you wanted to manually update the content of the `<button>` when the selected `<option>` changes, you can, and you get a lot more control that way. But `<selectedoption>` is much easier, and works without JavaScript.

When the selected `<option>` changes, it clears the contents of the `<selectedoption>`, takes a clone of the contents of the newly selected `<option>`, and inserts it into the `<selectedoption>`.

This is kinda new and weird behaviour. [I recently wrote that I didn't like elements that modify themselves](/2024/attributes-vs-properties/#attributes-should-be-for-configuration), as I think the light DOM should have a single owner. But, I can't think of a better way to do this, given:

- The content needs to render in two places at once - in the button and in the menu.
- The selected option needs to be able to be styled differently to the equivalent content in the `<option>`.
- The solution must work without JavaScript.

## But there are limitations

This is a clone in the `el.cloneNode(true)` sense. That means it's a copy of the tree, including attributes, but not including properties, event listeners, or any other internal state. So, if the selected option contains a `<canvas>`, the clone will be a blank canvas. An `<iframe>` will reload using the `src` attribute. CSS animations will appear to start over, since they're newly constructed elements. Custom elements will be constructed afresh, and may have different internal state to the cloned element.

As far as I can tell, in most cases this will be fine, as the kinds of elements you'd typically use in an `<option>` are fully configurable via attributes.

# But what if the selected `<option>` is modified?

This is the bit I want your opinion on. I'm going to present a series of options, and point out potential limitations/gotchas/issues with each. Not all of these issues are equal, and you may even feel some of them are features rather than bugs (I certainly do).

Editing the content of `<option>` elements isn't super common, but it's possible, so we need to define what happens. It might happen when:

- Enhancing options with additional data. For example, you might discover asynchronously that an option is "almost sold out", and want to display that information in the `<option>`.
- Dynamically modifying styles in response to interaction. Most animation libraries modify `element.style`, which also updates the `style` attribute.
- Going from a 'loading' state to a 'loaded' state.

For example, imagine a React app like this:

```jsx
function CustomSelect({ options }) {
  return (
    <select>
      <button>
        <selectedoption></selectedoption>
      </button>

      {options.map((option) => (
        <option value={option.value}>
          {option.icon && <img src={option.icon} alt={option.iconAlt} />}
          {option.text}
        </option>
      ))}
    </select>
  );
}

function App() {
  const [options, setOptions] = useState([
    {
      text: 'Loading…',
    },
  ]);

  useEffect(() => {
    // Fetch option data and call setOptions
  }, []);

  return <CustomSelect options={options} />;
}
```

Because the above example doesn't give each `<option>` a meaningful `key`, React will modify the first 'loading' `<option>` to become the first real `<option>` when the data loads. It's better to use `key` in this situation, which would cause React to create a new `<option>` element, but not everyone does this.

You might see a similar pattern to above when updating `<select>` depending on a choice made earlier in a form.

So what should happen?

## Option: Nothing by default, but provide a way to trigger an update

When an `<option>` becomes selected, the content of `<selectedoption>` is replaced with a clone of the selected `<option>`'s content. If the content of the selected `<option>` is later modified, it would become out of sync with the `<selectedoption>` element.

A method like `selectedOption.resetContent()` would cause the content to be replaced with a fresh clone of the selected `<option>`'s content. Developers would have to call this if they've updated the `<option>`'s content in a way that they want mirrored in the `<selectedoption>`.

Any manual modifications to the contents of `<selectedoption>` will be overwritten the next time the selected option changes to another `<option>`, or when `selectedOption.resetContent()` is called.

## Option: Automatically reset the content when anything in the selected `<option>` changes

Whenever the tree in the selected `<option>` changes, as in a node is added, removed, or attributes change in any way, the content of the `<selectedoption>` is replaced with a fresh clone of the selected `<option>`'s content.

This would be a _full_ clone of the `<option>`'s content. So even if you deliberately only changed one attribute on one element within the selected `<option>`, every element in the `<selectedoption>` would be replaced with a fresh clone. This would cause state to be reset in those elements, and things like CSS animations within `<selectedoption>` would appear to restart.

Since the cloning is performed synchronously, it will probably happen more than you expect. In the above React example where `<option>Loading…</option>` is changed to an option with an icon, that's three changes within the selected `<option>`:

1. The `<img>` is inserted (it's already been given the `alt` attribute).
1. The text is updated.
1. The `src` of the `<img>` is updated.

So that's three times the content of the `<selectedoption>` is replaced with a fresh clone of the selected `<option>`'s content, and this is a really basic example.

What about this:

```js
// Get the selected <option>
const selectedOption = select.selectedOptions[0];
// Move the first child to the end
selectedOption.append(selectedOption.firstChild);
```

Well, that's two clones of the selected `<option>`'s content, because an element 'move' is actually two tree modifications: a remove followed by an insert.

If you change 10 styles on an element within the selected `<option>` via `element.style`, each change updates the style attribute, so that's 10 times the content of the `<selectedoption>` is replaced with a fresh clone of the selected `<option>`'s content.

If you're using an animation library to do something fancy within one of the options, they tend to modify `element.style` per frame. So that means the content of `<selectedoption>` is being entirely rebuilt every frame, or more likely, many times per frame.

There may be cases where you don't want a change in the `<option>` to be reflected in the `<selectedoption>`. Since they're independent elements, you can give each independent `:hover` states via CSS. But, if you want to do something much fancier involving JavaScript, which modifies `element.style` on `mouseenter`, that will appear to be mirrored from the selected `<option>` to the `<selectedoption>`, which may not be your intent, because only the `<option>` is being hovered over.

This could actually become more of an issue in future. Right now, when you click on a `<details>` element, it becomes `<details open>` – it modifies its own attributes. If you had one of those in a selected `<option>` and the user clicked on it, the one in the `<selectedoption>` would appear to open too (via cloning since the attribute changed). Now, having a `<details>` in an `<option>` doesn't really make sense, but since this pattern is becoming more popular on the web platform, it may appear on an element that you would use in an `<option>`.

There isn't a way to prevent changes from mirroring to `<selectedoption>`. The only way around it is to avoid using `<selectedoption>` and doing things manually.

Also, this automatic 'mirroring' is one-way. If you manually alter content in the `<selectedoption>`, it won't cause the content in the selected `<option>` to be updated. Your manual changes in the `<selectedoption>` will be overwritten the next time the cloning operation occurs.

## Option: Automatically reset the content when anything in the selected `<option>` changes… debounced

As above, but when the content of the selected `<option>` changes, the content of the `<selectedoption>` is replaced with a fresh clone after a microtask. This would always be before the next render.

This reduces the amount of cloning significantly. All the examples I gave above would only trigger a single clone of the selected `<option>`'s content.

However, it means that:

```js
// Get the selected <option>
const selectedOption = select.selectedOptions[0];
// Get the <selectedoption>
const selectedOptionMirror = select.querySelector('selectedoption');

selectedOption.textContent = 'New text';

// This may not be true yet, because the mirroring is delayed.
console.log(selectedOption.textContent === selectedOptionMirror.textContent);
```

Also, you still have the behaviours where:

- Changing one inner element of the selected `<option>` causes all elements in the `<selectedoption>` to be replaced.
- Changes are mirrored even if you don't want them to be.
- Mirroring is one-way.

## Option: Perform targeted DOM changes when something in the selected `<option>` changes

When the `<option>` becomes selected, the content of the `<selectedoption>` is replaced with a clone of the selected `<option>`'s content. However, the browser maintains a link between each of the elements and their respective clones. If you modify an attribute on an original element, the same attribute on its clone is updated, and only that attribute. This means that changes on one element in the selected `<option>` won't cause everything in the `<selectedoption>` to 'reset', such as CSS animations.

If a new element is introduced into the selected `<option>`, it will be cloned and inserted into the equivalent position in the `<selectedoption>`.

Changes will be performed synchronously, but the changes are just a repeat of your specific action. Your changes run twice, once in the selected `<option>`, and once in the `<selectedoption>`.

However, when the selected `<option>` changes to another `<option>`, the content of the `<selectedoption>` is fully replaced with a fresh clone of the newly selected `<option>`'s content.

You still have the behaviours where:

- Changes are mirrored even if you don't want them to be.
- Mirroring is one-way.

The one-way mirroring behaviour is different to the other options. In the 'clone' options, any change to the selected `<option>` will cause the content in the `<selectedoption>` to 'reset', as the content is completely replaced with a fresh clone. Whereas in this option, since the DOM changes are targeted, if you manually modify the `<selectedoption>` content, it's more like a fork.

For example, inserts will be done using an internal version of `element.insertBefore`, as in "insert `node` into `element` before `referenceNode`". If the content of `<selectedoption>` has been manually altered, it's possible this change will fail because `referenceNode` is no longer in `element`, in which case the `node` won't be inserted.

# So, what do you think?

This is being actively discussed [in the HTML spec](https://github.com/whatwg/html/issues/10520), but I want a wider set of developers to have their opinions heard on this.

What should happen? Which options do you like? Which do you hate? Let me know what you think in the comments, social networks, [Hacker News](https://news.ycombinator.com/item?id=41878515), or wherever else you can get my attention. I'll present this at the next OpenUI meeting.
