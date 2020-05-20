---
title: Tasks, microtasks, queues and schedules
date: 2015-08-17 00:01:38
summary: When I told my colleague [Matt Gaunt](https://twitter.com/gauntface) I
  was thinking of writing a piece on microtask queueing and execution within the
  browser's event loop, he said "I'll be honest with you Jake, I'm not going to
  read that". Well, I've written it anyway, so we're all going to sit here and
  enjoy it, ok?
mindframe: "- hold onto your butts for this one, it's spec-heavy"
image: null
meta: ''
---

When I told my colleague [Matt Gaunt](https://twitter.com/gauntface) I was thinking of writing a piece on microtask queueing and execution within the browser's event loop, he said "I'll be honest with you Jake, I'm not going to read that". Well, I've written it anyway, so we're all going to sit here and enjoy it, ok?

Actually, if video's more your thing, [Philip Roberts](https://twitter.com/philip_roberts) gave a [great talk at JSConf on the event loop](https://www.youtube.com/watch?v=8aGhZQkoFbQ) - microtasks aren't covered, but it's a great introduction to the rest. Anyway, on with the show…

Take this little bit of JavaScript:

```js
console.log('script start');

setTimeout(function () {
  console.log('setTimeout');
}, 0);

Promise.resolve()
  .then(function () {
    console.log('promise1');
  })
  .then(function () {
    console.log('promise2');
  });

console.log('script end');
```

In what order should the logs appear?

# Try it

<button class="btn clear-log-1">Clear log</button> <button class="btn test-1">Run test</button>

<style>
.log-output {
  width: 100%;
  box-sizing: border-box;
  height: 12.7rem;
  font: inherit;
  line-height: 1.5;
}
</style>

<textarea class="log-output log-output-1" readonly></textarea>

<script>
function log1(str) {
  console.log(str);
  var logEl = document.querySelector('.log-output-1');
  logEl.value += (logEl.value ? '\n' : '') + str;
}

document.querySelector('.clear-log-1').addEventListener('click', function() {
  document.querySelector('.log-output-1').value = '';
});

document.querySelector('.test-1').addEventListener('click', function() {
  log1('script start');

  setTimeout(function() {
    log1('setTimeout');
  }, 0);

  Promise.resolve().then(function() {
    log1('promise1');
  }).then(function() {
    log1('promise2');
  });

  log1('script end');
});
</script>

The correct answer: `script start`, `script end`, `promise1`, `promise2`, `setTimeout`, but it's pretty wild out there in terms of browser support.

Microsoft Edge, Firefox 40, iOS Safari and desktop Safari 8.0.8 log `setTimeout` before `promise1` and `promise2` - although it appears to be a race condition. This is really weird, as Firefox 39 and Safari 8.0.7 get it consistently right.

# Why this happens

To understand this you need to know how the event loop handles tasks and microtasks. This can be a lot to get your head around the first time you encounter it. Deep breath…

Each 'thread' gets its own **event loop**, so each web worker gets its own, so it can execute independently, whereas all windows on the same origin share an event loop as they can synchronously communicate. The event loop runs continually, executing any tasks queued. An event loop has multiple task sources which guarantees execution order within that source (specs [such as IndexedDB](http://w3c.github.io/IndexedDB/#database-access-task-source) define their own), but the browser gets to pick which source to take a task from on each turn of the loop. This allows the browser to give preference to performance sensitive tasks such as user-input. Ok ok, stay with me…

**Tasks** are scheduled so the browser can get from its internals into JavaScript/DOM land and ensures these actions happen sequentially. Between tasks, the browser _may_ render updates. Getting from a mouse click to an event callback requires scheduling a task, as does parsing HTML, and in the above example, `setTimeout`.

`setTimeout` waits for a given delay then schedules a new task for its callback. This is why `setTimeout` is logged after `script end`, as logging `script end` is part of the first task, and `setTimeout` is logged in a separate task. Right, we're almost through this, but I need you to stay strong for this next bit…

**Microtasks** are usually scheduled for things that should happen straight after the currently executing script, such as reacting to a batch of actions, or to make something async without taking the penalty of a whole new task. The microtask queue is processed after callbacks as long as no other JavaScript is mid-execution, and at the end of each task. Any additional microtasks queued during microtasks are added to the end of the queue and also processed. Microtasks include mutation observer callbacks, and as in the above example, promise callbacks.

Once a promise settles, or if it has already settled, it queues a _microtask_ for its reactionary callbacks. This ensures promise callbacks are async even if the promise has already settled. So calling `.then(yey, nay)` against a settled promise immediately queues a microtask. This is why `promise1` and `promise2` are logged after `script end`, as the currently running script must finish before microtasks are handled. `promise1` and `promise2` are logged before `setTimeout`, as microtasks always happen before the next task.

So, step by step:

<style>
.event-loop-walkthrough {
  overflow: hidden;
  max-width: 710px;
  background: #eee;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-flow: column;
  flex-flow: column;
  max-height: 90vh;
  height: 493px;
  position: relative;
  margin: 0 -20px;
}

@media screen and (min-width: 530px) {
  .event-loop-walkthrough {
    margin: 0;
  }
}

.event-loop-walkthrough .code-example {
  margin: 0;
  padding: 0 12px;
  position: relative;
  top: 60px;
  -webkit-transform: translateY(-50px);
  transform: translateY(-50px);
}

.event-loop-walkthrough table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

.event-loop-walkthrough td {
  padding: 0;
}

.task-queue,
.microtask-queue,
.js-stack,
.event-loop-log {
  line-height: 1;
  border-top: 1px solid #FFF;
}

.task-queue th,
.microtask-queue th,
.js-stack th,
.event-loop-log th {
  font-weight: normal;
  text-align: left;
  padding: 10px 5px;
  background: #ddd;
  vertical-align: top;
  width: 5.1rem;
}

.event-loop-items {
  display: -webkit-flex;
  display: flex;
  overflow: hidden;
  padding-left: 5px;
}

.event-loop-rail {
  position: relative;
  display: -webkit-flex;
  display: flex;
}

.event-loop-log .event-loop-items {
  -webkit-flex-flow: row wrap;
  flex-flow: row wrap;
}

.event-loop-item {
  background: #ddd;
  margin: 5px;
  padding: 5px;
  margin-left: 0;
  opacity: 0;
  white-space: nowrap;
}

.event-loop-item.active {
  background-color: #FFDF1E;
}

.event-loop-commentary {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: -webkit-flex;
  display: flex;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-align-items: center;
  align-items: center;
  font-size: 1.3rem;
  color: #fff;
  line-height: 1.2;
  padding: 0 7%;
}

@media screen and (min-width: 530px) {
  .event-loop-commentary {
    font-size: 1.7rem;
  }
}

.event-loop-commentary-item {
  background: rgba(0, 0, 0, 0.77);
  border-radius: 7px;
  padding: 0.8rem 1.2rem;
  opacity: 0;
}

.js-source {
  -webkit-flex: 1;
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #2D2D2D;
}

.js-source .line-highlight {
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 1;
  opacity: 0;
  line-height: 1.4;
  font-size: 1rem;
  font-family: Inconsolata, monospace;
}

.js-source .line-highlight::before {
  content: '.Hello';
  color: transparent;
}

@media screen and (min-width: 530px) {
  .js-source .line-highlight::before {
    font-size: 1.1rem;
  }
}

.event-loop-controls {
  background: #DDDDDD;
  fill: #6D6D6D;
  padding: 0.6rem;
  height: 1.7rem;
  border-top: 1px solid #FFF;
}

.event-loop-controls svg {
  height: 100%;
  display: block;
  margin-right: 0;
  margin-left: auto;
}

.event-loop-walkthrough .prev-btn,
.event-loop-walkthrough .next-btn {
  fill: rgba(0,0,0,0);
  cursor: pointer;
}
</style>

<div class="event-loop-walkthrough event-loop-walkthrough-1">
  <div class="js-source">
    <div class="line-highlight"></div>

```js
console.log('script start');

setTimeout(function () {
  console.log('setTimeout');
}, 0);

Promise.resolve()
  .then(function () {
    console.log('promise1');
  })
  .then(function () {
    console.log('promise2');
  });

console.log('script end');
```

  </div>

  <table>
    <tr class="task-queue">
      <th>Tasks</th>
      <td>
        <div class="event-loop-items">
          <div class="event-loop-rail">
            <div class="event-loop-item">Run script</div>
            <div class="event-loop-item">setTimeout callback</div>
          </div>
        </div>
      </td>
    </tr>
    <tr class="microtask-queue">
      <th>Microtasks</th>
      <td>
        <div class="event-loop-items">
          <div class="event-loop-rail">
            <div class="event-loop-item">Promise then</div>
            <div class="event-loop-item">Promise then</div>
          </div>
        </div>
      </td>
    </tr>
    <tr class="js-stack">
      <th>JS stack</th>
      <td>
        <div class="event-loop-items"></div>
      </td>
    </tr>
    <tr class="event-loop-log">
      <th>Log</th>
      <td>
        <div class="event-loop-items">
          <div class="event-loop-item">script start</div>
          <div class="event-loop-item">script end</div>
          <div class="event-loop-item">promise1</div>
          <div class="event-loop-item">promise2</div>
          <div class="event-loop-item">setTimeout</div>
        </div>
      </td>
    </tr>
  </table>
  <div class="event-loop-controls">
    <svg viewBox="0 0 5 2">
      <path d="M2,0 L2,2 L0,1 z" />
      <path d="M3,0 L5,1 L3,2 z" />
      <path class="prev-btn" d="M0,0 H2.5V2H0z" />
      <path class="next-btn" d="M2.5,0 H5V2H2.5z" />
    </svg>
  </div>
  <div class="event-loop-commentary">
    <div class="event-loop-commentary-item"></div>
  </div>
</div>

<script>
(function() {
  function transition(el, obj, duration, easing) {
    return new Promise(function(resolve, reject) {
      if (obj.transform) {
        obj['-webkit-transform'] = obj.transform;
      }

      var objKeys = Object.keys(obj);

      if (duration) {
        el.style.transitionProperty = objKeys.join();
        el.style.transitionTimingFunction = easing;
        el.style.transitionDuration = duration + 's';
        el.offsetLeft; // style recalc

        el.addEventListener('transitionend', function te() {
          el.style.transitionProperty = '';
          el.style.transitionTimingFunction = '';
          el.style.transitionDuration = '';
          resolve();
          el.removeEventListener('transitionend', te);
        });
      }
      else {
        resolve();
      }

      objKeys.forEach(function(key) {
        el.style.setProperty(key, obj[key]);
      });
    });
  }

  function EventLoopAnimation(el) {
    this._initalState = el;
    this._states = [];
    this._el = el;
    this._queue = Promise.resolve();
    this._reset();
  }

  EventLoopAnimation.prototype._reset = function() {
    var newEl = this._initalState.cloneNode(true);
    this._tasksShown = 0;
    this._microtasksShown = 0;
    this._tasksRemoved = 0;
    this._microtasksRemoved = 0;
    this._logsShown = 0;
    this._currentPos = 0;

    this._el.parentNode.insertBefore(newEl, this._el);
    this._el.parentNode.removeChild(this._el);
    this._el = newEl;
    this._taskRail = this._el.querySelector('.task-queue .event-loop-rail');
    this._microtaskRail = this._el.querySelector('.microtask-queue .event-loop-rail');
    this._jsStack = this._el.querySelector('.js-stack .event-loop-items');
    this._log = this._el.querySelector('.event-loop-log .event-loop-items');
    this._codeBar = this._el.querySelector('.line-highlight');
    this._codePane = this._el.querySelector('.code-example');
    this._commentary = this._el.querySelector('.event-loop-commentary-item');

    var onClick = function(event) {
      var className = event.target.getAttribute('class');
      if (className === 'prev-btn') {
        event.preventDefault();
        if (event.type == 'click') {
          this.back();
        }
      }
      else if (className === 'next-btn') {
        event.preventDefault();
        if (event.type == 'click') {
          this.forward(true);
        }
      }
    }.bind(this);

    this._el.addEventListener('click', onClick);
    this._el.addEventListener('mousedown', onClick);
  };

  EventLoopAnimation.prototype.forward = function(animate) {
    this._queue = this._queue.then(function() {
      var state = this._states[this._currentPos];
      if (!state) return this.goTo(0);
      this._currentPos++;
      return Promise.all(
        state.map(function(func) {
          return func(animate);
        })
      );
    }.bind(this));
  };

  EventLoopAnimation.prototype.goTo = function(pos) {
    this._queue = this._queue.then(function() {
      this._reset();
      while (pos--) {
        this.forward(false);
      }
    }.bind(this));
  };

  EventLoopAnimation.prototype.back = function() {
    this._queue = this._queue.then(function() {
      if (this._currentPos === 0) return this.goTo(this._states.length);
      return this.goTo(this._currentPos - 1);
    }.bind(this));
  };

  EventLoopAnimation.prototype.state = function() {
    this._states.push([]);
    return this;
  };

  EventLoopAnimation.prototype.action = function(func) {
    this._states[this._states.length - 1].push(func);
    return this;
  };

  EventLoopAnimation.prototype.pushTask = function(activated) {
    return this.action(function(animate) {
      var newTask = this._taskRail.children[this._tasksShown];
      this._tasksShown++;

      if (activated) {
        newTask.style.backgroundColor = '#FFDF1E';
      }

      return transition(newTask, {
        opacity: 1
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.pushMicrotask = function() {
    return this.action(function(animate) {
      var newTask = this._microtaskRail.children[this._microtasksShown];
      this._microtasksShown++;

      return transition(newTask, {
        opacity: 1
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.pushStack = function(text) {
    return this.action(function(animate) {
      var div = document.createElement('div');
      div.className = 'event-loop-item';
      div.textContent = text;
      div.style.backgroundColor = '#FFDF1E';
      this._jsStack.appendChild(div);
      return transition(div, {
        opacity: 1
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.popStack = function(text) {
    return this.action(function(animate) {
      var div = this._jsStack.children[this._jsStack.children.length - 1];
      return transition(div, {
        opacity: 0
      }, 0.2 * animate, 'ease-in-out').then(function() {
        this._jsStack.removeChild(div);
      }.bind(this));
    }.bind(this));
  };

  EventLoopAnimation.prototype.showCodeBar = function() {
    return this.action(function(animate) {
      return transition(this._codeBar, {
        opacity: 1
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.hideCodeBar = function() {
    return this.action(function(animate) {
      return transition(this._codeBar, {
        opacity: 0
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.pushLog = function() {
    return this.action(function(animate) {
      var newLog = this._log.children[this._logsShown];
      this._logsShown++;

      return transition(newLog, {
        opacity: 1
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.moveToLine = function(num) {
    return this.action(function(animate) {
      var barHeight = this._codeBar.getBoundingClientRect().height;

      return transition(this._codePane, {
        transform: 'translateY(' + ((num-1) * -barHeight) + 'px)'
      }, 0.3 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.commentary = function(text) {
    return this.action(function(animate) {
      this._commentary.textContent = text;
      return transition(this._commentary, {
        opacity: 1
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.hideCommentary = function() {
    return this.action(function(animate) {
      return transition(this._commentary, {
        opacity: 0
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.activateMicrotask = function() {
    return this.action(function(animate) {
      var div = this._microtaskRail.children[this._microtasksRemoved];
      return transition(div, {
        'background-color': '#FFDF1E'
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.shiftMicrotask = function() {
    return this.action(function(animate) {
      this._microtasksRemoved++;
      var offset;
      var offsetEl = this._microtaskRail.children[this._microtasksRemoved];

      if (offsetEl) {
        offset = offsetEl.offsetLeft;
      }
      else {
        offset = this._microtaskRail.offsetWidth;
      }

      return transition(this._microtaskRail, {
        'transform': 'translateX(' + (-offset) + 'px)'
      }, 0.3 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.activateTask = function() {
    return this.action(function(animate) {
      var div = this._taskRail.children[this._tasksRemoved];
      return transition(div, {
        'background-color': '#FFDF1E'
      }, 0.2 * animate, 'ease-in-out');
    }.bind(this));
  };

  EventLoopAnimation.prototype.shiftTask = function() {
    return this.action(function(animate) {
      this._tasksRemoved++;
      var offset;
      var offsetEl = this._taskRail.children[this._tasksRemoved];

      if (offsetEl) {
        offset = offsetEl.offsetLeft;
      }
      else {
        offset = this._taskRail.offsetWidth;
      }

      return transition(this._taskRail, {
        'transform': 'translateX(' + (-offset) + 'px)'
      }, 0.3 * animate, 'ease-in-out');
    }.bind(this));
  };

  window.EventLoopAnimation = EventLoopAnimation;
}());

new EventLoopAnimation(document.querySelector('.event-loop-walkthrough-1'))
  .state().moveToLine(1).pushTask(true).pushStack('script').showCodeBar()
  .state().pushLog()
  .state().moveToLine(3)
  .state().commentary("setTimeout callbacks are queued as tasks")
  .state().hideCommentary().pushTask()
  .state().moveToLine(8)
  .state().commentary("Promise callbacks are queued as microtasks")
  .state().hideCommentary().pushMicrotask()
  .state().moveToLine(15)
  .state().pushLog()
  .state().hideCodeBar().popStack()
  .state().commentary("At the end of a task, we process microtasks")
  .state().hideCommentary().activateMicrotask()
  .state().showCodeBar().moveToLine(9).pushStack('Promise callback')
  .state().pushLog()
  .state().hideCodeBar().commentary("This promise callback returns 'undefined', which queues the next promise callback as a microtask")
  .state().hideCommentary().pushMicrotask()
  .state().popStack().commentary("This microtask is done so we move onto the next one in the queue")
  .state().hideCommentary()
  .state().shiftMicrotask().activateMicrotask()
  .state().showCodeBar().moveToLine(12).pushStack('Promise callback')
  .state().pushLog()
  .state().hideCodeBar().popStack().shiftMicrotask()
  .state().commentary("And that's this task done! The browser may update rendering")
  .state().hideCommentary()
  .state().shiftTask().activateTask()
  .state().showCodeBar().moveToLine(4).pushStack('setTimeout callback')
  .state().pushLog()
  .state().hideCodeBar().popStack()
  .state().shiftTask()
  .state().commentary('fin')
  ;
</script>

Yes that's right, I created an animated step-by-step diagram. How did you spend _your_ Saturday? Went out in the _sun_ with your _friends_? Well _I didn't_. Um, in case it isn't clear from my amazing UI design, click the arrows above to advance.

## What are some browsers doing differently?

Some browsers log `script start`, `script end`, `setTimeout`, `promise1`, `promise2`. They're running promise callbacks after `setTimeout`. It's likely that they're calling promise callbacks as part of a new task rather than as a microtask.

This is sort-of excusable, as promises come from ECMAScript rather than HTML. ECMAScript has the concept of "jobs" which are similar to microtasks, but the relationship isn't explicit aside from [vague mailing list discussions](https://esdiscuss.org/topic/the-initialization-steps-for-web-browsers#content-16). However, the general consensus is that promises should be part of the microtask queue, and for good reason.

Treating promises as tasks leads to performance problems, as callbacks may be unnecessarily delayed by task-related things such as rendering. It also causes non-determinism due to interaction with other task sources, and can break interactions with other APIs, but more on that later.

Here's [an Edge ticket](https://connect.microsoft.com/IE/feedback/details/1658365) for making promises use microtasks. WebKit nightly is doing the right thing, so I assume Safari will pick up the fix eventually, and it appears to be fixed in Firefox 43.

Really interesting that both Safari and Firefox suffered a regression here that's since been fixed. I wonder if it's just a coincidence.

# How to tell if something uses tasks or microtasks

Testing is one way. See when logs appear relative to promises & `setTimeout`, although you're relying on the implementation to be correct.

The certain way, is to look up the spec. For instance, [step 14 of `setTimeout`](https://html.spec.whatwg.org/multipage/webappapis.html#timer-initialisation-steps) queues a task, whereas [step 5 of queuing a mutation record](https://dom.spec.whatwg.org/#queue-a-mutation-record) queues a microtask.

As mentioned, in ECMAScript land, they call microtasks "jobs". In [step 8.a of `PerformPromiseThen`](http://www.ecma-international.org/ecma-262/6.0/#sec-performpromisethen), `EnqueueJob` is called to queue a microtask.

Now, let's look at a more complicated example. _Cut to a concerned apprentice_ "No, they're not ready!". Ignore him, you're ready. Let's do this…

# Level 1 bossfight

Before writing this post I'd have gotten this wrong. Here's a bit of html:

```html
<div class="outer">
  <div class="inner"></div>
</div>
```

Given the following JS, what will be logged if I click `div.inner`?

```js
// Let's get hold of those elements
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

// Let's listen for attribute changes on the
// outer element
new MutationObserver(function () {
  console.log('mutate');
}).observe(outer, {
  attributes: true,
});

// Here's a click listener…
function onClick() {
  console.log('click');

  setTimeout(function () {
    console.log('timeout');
  }, 0);

  Promise.resolve().then(function () {
    console.log('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

// …which we'll attach to both elements
inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);
```

Go on, give it a go before peeking at the answer. _Clue:_ Logs can happen more than once.

# Test it

Click the inner square to trigger a click event:

<style>
.outer-test {
  background: #D4D4D4;
  padding: 25px;
  width: 92px;
  margin: 0 auto;
}

.inner-test {
  background: #ADADAD;
  padding: 46px;
  width: 0;
}
</style>

<div class="outer-test"><div class="inner-test"></div></div>

<button class="btn clear-log-2">Clear log</button>

<textarea class="log-output log-output-2" readonly></textarea>

<script>
var targetLogOutput;

function log2(str) {
  console.log(str);
  var el;

  if (jsActivatedClick) {
    el = document.querySelector('.log-output-3');
  }
  else {
    el = document.querySelector('.log-output-2');
  }
  el.value += (el.value ? '\n' : '') + str;
}

document.querySelector('.clear-log-2').addEventListener('click', function() {
  document.querySelector('.log-output-2').value = '';
});

// Let's get hold of those elements
var outer = document.querySelector('.outer-test');
var inner = document.querySelector('.inner-test');

// Let's listen for attribute changes on the
// outer element
new MutationObserver(function() {
  log2('mutate');
}).observe(outer, {
  attributes: true
});

// Here's a click listener…
function onClick() {
  log2('click');

  setTimeout(function() {
    log2('timeout');
  },0);

  Promise.resolve().then(function() {
    log2('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

// …which we'll attach to both elements
inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);
</script>

Was your guess different? If so, you may still be right. Unfortunately the browsers don't really agree here:

<style>
.browser-results {
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  -webkit-justify-content: center;
  margin: 0;
  padding: 0;
  font-family: Inconsolata, monospace;
}

.browser-results li {
  display: block;
  margin: 0;
  padding: 0;
}

.browser-results > li {
  margin-left: 1px;
  background: #eee;
  padding: 0.5rem;
  padding-bottom: 0.4rem;
  line-height: 1.5;
}

@media (min-width: 400px) {
  .browser-results > li {
    margin-left: 1rem;
  }
}

.browser-results > li:first-child {
  margin-left: 0;
}

.browser-results ul {
  display: block;
  margin: 0;
  padding: 0;
}

.browser-results img {
  width: 100%;
  max-width: 100px;
}
</style>

<section>
  <ul class="browser-results">
    <li>
      <img src="asset-url:static-build/imgs/browser-icons/chrome.png" alt="Chrome">
      <ul>
        <li>click</li>
        <li>promise</li>
        <li>mutate</li>
        <li>click</li>
        <li>promise</li>
        <li>mutate</li>
        <li>timeout</li>
        <li>timeout</li>
      </ul>
    </li>
    <li>
      <img src="asset-url:static-build/imgs/browser-icons/firefox.png" alt="Firefox">
      <ul>
        <li>click</li>
        <li>mutate</li>
        <li>click</li>
        <li>mutate</li>
        <li>timeout</li>
        <li>promise</li>
        <li>promise</li>
        <li>timeout</li>
      </ul>
    </li>
    <li>
      <img src="asset-url:static-build/imgs/browser-icons/safari.png" alt="Safari">
      <ul>
        <li>click</li>
        <li>mutate</li>
        <li>click</li>
        <li>mutate</li>
        <li>promise</li>
        <li>promise</li>
        <li>timeout</li>
        <li>timeout</li>
      </ul>
    </li>
    <li>
      <img src="asset-url:static-build/imgs/browser-icons/edge.png" alt="Edge">
      <ul>
        <li>click</li>
        <li>click</li>
        <li>mutate</li>
        <li>timeout</li>
        <li>promise</li>
        <li>timeout</li>
        <li>promise</li>
      </ul>
    </li>
  </ul>
</section>

# Who's right?

Dispatching the 'click' event is a task. Mutation observer and promise callbacks are queued as microtasks. The `setTimeout` callback is queued as a task. So here's how it goes:

<div class="event-loop-walkthrough event-loop-walkthrough-2">
  <div class="js-source">
    <div class="line-highlight"></div>

```js
// Let's get hold of those elements
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

// Let's listen for attribute changes on the
// outer element
new MutationObserver(function () {
  console.log('mutate');
}).observe(outer, {
  attributes: true,
});

// Here's a click listener…
function onClick() {
  console.log('click');

  setTimeout(function () {
    console.log('timeout');
  }, 0);

  Promise.resolve().then(function () {
    console.log('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

// …which we'll attach to both elements
inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);
```

  </div>
  <table>
    <tr class="task-queue">
      <th>Tasks</th>
      <td>
        <div class="event-loop-items">
          <div class="event-loop-rail">
            <div class="event-loop-item">Dispatch click</div>
            <div class="event-loop-item">setTimeout callback</div>
            <div class="event-loop-item">setTimeout callback</div>
          </div>
        </div>
      </td>
    </tr>
    <tr class="microtask-queue">
      <th>Microtasks</th>
      <td>
        <div class="event-loop-items">
          <div class="event-loop-rail">
            <div class="event-loop-item">Promise then</div>
            <div class="event-loop-item">Mutation observers</div>
            <div class="event-loop-item">Promise then</div>
            <div class="event-loop-item">Mutation observers</div>
          </div>
        </div>
      </td>
    </tr>
    <tr class="js-stack">
      <th>JS stack</th>
      <td>
        <div class="event-loop-items"></div>
      </td>
    </tr>
    <tr class="event-loop-log">
      <th>Log</th>
      <td>
        <div class="event-loop-items">
          <div class="event-loop-item">click</div>
          <div class="event-loop-item">promise</div>
          <div class="event-loop-item">mutate</div>
          <div class="event-loop-item">click</div>
          <div class="event-loop-item">promise</div>
          <div class="event-loop-item">mutate</div>
          <div class="event-loop-item">timeout</div>
          <div class="event-loop-item">timeout</div>
        </div>
      </td>
    </tr>
  </table>
  <div class="event-loop-controls">
    <svg viewBox="0 0 5 2">
      <path d="M2,0 L2,2 L0,1 z" />
      <path d="M3,0 L5,1 L3,2 z" />
      <path class="prev-btn" d="M0,0 H2.5V2H0z" />
      <path class="next-btn" d="M2.5,0 H5V2H2.5z" />
    </svg>
  </div>
  <div class="event-loop-commentary">
    <div class="event-loop-commentary-item"></div>
  </div>
</div>

<script>
new EventLoopAnimation(document.querySelector('.event-loop-walkthrough-2'))
  .state().pushTask(true)
  .state().moveToLine(15).pushStack('onClick').showCodeBar()
  .state().pushLog()
  .state().moveToLine(17)
  .state().pushTask()
  .state().moveToLine(21)
  .state().pushMicrotask()
  .state().moveToLine(25)
  .state().commentary("This mutation queues a microtask to handle observers")
  .state().hideCommentary().pushMicrotask()
  .state().hideCodeBar().popStack()
  .state().commentary("Although we're mid-task, microtasks are processed after callbacks if the stack is empty")
  .state().hideCommentary().activateMicrotask()
  .state().showCodeBar().moveToLine(22).pushStack('Promise callback')
  .state().pushLog()
  .state().hideCodeBar().popStack().shiftMicrotask().activateMicrotask()
  .state().showCodeBar().moveToLine(8).pushStack('Mutation callback')
  .state().pushLog()
  .state().hideCodeBar().popStack().shiftMicrotask()
  .state().commentary("The event bubbles, so our callback is called again for the outer element")
  .state().hideCommentary().moveToLine(15).pushStack('onClick').showCodeBar()
  .state().pushLog()
  .state().moveToLine(17)
  .state().pushTask()
  .state().moveToLine(21)
  .state().pushMicrotask()
  .state().moveToLine(25)
  .state().pushMicrotask()
  .state().hideCodeBar().popStack()
  .state().activateMicrotask()
  .state().showCodeBar().moveToLine(22).pushStack('Promise callback')
  .state().pushLog()
  .state().hideCodeBar().popStack().shiftMicrotask().activateMicrotask()
  .state().showCodeBar().moveToLine(8).pushStack('Mutation callback')
  .state().pushLog()
  .state().hideCodeBar().popStack().shiftMicrotask()
  .state().shiftTask().activateTask()
  .state().showCodeBar().moveToLine(18).pushStack('setTimeout callback')
  .state().pushLog()
  .state().popStack().hideCodeBar().shiftTask().activateTask()
  .state().showCodeBar().pushStack('setTimeout callback')
  .state().pushLog()
  .state().popStack().hideCodeBar().shiftTask()
  .state().commentary('fin')
  ;
</script>

So it's Chrome that gets it right. The bit that was 'news to me' is that microtasks are processed after callbacks (as long as no other JavaScript is mid-execution), I thought it was limited to end-of-task. This rule comes from the HTML spec for calling a callback:

<blockquote class="quote"><p>If the <a href="https://html.spec.whatwg.org/multipage/webappapis.html#stack-of-script-settings-objects">stack of script settings objects</a> is now empty, <a href="https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint">perform a microtask checkpoint</a></p>&mdash; <a href="https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-a-callback">HTML: Cleaning up after a callback</a> step 3</blockquote>

…and a microtask checkpoint involves going through the microtask queue, unless we're already processing the microtask queue. Similarly, ECMAScript says this of jobs:

<blockquote class="quote"><p>Execution of a Job can be initiated only when there is no running execution context and the execution context stack is empty…</p>&mdash; <a href="http://www.ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues">ECMAScript: Jobs and Job Queues</a></blockquote>

…although the "can be" becomes "must be" when in an HTML context.

# What did browsers get wrong?

**Firefox** and **Safari** are correctly exhausting the microtask queue between click listeners, as shown by the mutation callbacks, but promises appear to be queued differently. This is sort-of excusable given that the link between jobs & microtasks is vague, but I'd still expect them to execute between listener callbacks. [Firefox ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=1193394). [Safari ticket](https://bugs.webkit.org/show_bug.cgi?id=147933).

With **Edge** we've already seen it queue promises incorrectly, but it also fails to exhaust the microtask queue between click listeners, instead it does so after calling all listeners, which accounts for the single `mutate` log after both `click` logs. [Bug ticket](https://connect.microsoft.com/IE/feedbackdetail/view/1658386/microtasks-queues-should-be-processed-following-event-listeners).

# Level 1 boss's angry older brother

Ohh boy. Using the same example from above, what happens if we execute:

```js
inner.click();
```

This will start the event dispatching as before, but using script rather than a real interaction.

# Try it

<button class="btn clear-log-3">Clear log</button> <button class="btn test-2">Run test</button>

<textarea class="log-output log-output-3" readonly></textarea>

<script>
var jsActivatedClick = false;
document.querySelector('.test-2').addEventListener('click', function() {
  jsActivatedClick = true;
  inner.click();
  setTimeout(function() {
    jsActivatedClick = false;
  }, 100);
});
document.querySelector('.clear-log-3').addEventListener('click', function() {
  document.querySelector('.log-output-3').value = '';
});
</script>

And here's what the browsers say:

<section>
  <ul class="browser-results">
    <li>
      <img src="asset-url:static-build/imgs/browser-icons/chrome.png" alt="Chrome">
      <ul>
        <li>click</li>
        <li>click</li>
        <li>promise</li>
        <li>mutate</li>
        <li>promise</li>
        <li>timeout</li>
        <li>timeout</li>
      </ul>
    </li>
    <li>
      <img src="asset-url:static-build/imgs/browser-icons/firefox.png" alt="Firefox">
      <ul>
        <li>click</li>
        <li>click</li>
        <li>mutate</li>
        <li>timeout</li>
        <li>promise</li>
        <li>promise</li>
        <li>timeout</li>
      </ul>
    </li>
    <li>
      <img src="asset-url:static-build/imgs/browser-icons/safari.png" alt="Safari">
      <ul>
        <li>click</li>
        <li>click</li>
        <li>mutate</li>
        <li>promise</li>
        <li>promise</li>
        <li>timeout</li>
        <li>timeout</li>
      </ul>
    </li>
    <li>
      <img src="asset-url:static-build/imgs/browser-icons/edge.png" alt="Edge">
      <ul>
        <li>click</li>
        <li>click</li>
        <li>mutate</li>
        <li>timeout</li>
        <li>promise</li>
        <li>timeout</li>
        <li>promise</li>
      </ul>
    </li>
  </ul>
</section>

And I swear I keep getting different results from Chrome, I've updated this chart a ton of times thinking I was testing Canary by mistake. If you get different results in Chrome, tell me which version in the comments.

# Why is it different?

Here's how it should happen:

<div class="event-loop-walkthrough event-loop-walkthrough-3">
  <div class="js-source">
    <div class="line-highlight"></div>

```js
// Let's get hold of those elements
var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

// Let's listen for attribute changes on the
// outer element
new MutationObserver(function () {
  console.log('mutate');
}).observe(outer, {
  attributes: true,
});

// Here's a click listener…
function onClick() {
  console.log('click');

  setTimeout(function () {
    console.log('timeout');
  }, 0);

  Promise.resolve().then(function () {
    console.log('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

// …which we'll attach to both elements
inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);

inner.click();
```

  </div>
  <table>
    <tr class="task-queue">
      <th>Tasks</th>
      <td>
        <div class="event-loop-items">
          <div class="event-loop-rail">
            <div class="event-loop-item">Run script</div>
            <div class="event-loop-item">setTimeout callback</div>
            <div class="event-loop-item">setTimeout callback</div>
          </div>
        </div>
      </td>
    </tr>
    <tr class="microtask-queue">
      <th>Microtasks</th>
      <td>
        <div class="event-loop-items">
          <div class="event-loop-rail">
            <div class="event-loop-item">Promise then</div>
            <div class="event-loop-item">Mutation observers</div>
            <div class="event-loop-item">Promise then</div>
          </div>
        </div>
      </td>
    </tr>
    <tr class="js-stack">
      <th>JS stack</th>
      <td>
        <div class="event-loop-items"></div>
      </td>
    </tr>
    <tr class="event-loop-log">
      <th>Log</th>
      <td>
        <div class="event-loop-items">
          <div class="event-loop-item">click</div>
          <div class="event-loop-item">click</div>
          <div class="event-loop-item">promise</div>
          <div class="event-loop-item">mutate</div>
          <div class="event-loop-item">promise</div>
          <div class="event-loop-item">timeout</div>
          <div class="event-loop-item">timeout</div>
        </div>
      </td>
    </tr>
  </table>
  <div class="event-loop-controls">
    <svg viewBox="0 0 5 2">
      <path d="M2,0 L2,2 L0,1 z" />
      <path d="M3,0 L5,1 L3,2 z" />
      <path class="prev-btn" d="M0,0 H2.5V2H0z" />
      <path class="next-btn" d="M2.5,0 H5V2H2.5z" />
    </svg>
  </div>
  <div class="event-loop-commentary">
    <div class="event-loop-commentary-item"></div>
  </div>
</div>

<script>
new EventLoopAnimation(document.querySelector('.event-loop-walkthrough-3'))
  .state().pushTask(true).pushStack('script')
  .state().moveToLine(32).showCodeBar()
  .state().moveToLine(15).pushStack('onClick')
  .state().pushLog()
  .state().moveToLine(17)
  .state().pushTask()
  .state().moveToLine(21)
  .state().pushMicrotask()
  .state().moveToLine(25)
  .state().pushMicrotask()
  .state().hideCodeBar().popStack()
  .state().commentary("We cannot process microtasks, the stack is not empty")
  .state().hideCommentary()
  .state().moveToLine(15).showCodeBar().pushStack('onClick')
  .state().pushLog()
  .state().moveToLine(17)
  .state().pushTask()
  .state().moveToLine(21)
  .state().pushMicrotask()
  .state().moveToLine(25)
  .state().commentary("We don't add another mutation microtask as one is already pending")
  .state().hideCommentary().hideCodeBar().popStack()
  .state().moveToLine(32).showCodeBar()
  .state().hideCodeBar().popStack()
  .state().commentary("We're at the end of this task, so now we can process microtasks")
  .state().hideCommentary().activateMicrotask()
  .state().showCodeBar().moveToLine(22).pushStack('Promise callback')
  .state().pushLog()
  .state().hideCodeBar().popStack().shiftMicrotask().activateMicrotask()
  .state().showCodeBar().moveToLine(8).pushStack('Mutation callback')
  .state().pushLog()
  .state().hideCodeBar().popStack().shiftMicrotask().activateMicrotask()
  .state().showCodeBar().moveToLine(22).pushStack('Promise callback')
  .state().pushLog()
  .state().hideCodeBar().popStack().shiftMicrotask()
  .state().shiftTask().activateTask()
  .state().showCodeBar().moveToLine(18).pushStack('setTimeout callback')
  .state().pushLog()
  .state().popStack().hideCodeBar().shiftTask().activateTask()
  .state().showCodeBar().pushStack('setTimeout callback')
  .state().pushLog()
  .state().popStack().hideCodeBar().shiftTask()
  .state().commentary('fin')
  ;
</script>

So the correct order is: `click`, `click`, `promise`, `mutate`, `promise`, `timeout`, `timeout`, which Chrome seems to get right.

After each listener callback is called…

<blockquote class="quote"><p>If the <a href="https://html.spec.whatwg.org/multipage/webappapis.html#stack-of-script-settings-objects">stack of script settings objects</a> is now empty, <a href="https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint">perform a microtask checkpoint</a></p>&mdash; <a href="https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-a-callback">HTML: Cleaning up after a callback</a> step 3</blockquote>

Previously, this meant that microtasks ran between listener callbacks, but `.click()` causes the event to dispatch synchronously, so the script that calls `.click()` is still in the stack between callbacks. The above rule ensures microtasks don't interrupt JavaScript that's mid-execution. This means we don't process the microtask queue between listener callbacks, they're processed after both listeners.

# Does any of this matter?

Yeah, it'll bite you in obscure places (ouch). I encountered this while trying to create [a simple wrapper library for IndexedDB that uses promises](https://github.com/jakearchibald/indexeddb-promised/blob/master/lib/idb.js) rather than weird `IDBRequest` objects. It [_almost_ makes IDB fun to use](https://github.com/jakearchibald/indexeddb-promised/blob/master/test/idb.js#L36).

When IDB fires a success event, the related [transaction object becomes inactive after dispatching](http://w3c.github.io/IndexedDB/#fire-a-success-event) (step 4). If I create a promise that resolves when this event fires, the callbacks should run before step 4 while the transaction is still active, but that doesn't happen in browsers other than Chrome, rendering the library kinda useless.

You can actually work around this problem in Firefox, because promise polyfills such as [es6-promise](https://github.com/jakearchibald/es6-promise) use mutation observers for callbacks, which correctly use microtasks. Safari seems to suffer from race conditions with that fix, but that could just be their [broken implementation of IDB](http://www.raymondcamden.com/2014/09/25/IndexedDB-on-iOS-8-Broken-Bad). Unfortunately, things consistently fail in IE/Edge, as mutation events aren't handled after callbacks.

Hopefully we'll start to see some interoperability here soon.

# You made it!

In summary:

- Tasks execute in order, and the browser may render between them
- Microtasks execute in order, and are executed:
  - after every callback, as long as no other JavaScript is mid-execution
  - at the end of each task

Hopefully you now know your way around the event loop, or at least have an excuse to go and have a lie down.

Actually, is anyone still reading? Hello? Hello?

<small>Thanks to Anne van Kesteren, Domenic Denicola, Brian Kardell, and Matt Gaunt for proofreading & corrections. Yeah, Matt actually read it in the end, I didn't even need to go full "Clockwork Orange" on him.</small>
