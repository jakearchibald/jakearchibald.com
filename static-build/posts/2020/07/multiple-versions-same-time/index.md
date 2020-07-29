---
title: Different versions of your site can be running at the same time
date: 2020-07-29 01:00:00
summary: Are you prepared for that? I'm not sure I am
meta: Are you prepared for that? I'm not sure I am
---

It's pretty easy for a user to be running an old version of your site. Not only that, but a user could be running many different versions of your site at the same time, in different tabs, and that's kinda terrifying. For instance:

1. A user opens your site.
1. You deploy an update.
1. The user opens one of your links in a new tab.
1. You deploy an update.

Now there are three versions of your site in-play. Two on the user's machine, and a third on your server.

This can cause all sorts of exciting breakages that we don't often consider.

# It's unlikely though, right?

Eh, it depends. There's a number of things that can increase the chance of this happening:

**You deploy often**. We're taught that's a good thing, right? Deploy early and often. But if you're updating your site multiple times a day, that increases the chance that the version on the server won't match the version in the user's tab. It also increases the chance that the user may have multiple versions running in different tabs.

**Your navigations are client-side**. A full page refresh is a great opportunity to pick up the latest stuff from the server. However, if your navigations are managed by JS, it keeps the user on the current version of the site for longer, making it more likely that they're out of sync with the server.

**The user is likely to have multiple tabs open to your site**. For instance, I have 3 tabs pointing to various parts of the HTML spec, 11 to GitHub, 2 to Twitter, 2 to Google search, and 9 to Google Docs. Some of those I opened independently, some of them I created by opening links 'in a new tab'. Some of these have been open for longer than others, increasing the chance that they're running different deploys of those sites.

**Your site uses offline-first patterns via a service worker**. Since you're loading content from a cache, which may have been populated days ago, it's likely to be out of sync with the server. However, since [only one service worker can be active within a registration](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle), it _decreases_ the chance of the user running multiple versions of your site in different tabs.

Combine a few of those, and suddenly it becomes likely that the user will be out of sync with the server, or they end up with multiple tabs running different versions. What can go wrong?

# Stuff changed

What if the user loads one of your pages, you deploy an update, then the user clicks a button:

```js
btn.addEventListener('click', async () => {
  const { updatePage } = await import('./lazy-script.js');
  updatePage();
});
```

The JavaScript running on your page is V1, but `./lazy-script.js` is now V2. This can land you with all kinds of potential mis-matches:

- The content added by `updatePage` relies on CSS from V2, so the result looks broken/weird.
- `updatePage` tries to update the element with class name `main-content`, but in V1 that was named `main-page-content`, so the script throws.
- `updatePage` has been renamed `updateMainComponent`, so `updatePage()` throws an error.

This is a problem with anything lazy-loaded that's co-dependent with other things on the page, including CSS and JSON.

## Solutions

You could use a service worker to cache the current version. [The service worker lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle) won't let a new version take over until everything using the current version goes away. However, that means caching `lazy-script.js` up-front, which maybe defeats the point in terms of bandwidth saving.

Alternatively, you could follow [caching best-practices](/2016/caching-best-practices/) and revision your files so their content is immutable. Instead of `./lazy-script.js`, it would be `./lazy-script.a837cb1e.js`. But…

# Stuff went missing

What if the user loads one of your pages, you deploy an update, then the user clicks a button:

```js
btn.addEventListener('click', async () => {
  const { updatePage } = await import('./lazy-script.a837cb1e.js');
  updatePage();
});
```

In the latest deployment the lazy script was updated, so its URL has changed to `lazy-script.39bfa2c2.js` or whatever.

In ye olde days, we'd push immutable assets to some kind of static host such as Amazon S3 as part of the deploy script. This meant both `lazy-script.a837cb1e.js` _and_ `lazy-script.39bfa2c2.js` would exist on the server, and everything would work fine.

However, with newer containerised/serverless build systems, the old static assets are likely _gone_, so the above script will fail with a 404.

This isn't just a problem with lazy-loaded scripts, it's a problem with anything lazy-loaded, even something as simple as:

```html
<img src="article.7d62b23c.jpg" loading="lazy" alt="…" />
```

## Solutions

