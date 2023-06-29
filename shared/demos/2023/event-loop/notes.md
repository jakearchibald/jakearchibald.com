Change `<WhenIntersecting>` to pause animations - when not intersecting OR tab swap
Split common values into data file

Once the fast-spin has slowed, switch to one iteration per rotation, with a callback each time.
That callback should switch control back to the main loop, which doesn't have the blurring, and has all the logic

Speed phases: speedy, slowdown, slow
When going back through phases, just confirm the change instantly - it'll reset the position but that's ok. Then later, figure out a way to resume the position if it's on one of the central paths

States:

- speedy
- bypass-render
- bypass-task
- task-enter
- task-blocked
- task-leave
- render-enter
- render-raf-blocked
- render-leave

Some states to other states may cause a jump, but hopefully not.

Other data:

- Task queue 1 items
- Task queue 2 items
- Time to render
- Block on raf

Task:

- Tasks can be blocking or non-blocking
