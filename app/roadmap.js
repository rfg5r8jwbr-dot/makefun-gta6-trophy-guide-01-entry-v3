// roadmap.js — one job: the 3-stage platinum roadmap, built from the official descriptions.
// Stage 1 is the story (60–80 h), Stage 2 is the 100% checklist, Stage 3 is open-world clean-up.
// Total: about 200 hours, one playthrough, per PowerPyx. The missable callout is Stage 1's first item.

const STAGES = [
  {
    title: 'Stage 1 — Play the story, guard the one missable trophy',
    hours: '60–80 hours',
    items: [
      'Play Chapters 1–5 in order: Gone Fishing, then one chapter trophy per chapter (Paradise Lost, T**s Ass Drug Money, Vice City, Baby!, Top Of The World, Ma), the named mission trophies (Trust, Break the Bank, Family Matters, DWNFALL, Hi-Jacked, Snow Storm) and the finale gold, You Gotta Know When to Get Off.',
      'MISSABLE — Positive Mental Attitude: in Chapter 1, the morning after the mission Down to Earth, talk to Lucia in the kitchen at Jason’s house, follow her to the balcony and accept the meditation. It is gone after Chapter 1, and it is still unconfirmed whether it is required — do it anyway and make a manual save first.',
      'While the story runs, let the passive counters grow: stunts (Cunning Stunts, 250), vehicles discovered (Whip It Good, 100), WAiNK It locations (You WAiNKer!, 100) and areas explored (The Goodtime State).',
      'Keep cheats OFF: they disable trophies while active.',
    ],
  },
  {
    title: 'Stage 2 — Strangers, collections and the 100% checklist',
    hours: '60–80 hours',
    items: [
      'Finish the 5 named stranger finales (Andy, Kenton, Billy, Randy, Tyrone) and 3 more stranger strands for the silver Strangers & Freaks (8 strands).',
      'Meditate at all 18 spots (10 locations) for Positive Mental Attitude — the last one needs both characters, available after Coffee Break in Chapter 2. Track it under Progress → Collections → Exploration → Meditations.',
      'Collect 3 full card sets (Don’t Touch My Deck), gold all 42 Shooting Range challenges (The Shootist), win 20 different races, win a Top Fun drone race at all 14 locations, and try all 9 activity types (Master of None).',
      'Finish the 100% completion checklist after the story to earn the gold A Long Road — it folds in the meditations, stunts, races, vehicles, cards and stranger strands above.',
    ],
  },
  {
    title: 'Stage 3 — Clean-up: robberies, money and the odd ones',
    hours: '40–60 hours',
    items: [
      'Robberies: 5 bank vaults and escape (Maximum Withdrawal, silver), one armored truck (A Classic Blitz Play), one jewellery store undetected (Sneakthief), and one illegal operation per gang (Pest Control).',
      'Money: launder $250,000 of Marked Bills through contacts (Dime on the Dollar), spend $100,000 across shops (Treat Yo Self), buy all 8 garage properties (Little Boxes) and register 10 vehicles in the Scooter Bros app (On the Spot).',
      'Partner and combat feats: lose a 4-star wanted level with your partner (Hot Together), rob 3 shops back-to-back with your partner (Retail Therapy), take down 5 enemies in one Combat Focus (Gunslinger), and complete 50 challenges (One Last Thing).',
      'The unconfirmed ones last: Bad Luck, I Guess, The Truth Is Out There and Challenging Tank have no confirmed method yet — this guide says so plainly and links the sources where the confirmation will appear. When the last trophy pops, the platinum Vice Got a Price! follows.',
    ],
  },
];

/** Render the roadmap stages into the #roadmap section. */
export function renderRoadmap(roadmapEl) {
  roadmapEl.replaceChildren();
  const h2 = document.createElement('h2');
  h2.textContent = 'Roadmap to the platinum — about 200 hours, one playthrough';
  const intro = document.createElement('p');
  intro.textContent = 'Three stages, in order. The story first, then the 100% checklist, then the open-world clean-up. Only one trophy is possibly missable, and it sits in Stage 1 — everything else can be done after the story in free roam.';
  roadmapEl.append(h2, intro);
  for (const stage of STAGES) {
    const box = document.createElement('div');
    box.className = 'stage';
    const h3 = document.createElement('h3');
    h3.textContent = stage.title;
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    const ul = document.createElement('ul');
    for (const item of stage.items) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    }
    box.append(h3, hours, ul);
    roadmapEl.append(box);
  }
}
