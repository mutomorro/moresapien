---
title: "Deepfakes"
oneLiner: "A deepfake is AI-generated video, audio or imagery showing real people doing things they never did, and why it breaks our trust in recordings."
alsoKnownAs:
  - "Synthetic media"
  - "AI face-swaps"
  - "Generative fakes"
category: "Technology & Society"
tags:
  - "technology"
  - "ai"
  - "misinformation"
  - "media literacy"
  - "trust"
  - "big tech"
howToSpotIt: "Resist the urge to hunt for visual glitches - the tells you learn today are the flaws the next model is trained to fix. Look instead at where a recording came from: who first published it, whether they have a track record, and whether independent sources show the same thing. Be most suspicious of clips that arrive with no source and land perfectly on what you already fear or want to believe."
thoughtToHoldOnto: "Seeing was never quite believing, but it used to be a floor. Deepfakes do not end truth - they move the work of finding it back onto where things come from."
whyItMattersNow: "The cost of a convincing fake has collapsed from a film-studio budget to a laptop and a few minutes of sample footage. Fraud built on voice clones and video impersonation is climbing fast, and lawmakers are scrambling to catch up - the EU AI Act and the US TAKE IT DOWN Act both now demand that synthetic media be labelled or removed. The harder problem is not any single fake but what their mere possibility does to trust in every genuine recording."
relatedConcepts:
  - slug: "liars-dividend"
    note: "The flip side - once any recording could be fake, the guilty can dismiss real evidence as a deepfake."
  - slug: "ai-slop"
    note: "The low-effort flood of machine content; deepfakes are its targeted, high-effort cousin."
  - slug: "dead-internet-theory"
    note: "When enough of what we see could be synthetic, the whole information space starts to feel hollow."
  - slug: "naive-realism"
    note: "Deepfakes exploit our habit of treating what we see and hear as a direct read-out of reality."
  - slug: "illusory-truth-effect"
    note: "A fake that circulates widely gains borrowed credibility from sheer repetition."
  - slug: "firehose-of-falsehood"
    note: "Synthetic media is fuel for the tactic of burying the truth under sheer volume."
furtherReading:
  - title: "MIT Sloan: Deepfakes, explained"
    url: "https://mitsloan.mit.edu/ideas-made-to-matter/deepfakes-explained"
  - title: "Regina Rini: Deepfakes and the Epistemic Backstop"
    url: "https://philpapers.org/rec/RINDAT"
  - title: "Wikipedia: Deepfake"
    url: "https://en.wikipedia.org/wiki/Deepfake"
---

## What a deepfake is

