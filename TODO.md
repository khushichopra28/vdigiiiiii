# TODO

- [ ] Update `app.js`:
  - [x] Disable COLLECTION carousel hover pause logic on mobile (<768px)

  - [x] Add touch tap vs scroll detection for COLLECTION carousel cards

  - [x] On confirmed tap: pause carousel for 2 seconds then resume
  - [ ] Keep existing desktop hover behavior unchanged
  - [x] Add `decoding="async"` and explicit `width`/`height` attributes to generated COLLECTION images
- [ ] Update `style.css`:
  - [x] Add GPU smoothing/perf properties for reels marquee and portfolio carousel track
    - [x] `will-change: transform`
    - [x] `backface-visibility: hidden`
    - [x] `perspective: 1000px`
- [ ] Sanity test on mobile + desktop
  - [ ] Verify carousel never freezes while scrolling
  - [ ] Verify tap pauses only for COLLECTION for ~2s
  - [ ] Verify desktop hover pause still works