Going back to separate static hosts seems like a step backwards, especially as serving across multiple HTTP connections is bad for performance in an HTTP/2 world.

I'd like to see teams like Netlify and Firebase offer a solution here. Perhaps they could provide an option to keep pattern-matched resources around for some amount of time after they're missing from the latest build. Of course, you'd still need a purge option to get rid of scripts that contain security bugs.

Alternatively, you could handle import errors:

```js
btn.addEventListener('click', async () => {
  try {
    const { updatePage } = await import('./lazy-script.a837cb1e.js');
    updatePage();
  } catch (err) {
    // Handle the error somehow
  }
});
```

But you aren't given the reason for failure here. A connection failure due to user being offline, syntax error in the script, and 404 during the fetch are indistinguishable in the code above. However, a custom script loader built on top of `fetch()` would be able to make the distinction.

The `try/catch` needs to be in the V1 code, meaning V1 needs to be prepared for errors introduced by V2, and I don't know about you, but I don't always have total foresight for that kind of stuff.

Again, you could use a service worker here, as it gives V2 some control over what to do with V1 pages, even if it's just forcibly reloading them:

```js
// In the V2 service worker
addEventListener('activate', async (event) => {
  for (const client of await clients.matchAll()) {
    // Reload the page
    client.navigate(client.url);
  }
});
```

This is pretty disruptive to the user, but it gives you a way out if V1 is totally unprepared for V2, and you just need it gone.

# Storage schemas change

What if the user loads one of your pages, you deploy an update, then the user loads another one of your pages in another tab. Now the user has two versions of your site running.

Both have:

```js
function saveUserSettings() {
  localStorage.userSettings = getCurrentUserSettings();
}
```

But what if V2 introduces some new user settings? What if it changed the name of some of the settings? We often remember to migrate stored data from V1 to the V2 format, but what if the user continues to interact with V1? A number of fun things could happen when V1 tries to save user settings:

- It could save things using old names, meaning the settings would work in V1, but be out of sync with V2 – the settings have forked.
- It could discard anything it doesn't recognise, meaning it deletes settings created by V2.
- It could put storage into a state that V2 can no longer understand (especially if V2 believes it has already migrated data), creating breakages in V2.

## Solutions

You could give your deployments version numbers, and make them show errors if storage was altered by a later version than the current tab version.

```js
function saveUserSettings() {
  if (Number(localStorage.storageVersion) > app.version) {
    // WHOA THERE!
    // Display some informative message to the user, then…
    return;
  }
  localStorage.userSettings = getCurrentUserSettings();
}
```

IndexedDB kinda sends you down this path by design. It has versioning built in, and it won't let V2 connect to the database until all V1 connections have closed. However, V2 can't force the V1 connections to close, meaning V2 is left in a blocked state unless you fully prepared V1 for the arrival of V2.

If you're using a service worker and serving all content from a cache, [the service worker lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle) will prevent two tabs running different versions unless you say otherwise. And again, V2 can forcibly reload V1 pages if V1 was totally unprepared for V2's arrival.

# API response changes

What if the user loads one of your pages, you deploy an update, then the user clicks a button:

```js
btn.addEventListener('click', async () => {
  const data = await fetch('/user-details').then((r) => r.json());
  updateUserDetailsComponent(data);
});
```

However, the response format returned by `/user-details` has changed since the deployment, so `updateUserDetailsComponent(data)` throws or behaves in usual ways.

## Solutions

Out of all the scenarios in this article, this is the one that's usually handled pretty well in the wild.

The easiest thing to do is version your app, and send that along with the request:

```js
btn.addEventListener('click', async () => {
  const data = await fetch('/user-details', {
    headers: { 'x-app-version': '1.2.3' },
  }).then((r) => r.json());

  updateUserDetailsComponent(data);
});
```

Now your server can either return an error, or return the data format required by that version of the client. Server analytics can monitor the usage of old versions, so you know when it's safe to remove code for handling old versions.

# Are you prepared for multiple versions of your site running at once?

I'm not trying to finger-wag – a lot of the things I work on use serverless builds, so they're vulnerable to at least some of the breakages I've outlined, and some of the solutions I've presented here are a bit a weak, but they're the best I've got. I wish we had better tools to deal with this.

Do you have better ways of dealing with these situations? Let me know in the comments:
