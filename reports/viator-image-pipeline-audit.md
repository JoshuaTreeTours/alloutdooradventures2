# Viator image pipeline audit

## Compared tours
- known-good: PR465 Aspen 74828P5
- known-failing: Yosemite in a Day 36001P1

## Stage diagnostics
| label | productCode | source image count | cover image present | selected candidate URL | selected source type | override used | page hero URL | card hero URL | og:image URL | schema image URL |
|---|---:|---:|---:|---|---|---:|---|---|---|---|
| known-good | 74828P5 | 0 | false | https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg | api-images-payload | false | https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg | https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg | https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg | https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg |
| known-failing | 36001P1 | 2 | true | https://dynamic-media.tacdn.com/media/photo-o/2f/38/df/f6/caption.jpg?w=1600&h=900&s=1 | api-images-payload | false | https://dynamic-media.tacdn.com/media/photo-o/2f/38/df/f6/caption.jpg?w=1600&h=900&s=1 | https://dynamic-media.tacdn.com/media/photo-o/2f/38/df/f6/caption.jpg?w=1600&h=900&s=1 | https://dynamic-media.tacdn.com/media/photo-o/2f/38/df/f6/caption.jpg?w=1600&h=900&s=1 | https://dynamic-media.tacdn.com/media/photo-o/2f/38/df/f6/caption.jpg?w=1600&h=900&s=1 |

## Earliest divergence
- earliest divergent stage: **sourceImageCount**
- assessment: 36001P1 diverges from 74828P5 at raw provider image availability (count/cover metadata), and that divergence persists through normalization and hero selection.
