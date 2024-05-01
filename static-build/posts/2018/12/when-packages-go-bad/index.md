---
title: What happens when packages go bad?
date: 2018-12-14 11:41:38
summary:
  How much damage can a malicious package do to a static site, and what
  can be done about it?
mindframe: ''
image: null
meta: How much damage can a malicious package do to a static site?
---

I built [spritecow.com](http://spritecow.com) back in 2011, and I no longer actively maintain it. A few months ago, a user berated me for using a crypto currency miner on the site without their informed consent. And sure enough, the site's JS had a small addition that loaded the mining JS, and sent the result somewhere else.

I'm still not 100% sure what happened, I guess someone had gained access to the Amazon S3 bucket that hosted the site and made changes. The bucket was owned by an agency I used to work for, and I no longer had access to it. Either they were careless with the key, or I was. I dunno, maybe I accidentally committed it and failed to purge it from git history.

I was still in control of the domain, so I was able to deploy the site somewhere else, without the coin miner, and point the domain at the new location.

\*dons flat cap\* In my day, you knew a site was hacked because you'd be greeted with green-on-black text stating the site was "0wned" by the "hackersaurus" and their "l33t crew". You'd also get a few animated GIFs of skulls, and if you were really lucky, a picture of a big ol' arse. But now… now it's all stealthy crypto bullshit.

This hack was a break-in, but recent events got me thinking about attacks where the malicious code is unwittingly invited in.

# When packages go bad

In case you missed [the drama](https://github.com/dominictarr/event-stream/issues/116), here's roughly what happened:

1. The original author of event-stream was no longer interested in maintaining the code.
1. Someone offered to take on the burden, and the original author agreed.
1. The new owner turned out to have malicious intents, and modified event-stream in a way that made targeted changes to the build of another app, Copay (a bitcoin management Electron app), which used event-stream as a dependency.

As a result, some versions of Copay would essentially try to rob users.

I think the author of event-stream did the wrong thing when they handed over the keys to a package without any sort of vetting. But, before this publicised incident, I might have done the same thing, and I'm sure many others have done the same.

So where does that leave us? A small JS project can easily build up 1000+ npm dependencies. Some of these will be executed in a Node.js context, others will run in the browser.

Perhaps apps that deal with user data, especially passwords and finances _should_ audit every package, and every change to those packages. Perhaps we need some kind of chain-of-trust for audited packages. But we don't have that, and for most of us, auditing all packages is a non-starter.

The remaining option is to **treat all npm packages as potentially hostile**, and that's kinda terrifying.

We recently launched [squoosh.app](https://squoosh.app). It's a 'static' web app in that it does heavy lifting on the frontend, but it doesn't have a server component, and it doesn't store or transfer user data. [The code is on GitHub](https://github.com/GoogleChromeLabs/squoosh/), and [Netlify builds and deploys the 'live' branch](https://app.netlify.com/sites/squoosh/deploys/5c0122cae47085399ec71b15).

It feels like it has a small attack surface, yet we use over 1700 packages. We only have 49 direct dependencies, so the vast majority of these are dependencies of dependencies of dependencies etc etc. The web app itself doesn't use a lot of third party code, so most of these packages are part of the build system.

As a thought exercise, I explored the kind of powers an evil dependency could have, and what, if anything, could be done to prevent it.

I got some friends to review a draft of this article, and they pointed out there's a lot of crossover with [David Gilbertson's article](https://hackernoon.com/im-harvesting-credit-card-numbers-and-passwords-from-your-site-here-s-how-9a8cb347c5b5) from earlier this year. They're right. It's kinda gutting. Anyway, I'm told there's enough difference to warrant posting this, but I'm worried people are just being nice. You be the judge…

# Attack the developer

When a module from a package is executed in a node context it has the same powers as the user that called `node`. This means it can do whatever you can do from the CLI, including:

- Transferring your SSH keys elsewhere.
- Deleting stuff, or encoding it and holding it to ransom.
- Crawling your other projects for secret stuff.

Of course, npm will delete packages that are found to do evil stuff, but as we've seen with the event-stream case, it's possible for a malicious package to go unnoticed for months.

You don't even need to `require()` the package to give it access to your system. npm packages can have a post-install hook in their `package.json`:

```json
{
  "name": "node-sass",
  "scripts": {
    "postinstall": "node scripts/build.js"
  }
}
```

If you run `npm install` on a project, each package can run CLI commands on your behalf.

Squoosh might be an interesting target for this, because the folks running `npm install` are often Googlers, so the SSH keys might be particularly valuable (although a combination of passphrases & two-factor auth will reduce the usefulness of a key). Googlers are also a good target for corporate espionage, where the attacker would search the local filesystem and network for company secrets.

One solution is to do what browsers do – sandbox the script. This can be done using a virtual machine that can only access a single directory of the host. Docker makes this relatively easy, and the virtual machines can be easily torn down and rebuilt. Maybe this is something npm should do by default. Of course, some packages need wider system access of course, but these could be run with an `--unsafe-no-sandbox` flag, or whatever.

# Attack the server

Basically the same as above, but the attacker aims to infect the server. From there they could monitor and edit other things on the server, perhaps data and code belonging to other sites.

The solution is the same, sandbox the code. This is standard practice for a lot of hosts already, and Netlify is no exception.

I'm going to talk a lot about Netlify, since it's what we're using, but the same stuff applies to Firebase, Now, App Engine etc etc.

# Attack the user

When we push to the `live` branch, Netlify clones it, runs our build script, and serves the content of the `build` directory.

If we have a malicious package in our dependencies, it can do whatever it wants to the checked out copy of the repo, including the built files.

Netlify supports [`_headers`](https://www.netlify.com/docs/headers-and-basic-auth/) and [`_redirects`](https://www.netlify.com/docs/redirects/) files generated at build time. So along with modifying served content, an attacker could modify those.

Netlify also supports cloud functions, but we don't use them. These can be enabled via a [`netlify.toml`](https://www.netlify.com/docs/netlify-toml-reference/) configuration in the root of the repo. However, I'm told this is read before `npm install`, so a malicious package won't be able to enable cloud functions. Phew! However, the header and redirect parts of `netlify.toml` are read after build, so that's another vector to watch out for.

So, what could these attacks look like?

- **Coin mining** or a similar abuse of user resources, such as carrying out DDoS attacks. Users tend to notice attacks like this due to excessive CPU usage. Although, that might be harder to spot with Squoosh, since it uses CPU during image compression.
- **Stealing user data.** Squoosh does all its work on the client, meaning images you open/generate in the app don't leave your machine. However, a malicious script could send your pictures elsewhere. Users may spot these unexpected network requests in devtools.
- **Content change.** The old school. The l33tasaurus and their hacker crew proudly boast of their attack, along with a picture of an excessively-sized arse. Users are likely to spot the giant arse.
- **Subtle content change.** Add something like a "donate" link which goes to an account owned by the attacker. Users may think this is intentional, so it might take someone involved in the project to spot it.

What can we do about it? Let's start from the worst-case scenario:

# Recovering after a successful hack

Our job is to get everything back to normal as quickly as possible. First step: redeploy without the malicious package. The site is now fixed for everyone who didn't visit while the site was hacked.

For everyone else, it depends on how crafty the attacker was. They may have modified headers to give their malicious resources a long cache time. With Squoosh we hash most of our resource URLs, so we can avoid a lot of caching issues easily. That leaves the root HTML, and the service worker script.

Without a service worker, the user might continue to get the hacked HTML from their HTTP cache for a long time, but the service worker gives us a bit more control. When the user visits Squoosh, the browser will check for updates to the service worker in the background. Our new, unhacked service worker is in a good position to look at the current state of things and decide if the user is running the hacked version. If that's the case, we need to get rid of anything the hacked version may have compromised. The best way to do that is to burn it all down & start again.

The new service worker could dump all caches, unregister itself, and navigate all clients to `/emergency`. This URL would serve a `Clear-Site-Data: *` header, deleting everything stored & cached by the origin, then redirect to `/`.

```js
addEventListener('install', (event) => {
  event.waitUntil(
    (async function () {
      if (isRunningHackedVersion()) {
        for (const cacheName of await caches.keys()) {
          await caches.delete(cacheName);
        }
        await registration.unregister();
        const allClients = await clients.matchAll({
          includeUncontrolled: true,
        });
        for (const client of allClients) {
          client.navigate('/emergency');
        }
        return;
      }
      // …
    })(),
  );
});
```

Unfortunately Safari & Edge don't support `Clear-Site-Data`. This means the HTTP cache may still be compromised. To work around this, we could redirect the user to `/?[random number]` rather than `/`, and force the browser to bypass the cache when storing the page:

```js
addEventListener('install', (event) => {
  event.waitUntil(
    (async function () {
      if (isRunningHackedVersion()) {
        // As above
      }

      const cache = await caches.open('static-v1');
      await cache.addAll([
        new Request('/', { cache: 'reload' }),
        // + CSS & JS
      ]);
    })(),
  );
});
```

`{ cache: 'reload' }` tells the browser to bypass the HTTP cache on the way to the network, but it may put the response in the cache.

The attacker may have given the service worker script a long cache time, but the spec mandates that the browser caps this at 24hrs. Even if the attacker has been really crafty, they can't lock users into the hacked version longer than that.

# Limiting attacks

What can we do to limit the impact of an attack? Well, a lot of attacks benefit from contacting another server. Sending the results of coin mining, forwarding-on user data, and of course, downloading giant arse imagery.

CSP can help a lot here:

```
Content-Security-Policy: default-src 'self' www.google-analytics.com 'sha256-QHnk…' 'sha256-kubd…'
```

With this header we can limit communication to the same origin, Google Analytics, and allow our inline styles and scripts. Communication with other origins is blocked.

If we were using cloud functions, the attacker would be able to make the communication same-origin, and make the cloud function proxy the data. However, we aren't using cloud functions, so this isn't a concern.

CSP doesn't prevent a coin miner using the user's CPU, it just prevents the attacker profiting from it.

However, the attacker can also modify the headers file during build, so it'd be trivial for them to remove or modify the CSP. It feels like we need to split our build process into "trusted" and "untrusted", so the build would do this:

1. Run the "trusted" build script.
1. The "trusted" script runs the "untrusted" script in a sandbox.
1. Once the "untrusted" script has completed, the "trusted" script sets sensitive things like headers, ensuring any headers the "untrusted" script set are discarded.

The "trusted" script would only use audited dependencies.

# Noticing an attack before deploy

A malicious script could edit our source in the hope that a contributor wouldn't notice and commit the result. But, we create PRs for all changes, and review them before merging, so this seems unlikely. Let's assume the attacker is making changes at build time to avoid this.

## Spotting visual changes

Netlify automatically [builds our PRs & branches](https://app.netlify.com/sites/squoosh/deploys/5c0e5b7241174f1a8f76a4e6), so it's easy to review the result of a change before it goes live. As such, we'd quickly see content changes by the crewasaurus and the hackerl33t. Unless of course, they did this:

```js
if (location.origin === 'https://squoosh.app') {
  document.body.innerHTML = `<h1>LOL</h1>`;
}
```

We wouldn't see this during staging because the origin would be something like `https://deploy-preview-366--squoosh.netlify.com/`, but the same code on the live server would change the content. We could deploy to a different-but-identical server, and use hosts files to point at that server when we access `https//squoosh.app`. This would catch the above example, but it wouldn't catch attacks that triggered after a future date, for example.

## Spotting unexpected source changes

Looking at the above code example, it's pretty easy to tell it's malicious, but would I spot it amongst 80k of minified code? I've looked at the minified output before to check if tree-shaking is working as expected (it wasn't btw), but it isn't something I do often.

Assuming that the attacker can't bring in external resources (due to the CSP mitigation), they're going to have to make it part of the output.

I want each PR to automatically include the before/after size of every asset, including removed/added assets. This is for [performance reasons](https://github.com/GoogleChromeLabs/squoosh/issues/252), but it also means we'd spot the 265k increase caused by something like Coinhive (a JS coin miner), or the addition of `plethora-of-arse.jpg`.

We'd still miss something small, or something that was able to offset itself by removing code we wouldn't immediately spot.

## Preview != production

These mitigations assume that the preview build is the same as the production build, but this isn't true. When we move our `live` branch, Netlify rebuilds and deploys, even if it's already built that git commit before.

This means a malicious package could look at the environment, plus the state of GitHub, and realise a given build isn't going to be published at `squoosh.app`. In this case, the malicious package could do nothing, leaving no trace in the staging version of the site. If the deploy is heading for `squoosh.app`, it could make its changes, and we wouldn't notice until it was live (or sometime much later).

If a build has already been completed for a particular commit (for a PR, or another branch), Netlify should reuse it by default. That way we can be sure that the site we're checking in staging is the same as the site that'll be deployed to live.

Without this feature, we could use our "trusted" + "untrusted" build system from earlier. The "trusted" part could check the output matches the output from an earlier build that should be identical.

# In conclusion: uh oh

It's been terrifying to think this through, and this is just for a static site. Some of the mitigations I've detailed here are pretty complicated, and partial.

For sites with a server component and database, it feels negligent to use packages you haven't audited. With Copay, we've seen that attacks like this aren't theoretical, yet the auditing task feels insurmountable.

I don't really have answers, just worries. Anyway, sleep well!
