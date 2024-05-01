---
title: Probably?
date: 2019-06-11 08:16:31
summary: Figuring out probabilities with JavaScript and (ugh) maths
mindframe: ''
image: null
meta: ''
---

Remy Sharp [asked a question on Twitter](https://twitter.com/rem/status/1137690933376557057) that got me thinking about probability for the first time in a while.

# The problem

Get your copybooks out now!

Remy is using an image service that has an API which returns a URL for one of its images, picked at random.

Remy makes five requests to the service, to get five image URLs.

But, if the API returns a URL he already has, he replaces it with the result of an additional request. This may still return a duplicate, in which case he keeps it.

Remy's question is: **Does the 'additional request' trick improve the chances of getting a unique set of images?**.

Judging by [the Twitter poll](https://twitter.com/rem/status/1137690933376557057), a lot of folks were unsure about the answer. So, to avoid doing the work I'm supposed to be doing, let's investigate.

# Figuring it out, the lazy way

Maths can give us an exact answer for questions like this, but maths is hard. Instead, let's made a computer do it for us, by writing a little simulation.

Rather than picking a random URL, I'll simplify it to picking a random number:

```js
function isRandomPickUnique(
  totalPossibleChoices,
  amountToPick,
  allowSecondChance,
) {
  // A set to hold all of our picks.
  const set = new Set();
  // Loop for the number of items to pick.
  for (let i = 0; i < amountToPick; i++) {
    // Pick a random integer between 0 and totalPossibleChoices:
    const num = Math.floor(Math.random() * totalPossibleChoices);
    // If the number isn't already in our set,
    // hurrah we've picked a unique number!
    if (!set.has(num)) {
      // Remember it,
      // and continue to the next iteration of the loop.
      set.add(num);
      continue;
    }
    // Otherwise, we've picked a duplicate.
    // If we're not allowed a second chance, we lose.
    if (!allowSecondChance) return false;
    // Otherwise, let's have another go:
    const secondNum = Math.floor(Math.random() * totalPossibleChoices);
    // If it's duplicate again, we lose.
    if (set.has(secondNum)) return false;
    // Otherwise, remember what we picked.
    set.add(secondNum);
  }
  // Everything we picked was unique!
  return true;
}
```

(This function suffers from [the boolean trap](https://ariya.io/2011/08/hall-of-api-shame-boolean-trap), but it's just a quick test, gimmie a break).

Now we can run the test a bunch of times (in this case, as many times as we can in half a second), and figure out the average number of `true` responses.

```js
const timeToRun = 500;
const start = Date.now();
let uniqueSets = 0;
let iterations = 0;

while (Date.now() - start < timeToRun) {
  iterations++;
  if (isRandomPickUnique(100, 5, false)) uniqueSets++;
}

console.log('Chance of unique set:', uniqueSets / iterations);
```

Job done!

<style>
.form-rows input[type=number] {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  font: inherit;
  line-height: 1.5;
  padding: 0 0.2em;
}

.form-rows .label {
  text-align: right;
  vertical-align: top;
}

.form-rows .input {
  padding: 0.5em;
}

.form-rows p {
  margin: 0;
}
</style>

<form class="probability-form form-rows"><div class="form-rows-inner">
  <div class="field">
    <label for="total-choices-1" class="label">Total choices:</label>
    <div class="input"><input required name="totalPossibleChoicesEl" id="total-choices-1" type="number" min="1" step="1" value="100"></div>
  </div>
  <div class="field">
    <label for="pick-1" class="label">Pick:</label>
    <div class="input"><input required name="amountToPickEl" id="pick-1" type="number" min="1" step="1" value="5"></div>
  </div>
  <div class="field">
    <label for="duration-1" class="label">Seconds to run:</label>
    <div class="input"><input required name="durationEl" id="duration-1" type="number" min="0.0001" step="any" value="0.5"></div>
  </div>
  <div class="field">
    <div class="label">Results:</div>
    <div class="input">
      <p class="no-second-chance-result">…</p>
      <p class="second-chance-result">…</p>
    </div>
  </div>
  <div class="field">
    <div class="label"></div>
    <div class="input"><button class="btn">Recalc</button></div>
  </div>
</div></form>

And there we go, the "second chance" significantly improves the odds of a unique set of URLs.

The longer you let the test run, the more accurate the answer is. However, by swapping computer thinking time for our own thinking time, we can get a fully accurate answer…

# Figuring it out, the maths way

Logically, if something has a less-than-certain chance of happening, the chance of it happening twice in a row is always less than the chance of it happening once. Because of this, the "second chance" is always going to improve the odds of getting a unique set of URLs. But how can we figure out the exact probability?

If all outcomes have an equal chance of happening (like the flip of a coin, or the roll of a dice), the probability is:

```js
winningOutcomes / possibleOutcomes;
```

…so the chance of rolling a 3 on a 6-sided dice is 1/6. The chance of rolling an even number is 3/6 (since there are three winning outcomes), which [simplifies](https://www.bbc.com/bitesize/articles/zcdgxfr) to 1/2.

## Calculating probability of one event _and_ another

To calculate the chance of two things happening, it's:

```js
firstProbability * secondProbability;
```

So the chance of rolling a 3 on a 6-sided dice (1/6), then flipping a coin to heads (1/2), is 1/6 \* 1/2, [which is](https://www.bbc.com/bitesize/guides/zgqpv9q/revision/5) 1/12. This makes sense, there are twelve possible outcomes, one for each number on the dice + tails, and again for each number on the dice + heads, and only one outcome is a win.

## Calculating the probability of getting five unique image URLs

Ignoring the "second chance" rule for now, we now have everything we need to figure out the chance of picking five unique URLs randomly from a set.

Let's say `totalImages` is the number of image URLs the API can pick from. With the first pick, any image is a win, so the number of winning outcomes is the same as the number of possible outcomes:

```js
totalImages / totalImages;
```

But the second pick is different, as there's one image URL we must avoid:

```js
(totalImages - 1) / totalImages;
```

For the third pick, there's now two to avoid:

```js
(totalImages - 2) / totalImages;
```

And so on. We multiply the probabilities together, and get:

```js
// First pick.
((((((((totalImages / totalImages) *
  // Second pick.
  (totalImages - 1)) /
  totalImages) *
  // Third pick.
  (totalImages - 2)) /
  totalImages) *
  // Fourth pick.
  (totalImages - 3)) /
  totalImages) *
  // Fifth pick.
  (totalImages - 4)) /
  totalImages;
```

Or using JavaScript:

```js
let probability = 1;

for (let i = 0; i < numberToPick; i++) {
  probability *= (totalImages - i) / totalImages;
}

console.log(probability);
```

But how do we cater for "second chance"?

## Calculating probability of one event _or_ another

If you want to calculate the odds of either thing happening, it's:

```js
firstProbability + secondProbability;
```

However, there's a gotcha here. If the two events are dependant, that needs to be factored into the probability of the second event.

If we calculate the chance of rolling a 3 on a 6-sided dice (1/6), _or_ flipping a coin to heads (1/2), we wouldn't bother flipping the coin if we rolled a 3. If we roll a 3, the result of the coin has no impact on the result. We already won.

The coin gives us our "second chance", but we only use it if our first chance failed. 1/6th of the time we'd win just using the dice, but 5/6th of the time we'd also use the coin, giving us a 1/2 second chance.

```js
firstProbability + (1 - firstProbability) * secondProbability;
```

Or in this case 1/6 + 5/6 \* 1/2, which [multiplies](https://www.bbc.com/bitesize/guides/zgqpv9q/revision/5) to 1/6 + 5/12, which [adds](https://www.bbc.com/bitesize/articles/z9n4k7h) to 7/12. This makes sense as there are twelve possible outcomes, one for each number on the dice + tails, one of which is a winning outcome, and again for each number on the dice + heads, all six of which are winning outcomes, making seven winning outcomes in total.

## Calculating the probability of getting five unique image URLs, including second chances

We can now figure out the chance of picking five unique URLs randomly from a set, including the "second chance" rule.

Again, with the first pick, any image is a win, so the number of winning outcomes is the same as the number of possible outcomes:

```js
totalImages / totalImages;
```

With the second pick, there's one image to avoid. But if we do pick it, we get to try again.

```js
// First try.
(totalImages - 1) / totalImages +
  // But add the probability of another try, if the first try fails:
  ((1 / totalImages) * (totalImages - 1)) / totalImages;
```

Here, `1 / totalImages` is the chance we picked a duplicate, which we multiply by `(totalImages - 1) / totalImages`, the chance of avoiding a duplicate a second time.

For the third pick, there's now two to avoid:

```js
// First try.
(totalImages - 2) / totalImages +
  // But add the probability of another try, if the first try fails:
  ((2 / totalImages) * (totalImages - 2)) / totalImages;
```

And so on. We multiply the probabilities together, and get:

```js
// First pick.
(totalImages / totalImages) *
  // Second pick.
  ((totalImages - 1) / totalImages +
    ((1 / totalImages) * (totalImages - 1)) / totalImages) *
  // Third pick.
  ((totalImages - 2) / totalImages +
    ((2 / totalImages) * (totalImages - 2)) / totalImages) *
  // Fourth pick.
  ((totalImages - 3) / totalImages +
    ((3 / totalImages) * (totalImages - 3)) / totalImages) *
  // Fifth pick.
  ((totalImages - 4) / totalImages +
    ((4 / totalImages) * (totalImages - 4)) / totalImages);
```

Or using JavaScript:

```js
let probability = 1;

for (let i = 0; i < numberToPick; i++) {
  probability *=
    // First try.
    (totalImages - i) / totalImages +
    // Possible second try.
    ((i / totalImages) * (totalImages - i)) / totalImages;
}

console.log(probability);
```

Job done!

<form class="probability-form form-rows"><div class="form-rows-inner">
  <div class="field">
    <label for="total-choices-2" class="label">Total choices:</label>
    <div class="input"><input required name="totalPossibleChoicesEl" id="total-choices-2" type="number" min="1" step="1" value="100"></div>
  </div>
  <div class="field">
    <label for="pick-2" class="label">Pick:</label>
    <div class="input"><input required name="amountToPickEl" id="pick-2" type="number" min="1" step="1" value="5"></div>
  </div>
  <div class="field">
    <label for="duration-2" class="label">Seconds to run:</label>
    <div class="input"><input required name="durationEl" id="duration-2" type="number" min="0.0001" step="any" value="0.5"></div>
  </div>
  <div class="field">
    <div class="label">Sim results:</div>
    <div class="input">
      <p class="no-second-chance-result">…</p>
      <p class="second-chance-result">…</p>
    </div>
  </div>
  <div class="field">
    <div class="label">Exact results:</div>
    <div class="input">
      <p class="no-second-chance-result-real">…</p>
      <p class="second-chance-result-real">…</p>
    </div>
  </div>
  <div class="field">
    <div class="label"></div>
    <div class="input"><button class="btn">Recalc</button></div>
  </div>
</div></form>

<script type="module">
  const formatter = new Intl.NumberFormat('en-gb', { style: 'percent', maximumFractionDigits: 3 });
  const format = v => formatter.format(v);
  const forms = document.querySelectorAll('.probability-form');
  const noSecondChanceResultEls = document.querySelectorAll('.no-second-chance-result');
  const secondChanceResultEls = document.querySelectorAll('.second-chance-result');
  const noSecondChanceResultRealEl = document.querySelector('.no-second-chance-result-real');
  const secondChanceResultRealEl = document.querySelector('.second-chance-result-real');
  let workers = [];
  let busy = false;

  const workerScript = `
    function isRandomPickUnique(totalPossibleChoices, amountToPick, allowSecondChance) {
      // A set to hold all of our picks.
      const set = new Set();
      // Loop for the number of items to pick.
      for (let i = 0; i < amountToPick; i++) {
        // Pick a random integer between 0 and totalPossibleChoices:
        const num = Math.floor(Math.random() * totalPossibleChoices);
        // If the number isn't already in our set,
        // hurrah we've picked a unique number.
        // Remember it,
        // and continue to the next iteration of the loop.
        if (!set.has(num)) {
          set.add(num);
          continue;
        }
        // We've picked a duplicate.
        // If we're not allowed a second chance, we lose.
        if (!allowSecondChance) return false;
        // Let's have another go:
        const secondNum = Math.floor(Math.random() * totalPossibleChoices);
        // If it isn't unique, we lose.
        if (set.has(secondNum)) return false;
        // Otherwise, remember what we picked.
        set.add(secondNum);
      }
      // Everything we picked was unique!
      return true;
    }

    addEventListener('message', (event) => {
      const { totalPossibleChoices, amountToPick, allowSecondChance, duration } = event.data;
      const timeToRun = duration * 1000;
      const start = Date.now();
      let uniqueSets = 0;
      let iterations = 0;

      while (Date.now() - start < timeToRun) {
        iterations++;
        if (isRandomPickUnique(totalPossibleChoices, amountToPick, allowSecondChance)) uniqueSets++;
      }

      postMessage({ uniqueSets, iterations });
    });
  `;
  const workerURL = URL.createObjectURL(new Blob([workerScript], { type: 'text/javascript' }));

  function nextEvent(obj, type) {
    return new Promise(r => obj.addEventListener('message', r, { once: true }));
  }

  function restartWorkers() {
    for (const worker of workers) worker.terminate();
    workers = [new Worker(workerURL), new Worker(workerURL)];
  }

  restartWorkers();

  async function getBruteForceResults(totalPossibleChoices, amountToPick, duration) {
    if (busy) restartWorkers();
    busy = true;

    const resultPromises = [false, true].map(async (allowSecondChance, i) => {
      const worker = workers[i];
      worker.postMessage({
        allowSecondChance, totalPossibleChoices, amountToPick, duration
      });
      const event = await nextEvent(worker, 'message');
      const { uniqueSets, iterations } = event.data;
      return uniqueSets / iterations;
    });

    const results = await Promise.all(resultPromises);
    busy = false;
    return results;
  }

  function getResults(totalPossibleChoices, amountToPick) {
    let noSecondChanceResult = 1;

    for (let i = 0; i < amountToPick; i++) {
      noSecondChanceResult *= (totalPossibleChoices - i) / totalPossibleChoices;
    }

    let secondChanceResult = 1;

    for (let i = 0; i < amountToPick; i++) {
      secondChanceResult *= (totalPossibleChoices - i) / totalPossibleChoices
        // Plus the second chance
        + i / totalPossibleChoices * (totalPossibleChoices - i) / totalPossibleChoices;
    }

    return [ noSecondChanceResult, secondChanceResult ];
  }

  async function calculate(form) {
    if (!form.checkValidity()) return;

    const totalPossibleChoices = form.totalPossibleChoicesEl.valueAsNumber;
    const amountToPick = form.amountToPickEl.valueAsNumber;
    const duration = form.durationEl.valueAsNumber;

    for (const form of forms) {
      form.totalPossibleChoicesEl.value = totalPossibleChoices;
      form.amountToPickEl.value = amountToPick;
      form.durationEl.value = duration;
    }

    for (const el of noSecondChanceResultEls) el.textContent = '…';
    for (const el of secondChanceResultEls) el.textContent = '…';

    // The 'maths' way:
    {
      const [ noSecondChanceResult, secondChanceResult ] = getResults(totalPossibleChoices, amountToPick);
      noSecondChanceResultRealEl.textContent = format(noSecondChanceResult) + ' chance of all-unique.';
      secondChanceResultRealEl.textContent = format(secondChanceResult) + ' with "second chance".';
    }

    // The brute force way:
    {
      const [ noSecondChanceResult, secondChanceResult ] = await getBruteForceResults(totalPossibleChoices, amountToPick, duration);
      for (const el of noSecondChanceResultEls) el.textContent = format(noSecondChanceResult) + ' chance of all-unique.';
      for (const el of secondChanceResultEls) el.textContent = format(secondChanceResult) + ' with "second chance".';
    }
  }

  calculate(forms[0]);

  for (const form of forms) {
    form.addEventListener('input', (event) => calculate(event.currentTarget));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      calculate(event.currentTarget);
    });
  }
</script>

And this gives us an exact result (almost) instantly.

If I just wanted a rough one-off answer, [like Remy did](https://twitter.com/rem/status/1137690933376557057), I'd just write a simulation. I'd only go straight for the 'maths' solution if it was particularly simple, and I'd probably still write the simulation to verify my maths.

Right, I guess I better get back to the work I was supposed to be doing…