A deepfake is a piece of video, audio or imagery that an artificial intelligence system has generated or altered so that it convincingly shows a real person saying or doing something they never said or did. The word is a blend of "deep learning", the kind of AI used to make them, and "fake". It entered common use in late 2017, when a Reddit user posting under the name "deepfakes" shared face-swapped videos built with open-source tools, and the label spread to cover the whole category of AI-made [synthetic media](https://en.wikipedia.org/wiki/Deepfake).

The point of an entry like this is not to teach you to spot the seams. It is to be clear about what deepfakes change. They are not simply a new way to lie. They are a new pressure on one of the quiet anchors we all use to work out what is true.

### How deepfakes are made

You do not need to follow the engineering to grasp the idea. Early deepfakes leaned on a setup called a generative adversarial network, introduced by the researcher Ian Goodfellow in 2014. Picture two AI systems locked in a contest. One, the generator, produces fakes. The other, the discriminator, tries to tell them apart from real examples. Each round, the forger learns from being caught, and the fakes improve. Run that loop long enough over enough real footage of a person, and the output becomes hard to separate from a genuine recording. Newer systems use related methods called diffusion models, but the principle holds: a machine trained on real examples learns to manufacture convincing new ones.

What matters for the rest of this entry is the consequence rather than the mechanism. The cost of producing a convincing fake has collapsed. What once needed a film studio now needs a laptop and a few minutes of sample footage or audio. Face-swaps, voice clones, lip-syncing a real person to invented words, whole fabricated people who never existed - all of it now sits within reach of an ordinary user.

## The anchor deepfakes break

For most of the last century, a recording carried a particular kind of weight. A photograph, a tape, a piece of video was treated as evidence. Not proof of everything, but a reliable floor under public argument. If footage showed a public figure taking a bribe, "it is on tape" was close to the end of the conversation. Recordings worked as what the philosopher Regina Rini calls an epistemic backstop: even when we relied on someone's word, the knowledge that a recording could exist quietly disciplined what people could get away with claiming.

Deepfakes pull that floor away. Once any recording might be synthetic, the recording alone no longer settles anything. The burden shifts back onto everything around it - who captured it, where it came from, whether other sources agree - which is the very work the recording used to save us. What we lose is not a single fact but a shared shortcut for making sense of the world. Shortcuts like this are what let large groups of strangers agree on what happened without each person having to re-investigate from scratch.

### Photographs never told the whole truth

It would be a mistake to mourn a golden age that never existed. Recorded media was always partial, and often staged. A photograph is a frame: someone chose where to point the camera, what to leave outside the edge, and which instant to keep. Governments have doctored images for as long as there have been images to doctor. Stalin had fallen-from-favour officials airbrushed out of photographs decades before anyone owned a computer. Editing, cropping, flattering angles and outright manipulation are old crafts, not inventions of the AI era.

So the thing deepfakes threaten was never perfect truth. It was a floor, not a ceiling - a working assumption that the broad event in front of the lens had taken place, even if its framing was someone's choice. That modest assumption is what is now in question. It is worth being clear-eyed about both halves of this: what is genuinely being lost, and what was never really there to begin with.

## Why deepfakes work on us

Part of the power of a deepfake is that it targets a default we barely notice we hold. We tend to treat what we see and hear as a direct read-out of reality rather than as a representation that can be constructed, a habit close to [naive realism](/naive-realism/). A convincing image does not arrive feeling like a claim to be weighed. It feels like a fact already absorbed. By the time the deliberate part of us thinks to ask "is this real?", the impression has often already landed.

Two further tendencies stack on top. Things we meet repeatedly start to feel true regardless of where they came from, an effect known as the [illusory truth effect](/illusory-truth-effect/), so a fake that circulates widely gains a borrowed credibility from repetition alone. And fakes are built to travel: the most provocative version of an event, the clip that makes us angriest or most certain, spreads furthest. In [the attention economy](/the-attention-economy/), the synthetic and the inflammatory tend to be the same files moving through the system.

## The detection trap

A natural response is to get better at spotting fakes, to learn the tells. Count the fingers, watch for unnatural blinking, listen for flat or oddly smooth audio. This is a losing game, and it helps to understand why. Detection and generation are locked in the same contest the technology was born from. Every tell that gets publicised becomes a flaw the next model is trained to remove. The fakes that survive are precisely the ones that have beaten the current round of detection, so teaching people to hunt for artefacts mostly trains them to trust any fake polished enough to hide them.

The more durable move is to stop interrogating the pixels and start interrogating the provenance. Where did this come from? Who first published it, and do they have a record worth trusting? Do independent sources show the same thing? This is the same discipline that helps against [AI slop](/ai-slop/) and the [firehose of falsehood](/firehose-of-falsehood/), the tactic of burying the truth under sheer volume. The signal is rarely in the artefact itself. It is almost always in the chain of custody around it.

## From fear of fakes to the liar's dividend

The obvious worry about deepfakes is that we will believe false things and be fooled by a convincing forgery. That risk is real, but it may be the smaller one. The subtler danger runs the other way. Once everyone knows that any recording could be fake, anyone caught on a genuine recording can simply claim it was faked. The existence of deepfakes hands a ready-made alibi to the guilty. This second-order effect has a name of its own, the [liar's dividend](/liars-dividend/), and in a low-trust setting it may do more harm than any single fabricated clip.

A failure mode waits at each end of this. Believe every recording and you are simple to manipulate. Disbelieve every recording and you arrive at a tired cynicism in which nothing can be established and the loudest or most powerful voice wins by default. That second mood feeds [dead internet theory](/dead-internet-theory/) and a wider feeling that the whole information space has gone hollow. Media literacy in an age of synthetic media is the narrow path between the two. The aim is not to trust nothing, but to trust in proportion to where something came from.
