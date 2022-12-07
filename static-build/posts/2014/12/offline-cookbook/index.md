---
title: The offline cookbook
date: 2014-12-09 00:00:08
summary:
  ServiceWorker [brief overview](/2014/service-worker-first-draft/) gives
  you control over caching and how requests are handled. It doesn't give you
  patterns, you create them yourself. Let's look at a few!
mindframe: ''
image: ''
meta: ''
---

**Update:** Together with Udacity I created a [free offline-first interactive course](https://www.udacity.com/course/offline-web-applications--ud899). It involves taking an online-only site to full offline-first glory. Many of the patterns in this article are used.

When AppCache arrived on the scene it gave us a couple of patterns to make content work offline. If those were the patterns you needed, congratulations, you won the AppCache lottery (the jackpot remains unclaimed), but the rest of us were left huddled in a corner [rocking back & forth](http://alistapart.com/article/application-cache-is-a-douchebag).

With ServiceWorker ([intro](http://www.html5rocks.com/en/tutorials/service-worker/introduction/)) we gave up trying to solve offline, and gave developers the moving parts to go solve it themselves. It gives you control over caching and how requests are handled. That means you get to create your own patterns. Let's take a look at a few possible patterns in isolation, but in practice you'll likely use many of them in tandem depending on URL & context.

All code examples work today in Chrome & Firefox, unless otherwise noted. For full details on service worker support, see ["Is Service Worker Ready?"](https://jakearchibald.github.io/isserviceworkerready/).

For a working demo of some of these patterns, see [Trained-to-thrill](https://jakearchibald.github.io/trained-to-thrill/), and [this video](https://www.youtube.com/watch?v=px-J9Ghvcx4) showing the performance impact.

## Contents

<!-- in case I need it again: copy($$('h2, h3').slice(1, -2).map(h => `${h.tagName === 'H3' ? '  ' : ''}1. [${h.textContent}](#${h.id})`).join('\n')) -->

1. [The cache machine - when to store resources](#the-cache-machine---when-to-store-resources)
   1. [On install - as a dependency](#on-install---as-a-dependency)
   1. [On install - not as a dependency](#on-install---not-as-a-dependency)
   1. [On activate](#on-activate)
   1. [On user interaction](#on-user-interaction)
   1. [On network response](#on-network-response)
   1. [Stale-while-revalidate](#stale-while-revalidate)
   1. [On push message](#on-push-message)
   1. [On background-sync](#on-background-sync)
1. [Cache persistence](#cache-persistence)
1. [Serving suggestions - responding to requests](#serving-suggestions---responding-to-requests)
   1. [Cache only](#cache-only)
   1. [Network only](#network-only)
   1. [Cache, falling back to network](#cache-falling-back-to-network)
   1. [Cache & network race](#cache--network-race)
   1. [Network falling back to cache](#network-falling-back-to-cache)
   1. [Cache then network](#cache-then-network)
   1. [Generic fallback](#generic-fallback)
   1. [ServiceWorker-side templating](#serviceworker-side-templating)
1. [Putting it together](#putting-it-together)

# The cache machine - when to store resources

ServiceWorker lets you handle requests independently from caching, so we'll look at them separately. First up, caching, when should it be done?

## On install - as a dependency

<link href="https://fonts.googleapis.com/css?family=Just+Another+Hand" rel="stylesheet" type="text/css">

<svg class="diagram-defs"><defs><path id="diagram-path-test" d="M372.34 122.043s116.49 28.723 82.98 130.32l6.313-2.927"></path></defs></svg>

<script>
  (function() {
    function toArray(arr) {
      return Array.prototype.slice.call(arr);
    }

    // Safari doesn't support .children on SVG elements
    function getChildren(el) {
      return el.children || toArray(el.childNodes).filter(function(node) {
        return node.nodeType == 1;
      });
    }

    // IE doesn't support .classList on SVG elements
    function classContains(el, className) {
      return (" " + el.getAttribute('class') + " ").indexOf(className) != -1;
    }

    function joinerAnim(pathContainer, startTime) {
      return toArray(getChildren(pathContainer)).reduce(function(startTime, path) {
        var length = path.getTotalLength();
        var duration = Math.min( Math.max(length / 150, 0.1), 2 );
        path.style.strokeDasharray = length + ' ' + length;
        path.style.strokeDashoffset = length;

        requestAnimationFrame(function() {
          path.style.transition = 'stroke-dashoffset ' + duration + 's ease-in-out ' + startTime + 's';
          path.style.strokeDashoffset = '0';
        });

        return startTime + duration + 0.1;
      }, startTime);
    }

    function fadeInAnim(el, startTime) {
      var duration = 0.6;
      el.style.opacity = '0';

      requestAnimationFrame(function() {
        el.style.transition = 'opacity ' + duration + 's cubic-bezier(0.455, 0.030, 0.515, 0.955) ' + startTime + 's';
        el.style.opacity = '1';
      });

      return duration;
    }

    function doAnim(el, startTime) {
      var children = toArray(getChildren(el));
      var endTime = 0;

      // IE doesn't support .classList on SVG elements.
      // I know this is isn't a great hack but frankly I don't care.
      var isSequence = classContains(el, 'sequence');

      children.forEach(function(child) {
        var animEnd;
        child.style.display = 'inline';

        if (classContains(child, 'joiner') || classContains(child, 'cross')) {
          animEnd = joinerAnim(child, startTime);
        }
        else if (classContains(child, 'fade-in')) {
          animEnd = fadeInAnim(child, startTime);
        }
        else if (classContains(child, 'anim')) {
          animEnd = doAnim(child, startTime);
        }

        animEnd += Number(el.getAttribute('data-time-padding')) || 0;

        if (isSequence) {
          startTime = animEnd;
          endTime = animEnd;
        }
        else {
          endTime = Math.max(endTime, animEnd);
        }
      });

      return endTime;
    }

    function runAnimation(el) {
      var startingAnim = el.querySelector('.anim');

      toArray(getChildren(startingAnim)).forEach(function(el) {
        el.setAttribute('data-time-padding', 0.6);
      })

      doAnim(startingAnim, 0);
    }

    function debounce(func, delay) {
      var timeout;

      return function() {
        clearTimeout(timeout);
        timeout = setTimeout(func, delay);
      };
    }

    var diagrams;

    var checkForInViewDiagrams = debounce(function() {
      if (!diagrams[0]) return;

      requestAnimationFrame(function() {
        var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var box;

        while (diagrams[0]) {
          box = diagrams[0].getBoundingClientRect();

          if (box.top < viewportHeight / 2) {
            runAnimation(diagrams.shift());
          }
          else {
            break;
          }
        }
      });
    }, 200);

    // Check for support
    // Firefox has broken getTotalLength
    var correctTotalLength = Math.abs(document.querySelector('#diagram-path-test').getTotalLength() - 183) < 10;

    if (correctTotalLength) {
      document.documentElement.classList.add('animate-drawing');

      window.addEventListener('load', function() {
        diagrams = toArray(document.querySelectorAll('.diagram-container'));
        window.addEventListener('resize', checkForInViewDiagrams);
        window.addEventListener('scroll', checkForInViewDiagrams);
        checkForInViewDiagrams();
      });
    }

  }());
</script>

<style>
  .diagram-container {
    fill: #2D2D2D;
  }
  .diagram-container .label,
  .diagram-container .state-label {
    font-size: 40px;
    font-family: Just Another Hand;
   text-align: center;
    text-anchor: middle;
  }
  .diagram-container .state-label {
    font-size: 32px;
    fill: #009d81;
  }
  .diagram-container .joiner {
    fill: none;
    stroke: #009d81;
    stroke-width: 3.2;
  }
  .diagram-container .cross {
    fill: none;
    stroke: #da0000;
    stroke-width: 5.9;
  }
  .diagram-defs {
    display: none;
  }
  .diagram-container {
    position: relative;
    margin-top: 1.4em;
  }
  .diagram-container svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .animate-drawing .diagram-container .anim > * {
    display: none;
  }
</style>

<svg class="diagram-defs"><defs><path d="M125.558 122.652V76.668c0-2.123-1.72-3.844-3.843-3.844l-38.2 23.772 42.043 26.056zM39.07 72.825c-2.122 0-3.843 1.72-3.843 3.844v49.964c0 2.123 1.72 3.846 3.844 3.846h82.65c2.122 0 3.842-1.722 3.842-3.845l-86.49-53.81zm59.67-11.272c-1.97 7.728-8.96 13.45-17.303 13.45-8.342 0-15.33-5.723-17.3-13.45H43.614v10.294L80.26 94.393l36.804-21.83v-11.01H98.74zM81.437 42.78c-7.924 0-14.346 6.42-14.346 14.346 0 7.925 6.427 14.35 14.35 14.35s14.35-6.425 14.35-14.35S89.36 42.78 81.44 42.78zm1.85 22.158H80.08V53.813h-3.137v-2.09h.29c1.068 0 1.91-.202 2.527-.603.615-.4 1.003-1.046 1.167-1.935h2.36v15.753z" id="diagram-notification"/><path d="M105.74 133.947l-12.07-5.73c-1.36-.644-2.184-1.647-2.184-3.043v-.358c0-1.396.823-2.4 2.184-3.044l12.07-5.73c.427-.214.82-.357 1.324-.357 1.146-.035 2.184.967 2.184 2.256 0 1.04-.573 1.76-1.504 2.19l-10.814 4.83 10.814 4.834c.93.43 1.504 1.253 1.504 2.256 0 1.325-1.038 2.256-2.365 2.22-.392 0-.786-.143-1.144-.323zm6.803 5.373l14.002-29.257c.394-.823 1.038-1.253 1.898-1.253 1.146 0 2.112.967 2.112 2.04 0 .395-.143.79-.25 1.04l-14.002 29.255c-.394.823-1.038 1.253-1.898 1.253-1.146 0-2.112-.966-2.112-2.04 0-.395.142-.788.25-1.04zm25.067-23.277l12.067 5.73c1.36.644 2.184 1.647 2.184 3.043v.358c0 1.396-.82 2.4-2.18 3.043l-12.07 5.73c-.43.215-.82.358-1.323.358-1.146.035-2.184-.967-2.184-2.256 0-1.04.574-1.76 1.505-2.19l10.814-4.834-10.814-4.835c-.93-.43-1.504-1.252-1.504-2.255 0-1.326 1.04-2.257 2.365-2.22.392 0 .786.143 1.144.322zm31.91-27.436c0-1.866-1.513-3.377-3.38-3.377H76.08c-1.865 0-3.377 1.51-3.377 3.377v66.42c0 1.865 1.512 3.377 3.377 3.377h90.06c1.867 0 3.38-1.512 3.38-3.377v-66.42zm-74.865-.188c1.347 0 2.44 1.09 2.44 2.434s-1.092 2.44-2.44 2.44c-1.347 0-2.44-1.092-2.44-2.44 0-1.347 1.094-2.44 2.44-2.44zm-6.754 0c1.35 0 2.44 1.09 2.44 2.434s-1.09 2.44-2.44 2.44c-1.343 0-2.44-1.092-2.44-2.44 0-1.347 1.098-2.44 2.44-2.44zm-6.75 0c1.347 0 2.44 1.09 2.44 2.434s-1.092 2.44-2.44 2.44c-1.347 0-2.44-1.092-2.44-2.44 0-1.347 1.094-2.44 2.44-2.44zm83.87 65.48H77.21V97.61h87.81v56.29z" id="diagram-page"/><path d="M82.687 42.615c-2.388 0-4.733.18-7.023.53l-.2-.09c-.02.044-.034.09-.054.13-22.133 3.493-39.058 22.648-39.058 45.76 0 25.59 20.744 46.334 46.334 46.334 25.588 0 46.333-20.748 46.333-46.338 0-25.587-20.748-46.33-46.337-46.33zm-9.65 51.123c-.73-.364-1.508-.646-2.328-.818.06-5.917.52-11.804 1.384-17.586 2.722-.564 5.02-2.27 6.397-4.586 6.643 1.918 13.024 4.942 19.025 8.934-.155.473-.27.964-.35 1.465-8.557 2.602-16.684 6.85-24.132 12.59zM63.51 110.73c.83.522 1.744.92 2.72 1.174.694 5.234 1.7 10.388 3.016 15.44-4.677-1.643-8.967-4.114-12.688-7.24 2.177-3.334 4.502-6.46 6.95-9.374zm52.983-26.94c.295-.004.59-.016.885-.016 1.898 0 3.8.117 5.694.288.193 1.603.303 3.232.303 4.886 0 2.454-.23 4.854-.65 7.19-2.327-3.115-4.784-6.04-7.36-8.753.595-1.09.986-2.304 1.128-3.595zm5.457-5.498c-1.524-.102-3.05-.162-4.572-.162-.652 0-1.303.017-1.952.035-1.637-3.098-4.887-5.212-8.632-5.212-2.27 0-4.356.784-6.014 2.085-6.582-4.397-13.615-7.698-20.942-9.784-.158-2.962-1.63-5.567-3.85-7.25.987-3.267 2.103-6.473 3.358-9.595 1.103-.09 2.215-.15 3.34-.15 18.75 0 34.568 12.75 39.264 30.03zM72.895 49.458c-.797 2.164-1.534 4.363-2.213 6.59-.193-.012-.382-.03-.578-.03-4.28 0-7.907 2.757-9.224 6.59-3.272.002-6.54.26-9.782.73 5.488-6.755 13.093-11.72 21.797-13.88zm-30.897 39.49c0-6.878 1.72-13.36 4.745-19.044 4.578-1.056 9.248-1.624 13.93-1.644.787 3 2.958 5.434 5.797 6.575-.9 6.113-1.376 12.333-1.414 18.582-3.59 1.44-6.126 4.95-6.126 9.054 0 1.406.302 2.738.834 3.94-2.584 3.02-5.03 6.26-7.335 9.71-6.48-7.21-10.436-16.734-10.436-27.17zm40.69 40.688c-2.436 0-4.817-.227-7.136-.64-1.63-5.636-2.852-11.42-3.66-17.315 3.817-1.32 6.56-4.94 6.56-9.21 0-1.74-.46-3.37-1.26-4.783 6.46-4.862 13.437-8.518 20.757-10.858 1.55 3.332 4.92 5.65 8.84 5.65 1.63 0 3.16-.407 4.512-1.114 3.386 3.572 6.56 7.524 9.485 11.836-5.787 15.426-20.68 26.438-38.104 26.438z" id="diagram-network"/><path d="M66.496 72.76h41.74v41.74h-41.74V72.76zm69.566 0c1.275 0 2.318-1.04 2.318-2.32 0-1.28-1.043-2.318-2.318-2.318h-9.276v-4.638h9.276c1.275 0 2.318-1.038 2.318-2.318s-1.043-2.32-2.318-2.32h-9.276V56.53c0-1.28-1.043-2.32-2.32-2.32h-2.317v-9.274c0-1.28-1.05-2.32-2.32-2.32-1.28 0-2.32 1.04-2.32 2.32v9.275h-4.64V44.94c0-1.28-1.044-2.32-2.32-2.32-1.275 0-2.318 1.04-2.318 2.32v9.275h-4.638v-9.275c0-1.28-1.044-2.32-2.32-2.32-1.274 0-2.318 1.04-2.318 2.32v9.275H94.32v-9.277c0-1.28-1.044-2.32-2.32-2.32-1.275 0-2.318 1.04-2.318 2.32v9.275h-4.638v-9.275c0-1.28-1.04-2.32-2.32-2.32-1.28 0-2.318 1.04-2.318 2.32v9.275H75.77v-9.28c0-1.28-1.04-2.32-2.32-2.32-1.28 0-2.318 1.04-2.318 2.32v9.276h-4.638V44.93c0-1.28-1.038-2.32-2.318-2.32s-2.32 1.04-2.32 2.32v9.275H57.22V44.93c0-1.28-1.04-2.32-2.32-2.32s-2.32 1.04-2.32 2.32v9.274h-2.316c-1.28 0-2.32 1.038-2.32 2.318v2.32H38.67c-1.28 0-2.318 1.038-2.318 2.318s1.038 2.318 2.318 2.318h9.276v4.638H38.67c-1.28 0-2.318 1.04-2.318 2.32 0 1.28 1.038 2.318 2.318 2.318h9.276v4.637H38.67c-1.28 0-2.318 1.04-2.318 2.32 0 1.28 1.038 2.32 2.318 2.32h9.276v4.64H38.67c-1.28 0-2.318 1.04-2.318 2.32 0 1.28 1.038 2.317 2.318 2.317h9.276v4.638H38.67c-1.28 0-2.318 1.044-2.318 2.32 0 1.274 1.038 2.318 2.318 2.318h9.276v4.638H38.67c-1.28 0-2.318 1.045-2.318 2.32 0 1.276 1.038 2.32 2.318 2.32h9.276v4.64H38.67c-1.28 0-2.318 1.04-2.318 2.317 0 1.275 1.038 2.318 2.318 2.318h9.276v4.64H38.67c-1.28 0-2.318 1.043-2.318 2.32 0 1.273 1.038 2.317 2.318 2.317h9.276v2.32c0 1.274 1.04 2.318 2.32 2.318h2.317v9.275c0 1.275 1.04 2.32 2.32 2.32 1.28 0 2.318-1.045 2.318-2.32v-9.275h4.64v9.275c0 1.275 1.04 2.32 2.32 2.32s2.32-1.045 2.32-2.32v-9.275h4.638v9.275c0 1.275 1.04 2.32 2.32 2.32 1.28 0 2.318-1.045 2.318-2.32v-9.275h4.637v9.275c0 1.275 1.04 2.32 2.32 2.32s2.32-1.045 2.32-2.32v-9.275h4.636v9.275c0 1.275 1.042 2.32 2.32 2.32 1.273 0 2.317-1.045 2.317-2.32v-9.275h4.637v9.275c0 1.275 1.045 2.32 2.32 2.32s2.32-1.045 2.32-2.32v-9.275h4.637v9.275c0 1.275 1.044 2.32 2.32 2.32 1.275 0 2.32-1.045 2.32-2.32v-9.275h4.636v9.275c0 1.275 1.045 2.32 2.32 2.32 1.276 0 2.32-1.045 2.32-2.32v-9.275h2.318c1.276 0 2.32-1.044 2.32-2.32v-2.318h9.275c1.274 0 2.317-1.045 2.317-2.32s-1.042-2.32-2.317-2.32h-9.277v-4.64h9.276c1.273 0 2.316-1.04 2.316-2.316 0-1.276-1.042-2.32-2.317-2.32h-9.277v-4.637h9.277c1.276 0 2.32-1.043 2.32-2.32s-1.043-2.32-2.318-2.32h-9.276v-4.637h9.276c1.275 0 2.318-1.044 2.318-2.32 0-1.274-1.042-2.318-2.317-2.318h-9.277V91.31h9.276c1.274 0 2.317-1.038 2.317-2.318s-1.044-2.32-2.32-2.32h-9.275v-4.637h9.276c1.276 0 2.32-1.04 2.32-2.32 0-1.28-1.043-2.318-2.318-2.318h-9.275V72.76h9.276zm-23.19 44.058c0 1.275-1.042 2.318-2.318 2.318H64.178c-1.28 0-2.32-1.043-2.32-2.318V70.44c0-1.28 1.04-2.318 2.32-2.318h46.376c1.276 0 2.32 1.04 2.32 2.32v46.376z" id="diagram-sw"/><path d="M108.278 65.717c-1.32 0-2.573.21-3.84.388-4.86-8.59-13.847-14.33-24.046-14.33-10.415 0-19.402 5.806-24.194 14.29-1.227-.164-2.452-.348-3.69-.348-15.373 0-27.887 12.506-27.887 27.885 0 15.387 12.52 27.886 27.89 27.886h55.77c15.374 0 27.888-12.5 27.888-27.886 0-15.38-12.514-27.885-27.886-27.885zm0 41.828h-55.77c-7.693 0-13.944-6.256-13.944-13.943 0-7.645 6.766-13.54 13.956-13.752.028 3.29.6 6.516 1.742 9.565l13.06-4.888c-.587-1.544-.872-3.185-.872-4.867 0-7.687 6.25-13.943 13.942-13.943 4.508 0 8.593 2.233 11.152 5.712-6.727 5.09-11.152 13.09-11.152 22.17h13.943c0-7.69 6.25-13.945 13.943-13.945 7.692 0 13.943 6.256 13.943 13.942s-6.25 13.942-13.94 13.942z" fill="#010101" id="diagram-cloud"/><path d="M124.43 46.652c-.07-2.23-1.943-4.037-4.176-4.037h-9.773s-23.56.524-31.42.52c-7.19-.007-28.754-.52-28.754-.52H40.53c-2.232 0-4.107 1.808-4.176 4.037-.072 2.237 1.698 4.06 3.944 4.06h3.058c.963 5.987 8.793 54.57 12.148 71.708.53 2.7 2.134 5.85 4.943 6.154 1.506.39 8.56 2.073 18.68 2.073 10.334 0 19.235-1.746 20.77-2.064 2.85-.247 4.49-3.428 5.034-6.153 3.438-17.2 11.51-65.79 12.498-71.716h3.063c2.244 0 4.015-1.825 3.944-4.062zm-20.523 4.222l-2.05 2.724c-.75-.87-1.502-1.753-2.253-2.643l4.303-.08zm-12.307.683c2.02 2.61 4.058 5.132 6.112 7.57l-1.15 1.538c-2.04 2.727-4.073 5.447-6.118 8.137-2.157-2.592-4.215-5.198-6.17-7.768 2.412-3.004 4.852-6.16 7.326-9.477zm-15.54 34.86c-2.182 2.406-4.413 4.72-6.708 6.92-2.328-2.552-4.628-5.175-6.9-7.87 2.314-2.21 4.54-4.498 6.68-6.828 2.232 2.623 4.543 5.222 6.927 7.772zM73.79 73.36l.343-.407c2.064-2.28 4.14-4.662 6.233-7.156 2.113 2.52 4.212 4.93 6.298 7.232l.274.322c-2.16 2.77-4.348 5.485-6.572 8.12-2.227-2.634-4.414-5.348-6.575-8.117zm6.575 17.51c2.29 2.292 4.642 4.53 7.07 6.69-2.33 2.443-4.686 4.817-7.07 7.124-2.386-2.307-4.744-4.68-7.073-7.122 2.427-2.16 4.78-4.4 7.073-6.693zm4.307-4.455c2.384-2.55 4.695-5.15 6.928-7.777 2.138 2.328 4.364 4.616 6.676 6.827-2.27 2.693-4.57 5.315-6.898 7.867-2.295-2.198-4.526-4.512-6.706-6.918zm-6.197-35.18c1.35.003 3.137-.01 5.18-.032-.433.607-.862 1.205-1.288 1.794-.65.91-1.32 1.838-2 2.773-.68-.934-1.354-1.862-2.005-2.772-.42-.58-.842-1.17-1.27-1.766.503.003.968.005 1.383.005zm-9.343.32c2.476 3.32 4.915 6.474 7.324 9.478-1.954 2.57-4.013 5.177-6.17 7.77-2.046-2.69-4.08-5.412-6.118-8.14l-1.15-1.536c2.056-2.437 4.095-4.958 6.114-7.57zm-8.026-.58c-.745.883-1.49 1.758-2.236 2.622l-2.037-2.71c1.34.03 2.784.058 4.273.088zm-11.916 1.44c1.532 2.195 3.127 4.446 4.774 6.727-1.032 1.138-2.064 2.257-3.098 3.362-.705-4.22-1.285-7.723-1.676-10.09zm5.02 32.85l-.425-2.327.97 1.715-.545.612zm-1.936-14.358c1.956-1.977 3.897-4.02 5.82-6.142 2.334 3.113 4.77 6.257 7.31 9.386-2.254 2.36-4.502 4.596-6.752 6.718-2.023-2.507-6.253-9.216-6.378-9.957zm5.49 31.98c-.65-3.675-1.324-7.556-2-11.478.637-.528 1.27-1.05 1.895-1.59 2.34 2.662 4.72 5.22 7.102 7.67-2.257 1.92-4.588 3.723-7.002 5.393zm3.975 17.767s-.3.398-.57.68c-.02-.08-.04-.155-.054-.23-.383-1.906-.824-4.226-1.31-6.846 1.537 1.445 3.086 2.87 4.647 4.275-.92.724-1.83 1.432-2.72 2.12zm4.81 2.96c.64-.505 1.28-1.013 1.92-1.526.8.696 1.6 1.39 2.41 2.077-1.64-.163-3.09-.356-4.33-.552zm2.64-8.853c-2.62-2.53-5.198-5.112-7.738-7.752 2.49-1.76 4.91-3.618 7.27-5.55 2.535 2.473 5.067 4.83 7.573 7.076-1.767 1.633-3.55 3.23-5.345 4.79-.592.486-1.18.967-1.765 1.442zm11.7 9.8c-.346.007-.695.01-1.044.015-2.32-2.03-4.614-4.1-6.876-6.213.758-.644 1.514-1.293 2.267-1.95 1.683-1.382 3.393-2.82 5.125-4.305 1.745 1.5 3.47 2.947 5.166 4.342.74.642 1.48 1.277 2.223 1.91-2.256 2.107-4.543 4.172-6.86 6.2zm9.22-.62c.72-.61 1.433-1.23 2.147-1.85.566.458 1.135.91 1.705 1.36-1.136.165-2.432.335-3.85.49zm1.424-9.176c-.57-.46-1.146-.93-1.722-1.406-1.808-1.573-3.604-3.178-5.383-4.823 2.505-2.244 5.036-4.602 7.57-7.074 2.36 1.93 4.78 3.79 7.27 5.55-2.54 2.64-5.117 5.226-7.734 7.755zm7.786 6.315c-.185-.22-.334-.42-.334-.42-.893-.69-1.8-1.397-2.72-2.12 1.452-1.308 2.896-2.633 4.327-3.976-.47 2.48-.9 4.687-1.273 6.514zm3.456-18.32c-2.348-1.633-4.617-3.394-6.815-5.266 2.386-2.45 4.764-5.003 7.11-7.67.58.5 1.167.99 1.757 1.48-.694 3.913-1.385 7.784-2.05 11.457zm3.096-17.49l-.545-.613.97-1.715-.425 2.328zm-3.8-4.402c-2.25-2.122-4.497-4.356-6.75-6.71 2.54-3.13 4.977-6.276 7.312-9.39 1.906 2.105 3.83 4.13 5.77 6.092-.138.793-4.34 7.536-6.333 10.006zm7.775-18.37c-1.03-1.102-2.058-2.216-3.085-3.35 1.666-2.303 3.276-4.577 4.823-6.794-.405 2.366-1.008 5.89-1.74 10.144z" id="diagram-bin"/><path d="M114.31 61.395L98.25 45.298c-1.713-1.717-4.04-2.683-6.465-2.683h-46.3c-5.044 0-9.133 4.09-9.133 9.133v72.49c0 5.044 4.09 9.133 9.132 9.133h62.36c5.043 0 9.133-4.084 9.133-9.13V67.848c-.002-2.418-.96-4.737-2.667-6.45zm-6.467 62.844h-62.36V51.743h46.303l16.058 16.098v56.393zM54.875 55.475c-2.522 0-4.566 2.045-4.566 4.566V72.03c0 2.522 2.04 4.567 4.56 4.567 2.523 0 4.567-2.045 4.567-4.567V60.043c0-2.52-2.044-4.566-4.566-4.566zm13.89 0c-2.522 0-4.567 2.045-4.567 4.566V72.03c0 2.522 2.045 4.567 4.567 4.567 2.522 0 4.566-2.045 4.566-4.567V60.043c0-2.52-2.04-4.566-4.56-4.566zm13.888 0c-2.52 0-4.566 2.045-4.566 4.566V72.03c0 2.522 2.045 4.567 4.566 4.567 2.522 0 4.567-2.045 4.567-4.567V60.043c0-2.52-2.045-4.566-4.567-4.566zm13.89 21.12c2.522 0 4.567-2.044 4.567-4.566v-3.99c0-2.522-2.045-4.567-4.567-4.567-2.522 0-4.566 2.045-4.566 4.567v3.995c0 2.524 2.044 4.57 4.566 4.57z" id="diagram-cache"/><path d="M127.128 135.19H36.996V45.056h90.132v90.132zm-82.774-7.36h75.416V52.416H44.354v75.416zm20.233-53.342h7.358v57.022h-7.358zM40.675 68.97h82.774v7.357H40.67zM66.427 98.4h57.022v7.358H66.422z" id="diagram-template"/><path d="M36.352 68.593v55.405c0 7.533 6.1 13.633 13.627 13.633h64.15c7.532 0 13.64-6.094 13.64-13.63V68.595c0-7.523-6.107-13.626-13.64-13.626h-2.796v-8.202c0-2.293-1.86-4.15-4.15-4.15s-4.155 1.857-4.155 4.15v16.7c0 2.05-1.657 3.705-3.703 3.705-2.037 0-3.687-1.656-3.687-3.704v-8.5h-7.19v-8.2c0-2.294-1.86-4.15-4.15-4.15-2.3 0-4.15 1.856-4.15 4.15v16.7c0 2.048-1.65 3.704-3.703 3.704-2.037 0-3.688-1.658-3.688-3.706v-8.5h-7.1v-8.2c0-2.294-1.865-4.15-4.15-4.15-2.3 0-4.156 1.856-4.156 4.15v16.7c0 2.048-1.652 3.704-3.7 3.704-2.042 0-3.693-1.657-3.693-3.705v-8.5c-7.515.01-13.61 6.105-13.61 13.627zm81.503 53.72c0 2.425-1.966 4.39-4.39 4.39h-62.23c-2.424 0-4.395-1.965-4.395-4.39v-35.72h71.015v35.723zm-4.947-29.247v5.54h-3.218v22.145h-5.42V98.61h-3.207v-5.54h11.845m-13.08 0v27.685h-4.752l-2.82-12.585v12.586h-4.53v-27.69h4.53l3.04 12.467V93.066h4.53m-23.07 0h9.037v5.54h-3.618v5.25h3.387v5.267h-3.387v6.087h3.98v5.54h-9.4V93.067m-.927 0l-2.755 27.685h-8.228l-3.128-27.684h5.716c.66 7.626 1.133 14.073 1.417 19.34.283-5.324.58-10.055.888-14.193l.373-5.147h5.72m-23.843 0h9.04v5.54h-3.62v5.25h3.387v5.267H57.41v6.087h3.977v5.54h-9.4V93.067" id="diagram-event"/></defs></svg>

<div class="diagram-container" style="padding-top: 63%"><svg viewBox="0 0 549.92853 342.97787"><g transform="translate(-36.352 -42.615)"><text x="100.277" y="188.362" class="label">ServiceWorker</text><text x="315.902" y="189.362" class="label">install</text><text x="538" y="186.362" class="label">activate</text><text y="379.362" x="216.277" class="label">Cache</text><text x="426.277" y="381.362" class="label">Network</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(10 9)"/><use transform="translate(236 13)" height="342.978" width="549.929" xlink:href="#diagram-event"/><use xlink:href="#diagram-event" width="549.929" height="342.978" transform="translate(456 13)"/><use transform="translate(343 209)" height="342.978" width="549.929" xlink:href="#diagram-network"/><use xlink:href="#diagram-cache" width="549.929" height="342.978" transform="translate(139 209)"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M159 105.362h99"/><path d="M248.617 100.633l10.898 4.51-10.857 5"/></g><text x="208.128" y="96.32" class="fade-in state-label">1</text></g><g class="anim"><g class="joiner"><path d="M372.872 129.49s105.32 29.255 76.064 119.15"/></g><g class="joiner"><path d="M372.872 136.937s94.68 27.66 69.68 109.042"/></g><g class="joiner"><path d="M371.29 144.396s89.343 27.658 63.812 101.063l-3.8-6.91"/></g><g class="joiner"><path d="M372.34 122.043s116.49 28.723 82.98 130.32l6.313-2.927"/></g><text x="410.128" y="204.32" class="fade-in state-label">2</text></g><g class="anim"><text y="270.32" x="318.128" class="fade-in state-label">3</text><g class="joiner"><path d="M373.795 292.362s-34.134-1.255-52.1-1.255S266 292.362 266 292.362"/></g><g class="joiner"><path d="M373.795 298.362s-34.134 1.38-52.1 1.38-55.695-1.38-55.695-1.38"/></g><g class="joiner"><path d="M373.795 286.362s-34.134-4-52.1-4-55.695 4-55.695 4l5.37-5.81"/></g><g class="joiner"><path d="M373.795 304.362s-34.134 4-52.1 4-55.695-4-55.695-4l5.535 6.244"/></g></g><g class="anim"><text y="96.32" x="428.128" class="fade-in state-label">4</text><g class="joiner"><path d="M372 103.362h108"/><path d="M468.617 98.633l10.898 4.51-10.857 5"/></g></g></g></g></svg></div>

ServiceWorker gives you an install event. You can use this to get stuff ready, stuff that must be ready before you handle other events. While this happens any previous version of your ServiceWorker is still running & serving pages, so the things you do here mustn't disrupt that.

**Ideal for:** CSS, images, fonts, JS, templates… basically anything you'd consider static to that "version" of your site.

These are things that would make your site entirely non-functional if they failed to fetch, things an equivalent native-app would make part of the initial download.

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async function () {
      const cache = await caches.open('mysite-static-v3');
      await cache.addAll([
        '/css/whatever-v3.css',
        '/css/imgs/sprites-v6.png',
        '/css/fonts/whatever-v8.woff',
        '/js/all-min-v4.js',
        // etc
      ]);
    })(),
  );
});
```

`event.waitUntil` takes a promise to define the length & success of the install. If the promise rejects, the installation is considered a failure and this ServiceWorker will be abandoned (if an older version is running, it'll be left intact). `caches.open` and `cache.addAll` return promises. If any of the resources fail to fetch, the `cache.addAll` call rejects.

On [trained-to-thrill](https://jakearchibald.github.io/trained-to-thrill/) I use this to [cache static assets](https://github.com/jakearchibald/trained-to-thrill/blob/3291dd40923346e3cc9c83ae527004d502e0464f/www/static/js-unmin/sw/index.js#L3).

## On install - not as a dependency

<div class="diagram-container" style="padding-top: 63%"><svg viewBox="0 0 549.92853 342.97787"><g transform="translate(-36.352 -42.615)"><text x="100.277" y="188.362" class="label">ServiceWorker</text><text x="315.902" y="189.362" class="label">install</text><text x="538" y="186.362" class="label">activate</text><text y="379.362" x="216.277" class="label">Cache</text><text x="426.277" y="381.362" class="label">Network</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(10 9)"/><use transform="translate(236 13)" height="342.978" width="549.929" xlink:href="#diagram-event"/><use xlink:href="#diagram-event" width="549.929" height="342.978" transform="translate(456 13)"/><use transform="translate(343 209)" height="342.978" width="549.929" xlink:href="#diagram-network"/><use xlink:href="#diagram-cache" width="549.929" height="342.978" transform="translate(139 209)"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M159 105.362h99"/><path d="M248.617 100.633l10.898 4.51-10.857 5"/></g><text x="208.128" y="96.32" class="fade-in state-label">1</text></g><g class="anim"><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M372.872 129.49s105.32 29.255 76.064 119.15"/></g><g class="joiner"><path d="M372.872 136.937s94.68 27.66 69.68 109.042"/></g><g class="joiner"><path d="M371.29 144.396s89.343 27.658 63.812 101.063l-3.8-6.91"/></g><g class="joiner"><path d="M372.34 122.043s116.49 28.723 82.98 130.32l6.313-2.927"/></g><text x="410.128" y="204.32" class="fade-in state-label">2</text></g><g class="anim"><text y="270.32" x="318.128" class="fade-in state-label">3</text><g class="joiner"><path d="M373.795 292.362s-34.134-1.255-52.1-1.255S266 292.362 266 292.362"/></g><g class="joiner"><path d="M373.795 298.362s-34.134 1.38-52.1 1.38-55.695-1.38-55.695-1.38"/></g><g class="joiner"><path d="M373.795 286.362s-34.134-4-52.1-4-55.695 4-55.695 4l5.37-5.81"/></g><g class="joiner"><path d="M373.795 304.362s-34.134 4-52.1 4-55.695-4-55.695-4l5.535 6.244"/></g></g></g><g class="anim"><text class="fade-in state-label" x="428.128" y="96.32">2</text><g class="joiner"><path d="M372 103.362h108"/><path d="M468.617 98.633l10.898 4.51-10.857 5"/></g></g></g></g></g></svg></div>

Similar to above, but won't delay install completing and won't cause installation to fail if caching fails.

**Ideal for:** Bigger resources that aren't needed straight away, such as assets for later levels of a game.

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async function () {
      const cache = await caches.open('mygame-core-v1');
      cache
        .addAll
        // levels 11-20
        ();
      await cache
        .addAll
        // core assets & levels 1-10
        ();
    })(),
  );
});
```

We're not awaiting the `cache.addAll` promise for levels 11-20, so even if it fails, the game will still be available offline. Of course, you'll have to cater for the possible absence of those levels & reattempt caching them if they're missing.

The ServiceWorker may be killed while levels 11-20 download since it's finished handling events, meaning they won't be cached. In future we plan to add a background downloading API to handle cases like this, and larger downloads such as movies.

## On activate

<div class="diagram-container" style="padding-top: 63%"><svg viewBox="0 0 549.92853 342.97787"><g transform="translate(-36.352 -42.615)"><text x="100.277" y="188.362" class="label">ServiceWorker</text><text x="315.902" y="189.362" class="label">install</text><text x="538" y="186.362" class="label">activate</text><text y="379.362" x="216.277" class="label">Deleted!!</text><text x="424.277" y="381.362" class="label">Cache</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(10 9)"/><use transform="translate(236 13)" height="342.978" width="549.929" xlink:href="#diagram-event"/><use xlink:href="#diagram-event" width="549.929" height="342.978" transform="translate(456 13)"/><use transform="translate(347 209)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><use xlink:href="#diagram-bin" width="549.929" height="342.978" transform="translate(135 209)"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M159 105.362h99"/><path d="M248.617 100.633l10.898 4.51-10.857 5"/></g><text x="208.128" y="96.32" class="fade-in state-label">1</text></g><g class="anim"><text class="fade-in state-label" x="428.128" y="96.32">2</text><g class="joiner"><path d="M372 103.362h108"/><path d="M468.617 98.633l10.898 4.51-10.857 5"/></g></g><g class="anim"><g class="joiner"><path d="M481.872 127.937c-45 0-61.566 28.956-60.566 112.34"/><path d="M416.588 232.76l4.925 10.583 5.108-11.08"/></g><text x="445.128" y="193.32" class="fade-in state-label">3</text></g><g class="anim"><text y="263.334" x="342.301" class="fade-in state-label">4</text><g class="joiner"><path d="M373.795 286.362c-54.104 1.072-78.643-100.474-128.02-101.53-49.38-1.053-49.414 57.604-49.414 57.604l-4.807-6.882"/></g><g class="joiner"><path d="M373.795 304.362c-61.068 1.607-100.07-101.01-128.557-100.457-28.486.552-29.593 39.925-29.593 39.925l5.37-6.882"/></g><g class="joiner"><path d="M373.795 298.362c-59.997 0-92.57-100.474-128.02-100.993-35.452-.52-36.558 47.423-36.558 47.423"/></g><g class="joiner"><path d="M373.795 292.362c-57.318.536-84.536-100.474-128.02-100.993-43.487-.52-42.986 53.316-42.986 53.316"/></g></g></g></g></svg></div>

**Ideal for:** Clean-up & migration.

Once a new ServiceWorker has installed & a previous version isn't being used, the new one activates, and you get an `activate` event. Because the old version is out of the way, it's a good time to handle schema migrations in IndexedDB and also delete unused caches.

```js
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async function () {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Return true if you want to remove this cache,
            // but remember that caches are shared across
            // the whole origin
          })
          .map((cacheName) => caches.delete(cacheName)),
      );
    })(),
  );
});
```

During activation, other events such as `fetch` are put into a queue, so a long activation could potentially block page loads. Keep your activation as lean as possible, only use it for things you _couldn't_ do while the old version was active.

On [trained-to-thrill](https://jakearchibald.github.io/trained-to-thrill/) I use this to [remove old caches](https://github.com/jakearchibald/trained-to-thrill/blob/3291dd40923346e3cc9c83ae527004d502e0464f/www/static/js-unmin/sw/index.js#L17).

## On user interaction

<div class="diagram-container" style="padding-top: 28%"><svg viewBox="0 0 549.92853 150"><g transform="translate(-36.352 -235.593)"><text x="88.692" y="369.362" class="label">Page</text><text x="233.902" y="370.362" class="label">click</text><text x="390" y="371.362" class="label">Network</text><text x="544.326" y="373.177" class="label">Cache</text><use xlink:href="#diagram-page" width="549.929" height="342.978" transform="translate(-32.697 164.731)"/><use transform="translate(154 194)" height="342.978" width="549.929" xlink:href="#diagram-event"/><use xlink:href="#diagram-network" width="549.929" height="342.978" transform="translate(308 198)"/><use transform="translate(467.049 200.815)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M142.126 286.362h37.956"/><path d="M172.188 281.633l10.898 4.51-10.857 5"/></g><text x="160.128" y="96.32" class="fade-in state-label" transform="translate(0 181)">1</text></g><g class="anim"><text class="fade-in state-label" x="382.572" y="83.597" transform="translate(0 181) translate(-70.315 1.985)">2</text><g class="joiner"><path d="M286.677 275.67l50.057.46-4.882-3.546"/></g><g class="joiner"><path d="M286.677 293.67l50.057.46-5.256 3.436"/></g><g class="joiner"><path d="M286.677 287.67l50.057.46"/></g><g class="joiner"><path d="M286.677 281.67l50.057.46"/></g></g><g class="anim"><text y="83.597" x="382.572" class="fade-in state-label" transform="translate(0 181) translate(85.685 1.985)">3</text><g class="joiner"><path d="M442.677 275.67l50.057.46-4.882-3.546"/></g><g class="joiner"><path d="M442.677 293.67l50.057.46-5.256 3.436"/></g><g class="joiner"><path d="M442.677 287.67l50.057.46"/></g><g class="joiner"><path d="M442.677 281.67l50.057.46"/></g></g></g></g></svg></div>

**Ideal for**: If the whole site can't be taken offline, you may allow the user to select the content they want available offline. E.g. a video on something like YouTube, an article on Wikipedia, a particular gallery on Flickr.

Give the user a "Read later" or "Save for offline" button. When it's clicked, fetch what you need from the network & pop it in the cache.

```js
document
  .querySelector('.cache-article')
  .addEventListener('click', async (event) => {
    event.preventDefault();

    const id = this.dataset.articleId;
    const cache = await caches.open('mysite-article-' + id);
    const response = await fetch('/get-article-urls?id=' + id);
    const urls = await response.json();
    await cache.addAll(urls);
  });
```

The caches API is available from pages as well as service workers, meaning you don't need to involve the service worker to add things to the cache.

## On network response

<div class="diagram-container" style="padding-top: 49%"><svg viewBox="0 0 549.92853 265"><g transform="translate(-36.352 -120.593)"><text x="248.603" y="384.105" class="label">ServiceWorker</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(160.325 204.743)"/><text x="89.548" y="252.972" class="label">Page</text><use transform="translate(-31.309 48.726)" height="342.978" width="549.929" xlink:href="#diagram-page"/><text x="537.439" y="383.491" class="label">Network</text><use xlink:href="#diagram-network" width="549.929" height="342.978" transform="translate(455.439 210.129)"/><text x="400.625" y="253.272" class="label">Cache</text><use transform="translate(323.347 80.91)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M125.228 217.424c-.572 41.786 20.007 74.986 60.648 75.56"/><path d="M177.64 287.113l10.897 5.65-10.857 5.002"/></g><text x="168.128" y="196.32" class="fade-in state-label" transform="translate(-33.772 202.062) translate(0 -90)">1</text></g><g class="anim"><g class="joiner"><path d="M304.587 319.783c42.535 26.945 131.032 32.45 186.58 10.876"/><path d="M480.67 328.615l12.032 1.294-8.38 8.604"/></g><text class="fade-in state-label" y="201.45" x="213.165" transform="translate(-33.772 202.062) translate(220 -30)">2</text></g><g class="anim"><g class="joiner"><path d="M485.305 298.69c-256.192-4.98-84.462-128.887-340.756-128.798"/><path d="M152.65 164.397l-9.692 5.7 9.692 5.132"/></g><text x="116.819" y="71.469" class="fade-in state-label" transform="translate(-33.772 202.062) translate(210.879 -89.29)">3</text><g class="joiner"><path d="M485.306 298.69c-119.805-2.33-146.03-30.666-166.21-60.167-22.97-33.584-7.32-70.388 30.117-70.34"/><path d="M340.78 164.397l9.692 4.56-10.262 4.562"/></g></g></g></g></svg></div>

**Ideal for**: Frequently updating resources such as a user's inbox, or article contents. Also useful for non-essential content such as avatars, but care is needed.

If a request doesn't match anything in the cache, get it from the network, send it to the page & add it to the cache at the same time.

If you do this for a range of URLs, such as avatars, you'll need to be careful you don't bloat the storage of your origin — if the user needs to reclaim disk space you don't want to be the prime candidate. Make sure you get rid of items in the cache you don't need any more.

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async function () {
      const cache = await caches.open('mysite-dynamic');
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;
      const networkResponse = await fetch(event.request);
      event.waitUntil(cache.put(event.request, networkResponse.clone()));
      return networkResponse;
    })(),
  );
});
```

To allow for efficient memory usage, you can only read a response/request's body once. In the code above, [`.clone()`](https://fetch.spec.whatwg.org/#dom-request-clone) is used to create additional copies that can be read separately.

On [trained-to-thrill](https://jakearchibald.github.io/trained-to-thrill/) I use this to [cache Flickr images](https://github.com/jakearchibald/trained-to-thrill/blob/3291dd40923346e3cc9c83ae527004d502e0464f/www/static/js-unmin/sw/index.js#L109).

## Stale-while-revalidate

<div class="diagram-container" style="padding-top: 49%"><svg viewBox="0 0 549.92853 265"><g transform="translate(-36.352 -120.593)"><text x="248.603" y="384.105" class="label">ServiceWorker</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(160.325 204.743)"/><text x="89.548" y="252.972" class="label">Page</text><use transform="translate(-31.309 48.726)" height="342.978" width="549.929" xlink:href="#diagram-page"/><text x="537.439" y="383.491" class="label">Network</text><use xlink:href="#diagram-network" width="549.929" height="342.978" transform="translate(455.439 210.129)"/><text x="400.625" y="253.272" class="label">Cache</text><use transform="translate(323.347 80.91)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M125.228 217.424c-.572 41.786 20.007 74.986 60.648 75.56"/><path d="M177.64 287.113l10.897 5.65-10.857 5.002"/></g><text x="189.791" y="151.852" class="fade-in state-label" transform="translate(-33.772 202.062) translate(0 -90)">1</text></g><g class="anim"><g class="joiner"><path d="M306.297 294.13c53.367 3.57 53.5-42.803 58.308-70.08"/><path d="M358.1 231.7l6.902-10.108 3.593 12.025"/></g><text class="fade-in state-label" y="91.993" x="145.324" transform="translate(-33.772 202.062) translate(220 -30)">2</text></g><g class="anim"><g class="joiner"><path d="M349.054 172.7c-48.11-26.075-154.585-24.56-198.804-3.377"/><path d="M156.36 160.117l-9.12 9.69 11.97 1.712"/></g><text x="145.324" y="91.993" class="fade-in state-label" transform="translate(-33.772 202.062) translate(129.355 -98.981)">3</text></g><g class="anim"><g class="joiner"><path d="M305.727 320.923c63.06 22.954 117.92 22.76 182.588 6.315"/><path d="M477.033 324.593l15.393 1.14-11.972 9.692"/></g><text x="215.445" y="131.329" class="fade-in state-label" transform="translate(-33.772 202.062) translate(219.43 -3.206)">4</text></g><g class="anim"><g class="joiner"><path d="M534.613 243.64c-1.14-30.785-30.215-70.12-83.804-70.69"/><path d="M459.93 167.248l-11.4 6.27 11.4 5.132"/></g><text class="fade-in state-label" y="149.572" x="215.445" transform="translate(-33.772 202.062) translate(312.925 -130.336)">5</text></g></g></g></svg></div>

**Ideal for**: Frequently updating resources where having the very latest version is non-essential. Avatars can fall into this category.

If there's a cached version available, use it, but fetch an update for next time.

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async function () {
      const cache = await caches.open('mysite-dynamic');
      const cachedResponse = await cache.match(event.request);
      const networkResponsePromise = fetch(event.request);

      event.waitUntil(
        (async function () {
          const networkResponse = await networkResponsePromise;
          await cache.put(event.request, networkResponse.clone());
        })(),
      );

      // Returned the cached response if we have one, otherwise return the network response.
      return cachedResponse || networkResponsePromise;
    })(),
  );
});
```

This is very similar to HTTP's [stale-while-revalidate](https://www.mnot.net/blog/2007/12/12/stale).

## On push message

<div class="diagram-container" style="padding-top: 63%"><svg viewBox="0 0 549.92853 342.97787"><g transform="translate(-36.352 -42.615)"><text x="100.277" y="188.362" class="label">Push Message</text><text x="321.902" y="189.362" class="label">ServiceWorker</text><text x="538" y="186.362" class="label">Network</text><text y="379.362" x="216.277" class="label">Notification</text><text x="424.277" y="381.362" class="label">Cache</text><use xlink:href="#diagram-cloud" width="549.929" height="342.978" transform="translate(16.971 15.971)"/><use transform="translate(233.286 11.257)" height="342.978" width="549.929" xlink:href="#diagram-sw"/><use xlink:href="#diagram-network" width="549.929" height="342.978" transform="translate(454.257 13)"/><use transform="translate(347 209)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><use xlink:href="#diagram-notification" width="549.929" height="342.978" transform="translate(135 209)"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M154.643 84.45h103"/><path d="M248.26 79.72l10.9 4.51-10.858 5"/></g><text x="218.128" y="94.32" class="fade-in state-label" transform="translate(-6.971 127.219) translate(-1.386 -148.131)">1</text></g><g class="anim"><text class="fade-in state-label" x="358.572" y="83.597" transform="translate(-6.971 127.219) translate(81.772 -141.141)">2</text><g class="joiner"><path d="M379.793 78.763l102.057.46-4.882-3.546"/></g><g class="joiner"><path d="M379.793 96.763l102.057.46-5.256 3.436"/></g><g class="joiner"><path d="M379.793 90.763l102.057.46"/></g><g class="joiner"><path d="M379.793 84.763l102.057.46"/></g></g><g class="anim"><g class="joiner"><path d="M487.095 112.714c-87.967 6.467-78.01 129.51-78.01 129.51l-5.228-6.838"/></g><g class="joiner"><path d="M495.443 130.41c-75.546 1.314-68.358 111.813-68.358 111.813l4.022-6.434"/></g><g class="joiner"><path d="M492.258 124.78c-78.995 1.655-71.173 117.443-71.173 117.443"/></g><g class="joiner"><path d="M489.073 118.747c-82.676 3.836-73.988 123.476-73.988 123.476"/></g><text y="191.776" x="455.732" class="fade-in state-label" transform="translate(-6.971 127.219) translate(7.441 -127.441)">3</text></g><g class="anim"><text class="fade-in state-label" y="145.264" x="219.272" transform="translate(-6.971 127.219) translate(-10.978 -84.94)">4</text><g class="joiner"><path d="M262.968 124.172c-57.24 1.717-45.827 116.772-45.827 116.772"/><path d="M211.077 231.84l5.724 11.448 5.154-11.448"/></g></g></g></g></svg></div>

The [Push API](https://w3c.github.io/push-api/) is another feature built on top of ServiceWorker. This allows the ServiceWorker to be awoken in response to a message from the OS's messaging service. This happens even when the user doesn't have a tab open to your site, only the ServiceWorker is woken up. You request permission to do this from a page & the user will be prompted.

**Ideal for**: Content relating to a notification, such as a chat message, a breaking news story, or an email. Also infrequently changing content that benefits from immediate sync, such as a todo list update or a calendar alteration.

The common final outcome is a notification which, when tapped, opens/focuses a relevant page, but updating caches before this happens is _extremely_ important. The user is obviously online at the time of receiving the push message, but they may not be when they finally interact with the notification, so making this content available offline is important. The Twitter native app, which is for the most part an excellent example of offline-first, gets this a bit wrong:

<figure class="full-figure">
<div class="video" style="padding-top:100%"><iframe src="//www.youtube.com/embed/0i7YdSEQI1w?rel=0&amp;html5=1" frameborder="0" allowfullscreen></iframe></div>
<figcaption>Twitter notification while offline</figcaption>
</figure>

Without a connection, Twitter fails to provide the content relating to the push message. Tapping it does remove the notification however, leaving the user with less information than before they tapped. Don't do this!

This code updates caches before showing a notification:

```js
self.addEventListener('push', (event) => {
  if (event.data.text() == 'new-email') {
    event.waitUntil(async function() {
      const cache = await caches.open('mysite-dynamic');
      const response = await fetch('/inbox.json');
      await cache.put('/inbox.json', response.clone());
      const emails = await response.json();
      registration.showNotification("New email", {
        body: "From " + emails[0].from.name
        tag: "new-email"
      });
    }());
  }
});

self.addEventListener('notificationclick', function(event) {
  if (event.notification.tag == 'new-email') {
    // Assume that all of the resources needed to render
    // /inbox/ have previously been cached, e.g. as part
    // of the install handler.
    new WindowClient('/inbox/');
  }
});
```

## On background-sync

<div class="diagram-container" style="padding-top: 28%"><svg viewBox="0 0 583.92999 160"><g transform="translate(-36.352 -225.593)"><text x="106.692" y="367.362" class="label">ServiceWorker</text><text x="251.902" y="368.362" class="label">sync</text><text x="408" y="369.362" class="label">Network</text><text x="562.326" y="371.177" class="label">Cache</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(19.106 188.308)"/><use transform="translate(172 188)" height="342.978" width="549.929" xlink:href="#diagram-event"/><use xlink:href="#diagram-network" width="549.929" height="342.978" transform="translate(326 192)"/><use transform="translate(485.049 194.815)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M160.126 280.362h37.956"/><path d="M190.188 275.633l10.898 4.51-10.857 5"/></g><text x="160.128" y="96.32" class="fade-in state-label" transform="translate(18 175)">1</text></g><g class="anim"><text class="fade-in state-label" x="382.572" y="83.597" transform="translate(18 175) translate(-70.315 1.985)">2</text><g class="joiner"><path d="M304.677 269.67l50.057.46-4.882-3.546"/></g><g class="joiner"><path d="M304.677 287.67l50.057.46-5.256 3.436"/></g><g class="joiner"><path d="M304.677 281.67l50.057.46"/></g><g class="joiner"><path d="M304.677 275.67l50.057.46"/></g></g><g class="anim"><text y="83.597" x="382.572" class="fade-in state-label" transform="translate(18 175) translate(85.685 1.985)">3</text><g class="joiner"><path d="M460.677 269.67l50.057.46-4.882-3.546"/></g><g class="joiner"><path d="M460.677 287.67l50.057.46-5.256 3.436"/></g><g class="joiner"><path d="M460.677 281.67l50.057.46"/></g><g class="joiner"><path d="M460.677 275.67l50.057.46"/></g></g></g></g></svg></div>

**Note:** Background sync hasn't yet landed in Chrome stable.

[Background sync](https://developers.google.com/web/updates/2015/12/background-sync) is another feature built on top of ServiceWorker. It allows you to request background data synchronisation as a one-off, or on an (extremely heuristic) interval. This happens even when the user doesn't have a tab open to your site, only the ServiceWorker is woken up. You request permission to do this from a page & the user will be prompted.

**Ideal for**: Non-urgent updates, especially those that happen so regularly that a push message per update would be too frequent, such as social timelines or news articles.

```js
self.addEventListener('sync', (event) => {
  if (event.id == 'update-leaderboard') {
    event.waitUntil(
      (async function () {
        const cache = await caches.open('mygame-dynamic');
        await cache.add('/leaderboard.json');
      })(),
    );
  }
});
```

# Cache persistence

Your origin is given a certain amount of free space to do what it wants with. That free space is shared between all origin storage: LocalStorage, IndexedDB, Filesystem, and of course Caches.

The amount you get isn't spec'd, it will differ depending on device and storage conditions. You can find out how much you've got via:

```js
navigator.storageQuota.queryInfo('temporary').then((info) => {
  console.log(info.quota);
  // Result: <quota in bytes>
  console.log(info.usage);
  // Result: <used data in bytes>
});
```

However, like all browser storage, the browser is free to throw it away if the device becomes under storage pressure. Unfortunately the browser can't tell the different between those movies you want to keep at all costs, and the game you don't really care about.

To work around this, there's a proposed API, [`requestPersistent`](https://storage.spec.whatwg.org/):

```js
// From a page:
navigator.storage.requestPersistent().then((granted) => {
  if (granted) {
    // Hurrah, your data is here to stay!
  }
});
```

Of course, the user has to grant permission. Making the user part of this flow is important, as we can now expect them to be in control of deletion. If their device comes under storage pressure, and clearing non-essential data doesn't solve it, the user gets to make a judgement call on which items to keep and remove.

For this to work, it requires operating systems to treat "durable" origins as equivalent to native apps in their breakdowns of storage usage, rather than reporting the browser as a single item.

# Serving suggestions - responding to requests

It doesn't matter how much caching you do, the ServiceWorker won't use the cache unless you tell it when & how. Here are a few patterns for handling requests:

## Cache only

<div class="diagram-container" style="padding-top: 34%"><svg viewBox="0 0 583.92999 198"><g transform="translate(-36.352 -187.593)"><text x="329.228" y="326.179" class="label">ServiceWorker</text><text x="87.057" y="369.32" class="label">Page</text><text x="578.326" y="369.177" class="label">Cache</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(241.641 147.125)"/><use transform="translate(-33.099 166.197)" height="342.978" width="549.929" xlink:href="#diagram-page"/><use transform="translate(501.049 200.815)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M141.816 270.165c39.493 0 68.035-34.507 124.373-33.1"/><path d="M258.498 232.51l10.898 4.51-10.857 5"/></g><text x="172.128" y="56.32" class="fade-in state-label" transform="translate(18 175) translate(0 6)">1</text></g><g class="anim"><g class="joiner"><path d="M390.22 237.024c39.493 0 78.142 35.04 134.48 33.63"/><path d="M517.54 266.02l10.898 4.51-10.857 5"/></g><text class="fade-in state-label" y="65.894" x="197.128" transform="translate(18 175) translate(248.404 6)">2</text></g><g class="anim"><g class="joiner"><path d="M529.97 317.657c-89.42 0-130.307 31.327-199.468 31.327-69.162 0-97.34-35.582-184.044-35.582"/><path d="M154.102 309.13l-10.136 4.44 10.486 4.102"/></g><text x="218.992" y="92.504" class="fade-in state-label" transform="translate(18 175) translate(227.128 90.043)">3</text></g></g></g></svg></div>

**Ideal for:** Anything you'd consider static to that "version" of your site. You should have cached these in the install event, so you can depend on them being there.

```js
self.addEventListener('fetch', (event) => {
  // If a match isn't found in the cache, the response
  // will look like a connection error
  event.respondWith(caches.match(event.request));
});
```

…although you don't often need to handle this case specifically, ["Cache, falling back to network"](#cache-falling-back-to-network) covers it.

## Network only

<div class="diagram-container" style="padding-top: 34%"><svg viewBox="0 0 583.92999 198"><g transform="translate(-36.352 -187.593)"><text x="329.228" y="326.179" class="label">ServiceWorker</text><text x="87.057" y="369.32" class="label">Page</text><text x="572.326" y="369.177" class="label">Network</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(241.641 147.125)"/><use transform="translate(-33.099 166.197)" height="342.978" width="549.929" xlink:href="#diagram-page"/><use transform="translate(489.049 200.815)" height="342.978" width="549.929" xlink:href="#diagram-network"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M141.816 270.165c39.493 0 68.035-34.507 124.373-33.1"/><path d="M258.498 232.51l10.898 4.51-10.857 5"/></g><text x="172.128" y="56.32" class="fade-in state-label" transform="translate(18 175) translate(0 6)">1</text></g><g class="anim"><g class="joiner"><path d="M390.22 237.024c39.493 0 74.142 35.04 130.48 33.63"/><path d="M511.54 266.02l10.898 4.51-10.857 5"/></g><text class="fade-in state-label" y="65.894" x="197.128" transform="translate(18 175) translate(248.404 6)">2</text></g><g class="anim"><g class="joiner"><path d="M525.97 317.657c-89.42 0-126.307 31.327-195.468 31.327-69.162 0-97.34-35.582-184.044-35.582"/><path d="M154.102 309.13l-10.136 4.44 10.486 4.102"/></g><text x="218.992" y="92.504" class="fade-in state-label" transform="translate(18 175) translate(227.128 90.043)">3</text></g></g></g></svg></div>

**Ideal for:** Things that have no offline equivalent, such as analytics pings, non-GET requests.

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
  // or simply don't call event.respondWith, which
  // will result in default browser behaviour
});
```

…although you don't often need to handle this case specifically, ["Cache, falling back to network"](#cache-falling-back-to-network) covers it.

## Cache, falling back to network

<div class="diagram-container" style="padding-top: 49%"><svg viewBox="0 0 549.92853 265"><g transform="translate(-36.352 -120.593)"><text x="248.603" y="384.105" class="label">ServiceWorker</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(160.325 204.743)"/><text x="89.548" y="252.972" class="label">Page</text><use transform="translate(-31.309 48.726)" height="342.978" width="549.929" xlink:href="#diagram-page"/><text x="537.439" y="383.491" class="label">Cache</text><use xlink:href="#diagram-cache" width="549.929" height="342.978" transform="translate(461.439 210.129)"/><text x="400.625" y="253.272" class="label">Network</text><use transform="translate(317.347 80.91)" height="342.978" width="549.929" xlink:href="#diagram-network"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M125.228 217.424c-.572 41.786 20.007 74.986 60.648 75.56"/><path d="M177.64 287.113l10.897 5.65-10.857 5.002"/></g><text x="189.791" y="151.852" class="fade-in state-label" transform="translate(-33.772 202.062) translate(0 -90)">1</text></g><g class="anim"><g class="joiner"><path d="M305.727 320.923c63.06 22.954 117.92 22.76 182.588 6.315"/><path d="M477.033 324.593l15.393 1.14-11.972 9.692"/></g><text x="215.445" y="131.329" class="fade-in state-label" transform="translate(-33.772 202.062) translate(219.43 -3.206)">2</text></g><g class="anim"><g class="cross"><path d="M487.304 315.19l18.813 19.955"/><path d="M503.267 312.91l-14.252 23.375"/></g></g><g class="anim"><g class="joiner"><path d="M306.297 294.13c41.367 4.712 30.642-61.09 53.737-84.936"/><path d="M350.672 212.27l10.33-5.536-.98 12.597"/></g><text class="fade-in state-label" y="93.136" x="140.753" transform="translate(-33.772 202.062) translate(220 -30)">3</text></g><g class="anim"><g class="joiner"><path d="M349.054 172.7c-48.11-26.075-154.585-24.56-198.804-3.377"/><path d="M156.36 160.117l-9.12 9.69 11.97 1.712"/></g><text x="145.324" y="91.993" class="fade-in state-label" transform="translate(-33.772 202.062) translate(129.355 -98.981)">4</text></g></g></g></svg></div>

**Ideal for:** If you're building offline-first, this is how you'll handle the majority of requests. Other patterns will be exceptions based on the incoming request.

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async function () {
      const response = await caches.match(event.request);
      return response || fetch(event.request);
    })(),
  );
});
```

This gives you the "Cache only" behaviour for things in the cache and the "Network only" behaviour for anything not-cached (which includes all non-GET requests, as they cannot be cached).

## Cache & network race

<div class="diagram-container" style="padding-top: 54%"><svg viewBox="0 0 549.92853 293"><g transform="translate(-36.352 -92.593)"><text x="317.603" y="306.854" class="label">ServiceWorker</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(229.325 127.491)"/><text x="86.548" y="295.228" class="label">Page</text><use transform="translate(-34.309 98.982)" height="342.978" width="549.929" xlink:href="#diagram-page"/><text x="537.439" y="383.491" class="label">Network</text><use xlink:href="#diagram-network" width="549.929" height="342.978" transform="translate(455.439 210.129)"/><text x="535.625" y="226.272" class="label">Cache</text><use transform="translate(458.347 53.91)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M144.082 222.997l108.22.477"/><path d="M244.636 217.885l10.898 5.65-10.857 5.002"/></g><text x="213.863" y="96.258" class="fade-in state-label" transform="translate(-33.772 202.062) translate(20 -85)">1</text></g><g class="anim"><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M376.777 239.045s118.118-2.7 119.473 23.924"/><path d="M489.94 259.152l7.46 3.93-.54-10.473"/></g><text x="213.29" y="137.231" class="fade-in state-label" transform="translate(-33.772 202.062) translate(252.695 -68.952)">2</text></g><g class="anim"><g class="joiner"><path d="M489.84 323.937c-38.882 22.15-81.557 44.644-127.76 40.887-38.15-3.204-67.514-36.343-106.685-34.695-32.35 4.344-58.522 31.056-92.25 28.738-17.27 1.488-28.24-27.232-9.825-33.672 12.157-5.75 32.496-8.91 32.273-26.037"/></g><text class="fade-in state-label" y="140.051" x="464.52" transform="translate(-33.772 202.062)">3</text></g><g class="cross"><path d="M179.025 290.99l13.05 18.8"/><path d="M194.412 293.32l-18.862 13.577"/></g></g><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M376.204 206.376s112.388 4.54 115.096-15.57"/><path d="M483.53 193.605l9.857-2.738-4.656 10.732"/></g><text x="213.863" y="96.258" class="fade-in state-label" transform="translate(-33.772 202.062) translate(252.122 -101.621)">2</text></g><g class="anim"><g class="joiner"><path d="M489.74 126.782c-277.096-7.502-405.27-8.293-402.175 48.8"/><path d="M82.923 166.3l3.953 10.395 6.666-10.614"/></g><text x="465.672" y="-48.95" class="fade-in state-label" transform="translate(-33.772 202.062)">3</text></g></g></g></g></g></svg></div>

**Ideal for:** Small assets where you're chasing performance on devices with slow disk access.

With some combinations of older hard drives, virus scanners, and faster internet connections, getting resources from the network can be quicker than going to disk. However, going to the network when the user has the content on their device can be a waste of data, so bear that in mind.

```js
// Promise.race is no good to us because it rejects if
// a promise rejects before fulfilling. Let's make a proper
// race function:
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    // make sure promises are all promises
    promises = promises.map((p) => Promise.resolve(p));
    // resolve this promise as soon as one resolves
    promises.forEach((p) => p.then(resolve));
    // reject if all promises reject
    promises
      .reduce((a, b) => a.catch(() => b))
      .catch(() => reject(Error('All failed')));
  });
}

self.addEventListener('fetch', (event) => {
  event.respondWith(
    promiseAny([caches.match(event.request), fetch(event.request)]),
  );
});
```

## Network falling back to cache

<div class="diagram-container" style="padding-top: 49%"><svg viewBox="0 0 549.92853 265"><g transform="translate(-36.352 -120.593)"><text x="248.603" y="384.105" class="label">ServiceWorker</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(160.325 204.743)"/><text x="89.548" y="252.972" class="label">Page</text><use transform="translate(-31.309 48.726)" height="342.978" width="549.929" xlink:href="#diagram-page"/><text x="537.439" y="383.491" class="label">Network</text><use xlink:href="#diagram-network" width="549.929" height="342.978" transform="translate(455.439 210.129)"/><text x="400.625" y="253.272" class="label">Cache</text><use transform="translate(323.347 80.91)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M125.228 217.424c-.572 41.786 20.007 74.986 60.648 75.56"/><path d="M177.64 287.113l10.897 5.65-10.857 5.002"/></g><text x="189.791" y="151.852" class="fade-in state-label" transform="translate(-33.772 202.062) translate(0 -90)">1</text></g><g class="anim"><g class="joiner"><path d="M305.727 320.923c63.06 22.954 117.92 22.76 182.588 6.315"/><path d="M477.033 324.593l15.393 1.14-11.972 9.692"/></g><text x="215.445" y="131.329" class="fade-in state-label" transform="translate(-33.772 202.062) translate(219.43 -3.206)">2</text></g><g class="anim"><g class="cross"><path d="M487.304 315.19l18.813 19.955"/><path d="M503.267 312.91l-14.252 23.375"/></g></g><g class="anim"><g class="joiner"><path d="M306.297 294.13c53.367 3.57 53.5-42.803 58.308-70.08"/><path d="M358.1 231.7l6.902-10.108 3.593 12.025"/></g><text class="fade-in state-label" y="91.993" x="145.324" transform="translate(-33.772 202.062) translate(220 -30)">3</text></g><g class="anim"><g class="joiner"><path d="M349.054 172.7c-48.11-26.075-154.585-24.56-198.804-3.377"/><path d="M156.36 160.117l-9.12 9.69 11.97 1.712"/></g><text x="145.324" y="91.993" class="fade-in state-label" transform="translate(-33.772 202.062) translate(129.355 -98.981)">4</text></g></g></g></svg></div>

**Ideal for:** A quick-fix for resources that update frequently, outside of the "version" of the site. E.g. articles, avatars, social media timelines, game leader boards.

This means you give online users the most up-to-date content, but offline users get an older cached version. If the network request succeeds you'll most-likely want to [update the cache entry](#on-network-response).

However, this method has flaws. If the user has an intermittent or slow connection they'll have to wait for the network to fail before they get the perfectly acceptable content already on their device. This can take an extremely long time and is a frustrating user experience. See the next pattern, ["Cache then network"](#cache-then-network), for a better solution.

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async function () {
      try {
        return await fetch(event.request);
      } catch (err) {
        return caches.match(event.request);
      }
    })(),
  );
});
```

## Cache then network

<div class="diagram-container" style="padding-top: 60%"><svg viewBox="0 0 549.92853 330"><g transform="translate(-36.352 -55.593)"><text x="315.298" y="193.914" class="label">ServiceWorker</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(227.021 14.552)"/><text x="86.548" y="295.228" class="label">Page</text><use transform="translate(-34.309 98.982)" height="342.978" width="549.929" xlink:href="#diagram-page"/><text x="538.015" y="303.972" class="label">Network</text><use xlink:href="#diagram-network" width="549.929" height="342.978" transform="translate(456.016 130.61)"/><text x="318.965" y="383.005" class="label">Cache</text><use transform="translate(241.688 210.642)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><g class="anim"><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M124.49 265.638c3.457 67.418 71.916 61.556 141.063 63.86"/><path d="M257.888 323.91l10.898 5.65-10.857 5.002"/></g><text class="fade-in state-label" y="353.829" x="270.333" transform="translate(107.978 248.16) translate(-205.303 -248.071)">1</text></g><g class="anim"><g class="joiner"><path d="M269.12 288.11c-36.3 0-69.832-45.044-121.692-46.196"/><path d="M154.744 236.325l-10.998 5.65 11.04 6.153"/></g><text x="285.891" y="282.954" class="fade-in state-label" transform="translate(107.978 248.16) translate(-205.303 -248.071)">2</text></g></g><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M125.315 179.113c1.728-51.86 61.655-71.452 131.378-72.604"/><path d="M247.25 101.515l10.37 4.61-10.947 6.34"/></g><text class="fade-in state-label" y="-125.012" x="36.387" transform="translate(107.978 248.16)">1</text></g><g class="anim"><g class="joiner"><path d="M370.21 108.814c66.264-1.153 174.018 1.152 169.408 53.588"/><path d="M544.58 152.222l-4.61 13.253-6.915-13.253"/></g><text x="59.436" y="-137.112" class="fade-in state-label" transform="translate(107.978 248.16) translate(274.858 -8.643)">2</text></g><g class="anim"><g class="joiner"><path d="M484.877 216.567l-339.395-1.152"/><path d="M153.324 220.793l-10.372-5.186 9.796-6.34"/></g><text class="fade-in state-label" y="-34.24" x="53.097" transform="translate(107.978 248.16) translate(274.858 -8.643)">3</text><g class="joiner"><path d="M484.877 216.568l-80.894-.275c-20.265-.068-50.397 37.642-50.397 37.642"/><path d="M355.598 243.91l-2.325 12.032 8.82-5.693"/></g></g></g></g></g></svg></div>

**Ideal for:** Content that updates frequently. E.g. articles, social media timelines, game leaderboards.

This requires the page to make two requests, one to the cache, one to the network. The idea is to show the cached data first, then update the page when/if the network data arrives.

Sometimes you can just replace the current data when new data arrives (e.g. game leaderboard), but that can be disruptive with larger pieces of content. Basically, don't "disappear" something the user may be reading or interacting with.

Twitter adds the new content above the old content & adjusts the scroll position so the user is uninterrupted. This is possible because Twitter mostly retains a mostly-linear order to content. I copied this pattern for [trained-to-thrill](https://jakearchibald.github.io/trained-to-thrill/) to get content on screen as fast as possible, but still display up-to-date content once it arrives.

### Code in the page:

```js
async function update() {
  // Start the network request as soon as possible.
  const networkPromise = fetch('/data.json');

  startSpinner();

  const cachedResponse = await caches.match('/data.json');
  if (cachedResponse) await displayUpdate(cachedResponse);

  try {
    const networkResponse = await networkPromise;
    const cache = await caches.open('mysite-dynamic');
    cache.put('/data.json', networkResponse.clone());
    await displayUpdate(networkResponse);
  } catch (err) {
    // Maybe report a lack of connectivity to the user.
  }

  stopSpinner();

  const networkResponse = await networkPromise;
}

async function displayUpdate(response) {
  const data = await response.json();
  updatePage(data);
}
```

## Generic fallback

<div class="diagram-container" style="padding-top: 49%"><svg viewBox="0 0 549.92853 265"><g transform="translate(-36.352 -120.593)"><text x="248.603" y="384.105" class="label">ServiceWorker</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(160.325 204.743)"/><text x="89.548" y="252.972" class="label">Page</text><use transform="translate(-31.309 48.726)" height="342.978" width="549.929" xlink:href="#diagram-page"/><text x="537.439" y="383.491" class="label">Network</text><use xlink:href="#diagram-network" width="549.929" height="342.978" transform="translate(455.439 210.129)"/><text x="400.625" y="253.272" class="label">Cache</text><use transform="translate(323.347 80.91)" height="342.978" width="549.929" xlink:href="#diagram-cache"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M125.228 217.424c-.572 41.786 20.007 74.986 60.648 75.56"/><path d="M177.64 287.113l10.897 5.65-10.857 5.002"/></g><text x="189.791" y="151.852" class="fade-in state-label" transform="translate(-33.772 202.062) translate(0 -90)">1</text></g><g class="anim"><g class="joiner"><path d="M306.297 294.13c53.367 3.57 53.5-42.803 58.308-70.08"/><path d="M358.1 231.7l6.902-10.108 3.593 12.025"/></g><text class="fade-in state-label" y="116.993" x="180.962" transform="translate(-33.772 202.062) translate(220 -30)">2</text></g><g class="anim"><g class="cross"><path d="M355.304 209.19l18.813 19.955"/><path d="M371.267 206.91l-14.252 23.375"/></g></g><g class="anim"><g class="joiner"><path d="M305.727 320.923c63.06 22.954 117.92 22.76 182.588 6.315"/><path d="M477.033 324.593l15.393 1.14-11.972 9.692"/></g><text x="214.381" y="167.499" class="fade-in state-label" transform="translate(-33.772 202.062) translate(219.43 -3.206)">3</text></g><g class="anim"><g class="cross"><path d="M487.304 315.19l18.813 19.955"/><path d="M503.267 312.91l-14.252 23.375"/></g></g><g class="anim"><g class="joiner"><path d="M250.117 242.337c-1.063-37.234 66.623-45.397 99.6-54.972"/><path d="M336.148 185.074l14.283 2.245-9.836 8.624"/></g><text class="fade-in state-label" y="133.95" x="185.218" transform="translate(-33.772 202.062) translate(129.355 -98.981)">4</text></g><g class="anim"><g class="joiner"><path d="M349.054 156.7c-48.11-26.075-154.585-24.56-198.804-3.377"/><path d="M156.36 144.117l-9.12 9.69 11.97 1.712"/></g><text x="145.324" y="67.993" class="fade-in state-label" transform="translate(-33.772 202.062) translate(129.355 -98.981)">5</text></g></g></g></svg></div>

If you fail to serve something from the cache and/or network you may want to provide a generic fallback.

**Ideal for:** Secondary imagery such as avatars, failed POST requests, "Unavailable while offline" page.

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async function () {
      // Try the cache
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      try {
        // Fall back to network
        return await fetch(event.request);
      } catch (err) {
        // If both fail, show a generic fallback:
        return caches.match('/offline.html');
        // However, in reality you'd have many different
        // fallbacks, depending on URL & headers.
        // Eg, a fallback silhouette image for avatars.
      }
    })(),
  );
});
```

The item you fallback to is likely to be an [install dependency](#on-install-as-a-dependency).

If your page is posting an email, your ServiceWorker may fall back to storing the email in an IDB 'outbox' & respond letting the page know that the send failed but the data was successfully retained.

## ServiceWorker-side templating

<div class="diagram-container" style="padding-top: 58%"><svg viewBox="0 0 549.92853 316"><g transform="translate(-36.352 -69.593)"><text x="315.298" y="209.914" class="label">ServiceWorker</text><use xlink:href="#diagram-sw" width="549.929" height="342.978" transform="translate(227.021 30.552)"/><text x="86.548" y="311.228" class="label">Page</text><use transform="translate(-34.309 114.982)" height="342.978" width="549.929" xlink:href="#diagram-page"/><text x="540.296" y="321.492" class="label">Cache</text><use xlink:href="#diagram-cache" width="549.929" height="342.978" transform="translate(463.617 148.13)"/><text x="314.093" y="368.6" class="label">Templating Engine</text><use transform="translate(231.806 194.717)" height="342.978" width="549.929" xlink:href="#diagram-template"/><g class="anim sequence"><g class="anim"><g class="joiner"><path d="M89.255 192.108c1.728-52.86 92.707-70.45 167.438-69.6"/><path d="M247.248 117.515l10.372 4.61-10.948 6.34"/></g><text class="fade-in state-label" y="-136.03" x="28.373" transform="translate(107.978 248.16) translate(0 16)">1</text></g><g class="anim"><g class="joiner"><path d="M369.285 114.266c107.177 1.52 167.987 38.007 171.028 67.65l3.8-7.6"/></g><text x="381.506" y="-138.692" class="fade-in state-label" transform="translate(107.978 248.16) translate(0 16)">2</text><g class="joiner"><path d="M369.285 120.267c103.207 1.52 162.528 38.006 165.072 63.68l-6.125-5.616"/></g></g><g class="anim"><g class="joiner"><path d="M491.95 231.364c-49.134.993-68.986 41.193-123.578 41.193l6.948-5.46"/></g><g class="joiner"><path d="M491.95 237.364c-45.164.496-64.52 41.69-123.578 41.193l7.94 5.46"/></g><text class="fade-in state-label" y="24.589" x="336.344" transform="translate(107.978 248.16) translate(0 16)">3</text></g><g class="anim"><g class="joiner"><path d="M263.284 276.01c-50.88.25-69.862-37.208-119.25-39.353"/><path d="M153.945 231.167l-10.97 6.098 11.386 6.34"/></g><text x="91.478" y="40.235" class="fade-in state-label" transform="translate(107.978 248.16)">4</text></g></g></g></svg></div>

**Ideal for:** Pages that cannot have their server response cached.

[Rendering pages on the server makes things fast](/2013/progressive-enhancement-is-faster/), but that can mean including state data that may not make sense in a cache, e.g. "Logged in as…". If your page is controlled by a ServiceWorker, you may instead choose to request JSON data along with a template, and render that instead.

```js
importScripts('templating-engine.js');

self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request);

  event.responseWith(
    (async function () {
      const [template, data] = await Promise.all([
        caches.match('/article-template.html').then((r) => r.text()),
        caches.match(requestURL.path + '.json').then((r) => r.json()),
      ]);

      return new Response(renderTemplate(template, data), {
        headers: { 'Content-Type': 'text/html' },
      });
    })(),
  );
});
```

# Putting it together

You don't have to pick one of these methods, you'll likely use many of them depending on request URL. For example, [trained-to-thrill](https://jakearchibald.github.io/trained-to-thrill/) uses:

- [Cache on install](#on-install-as-a-dependency), for the static UI and behaviour
- [Cache on network response](#on-network-response), for the Flickr images and data
- [Fetch from cache, falling back to network](#cache-falling-back-to-network), for most requests
- [Fetch from cache, then network](#cache-then-network), for the Flickr search results

Just look at the request and decide what to do:

```js
self.addEventListener('fetch', (event) => {
  // Parse the URL:
  const requestURL = new URL(event.request.url);

  // Handle requests to a particular host specifically
  if (requestURL.hostname == 'api.example.com') {
    event.respondWith(/* some combination of patterns */);
    return;
  }
  // Routing for local URLs
  if (requestURL.origin == location.origin) {
    // Handle article URLs
    if (/^\/article\//.test(requestURL.pathname)) {
      event.respondWith(/* some other combination of patterns */);
      return;
    }
    if (requestURL.pathname.endsWith('.webp')) {
      event.respondWith(/* some other combination of patterns */);
      return;
    }
    if (request.method == 'POST') {
      event.respondWith(/* some other combination of patterns */);
      return;
    }
    if (/cheese/.test(requestURL.pathname)) {
      event.respondWith(
        new Response('Flagrant cheese error', {
          status: 512,
        }),
      );
      return;
    }
  }

  // A sensible default pattern
  event.respondWith(
    (async function () {
      const cachedResponse = await caches.match(event.request);
      return cachedResponse || fetch(event.request);
    })(),
  );
});
```

…you get the picture.

If you come up with additional patterns, throw them at me in the comments!

# Credits

…for the lovely icons:

- [Code](http://thenounproject.com/term/code/17547/) by buzzyrobot
- [Calendar](http://thenounproject.com/term/calendar/4672/) by Scott Lewis
- [Network](http://thenounproject.com/term/network/12676/) by Ben Rizzo
- [SD](http://thenounproject.com/term/sd-card/6185/) by Thomas Le Bas
- [CPU](http://thenounproject.com/term/cpu/72043/) by iconsmind.com
- [Trash](http://thenounproject.com/term/trash/20538/) by trasnik
- [Notification](http://thenounproject.com/term/notification/32514/) by @daosme
- [Layout](http://thenounproject.com/term/layout/36872/) by Mister Pixel
- [Cloud](http://thenounproject.com/term/cloud/2788/) by P.J. Onori

And thanks to [Jeff Posnick](https://twitter.com/jeffposnick) for catching many howling errors before I hit "publish".

# Further reading

- [Intro to ServiceWorkers](http://www.html5rocks.com/en/tutorials/service-worker/introduction/)
- [Is ServiceWorker ready?](https://jakearchibald.github.io/isserviceworkerready/) - track the implementation status across the main browsers
- [JavaScript promises, there and back again](http://www.html5rocks.com/en/tutorials/es6/promises/) - guide to promises
