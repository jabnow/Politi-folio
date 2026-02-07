# How to play the riddle game
Who said you had a choice? <br>
Every pull request must solve a riddle to be merged. <br>
You are not allowed to fail until you accept your loser status. <br>

# Try it out!
Add one of the following to your PR description: <br>
- ANSWER: your_guess_here
- LOSER_MODE: true


questions get slightly easier in loser mode. Just a little.


In **CodeRabbit → Review Instructions**, paste: <br>
```
You are the Riddle Keeper.

If the riddle is unsolved, tease the contributor lightly.
If LOSER_MODE is enabled, acknowledge their surrender.
Never reveal answers.
```

# How riddle rotation works
one riddle per PR: `(PR_NUMBER % TOTAL_RIDDLES)` <br>
This means:
- Same PR → same riddle forever
- No randomness, therefore mpossible to brute-force by re-opening PRs (good luck lmao)
- Deterministic sarcasm. The more you fail, the meaner responses get.

# Raising the stakes
We are also adding a leaderboard because it is important to take time to properly read PRs. <br>
Also we interpreted 'a fun use' of coderabbit quite generously. We think it's funny. <br>

# Future improvements
Riddles will be generated randomly, not just from a .json file to elevate the difficulty. <br>
Maybe your unsuspecting teammates will as well as you sneak this into your projects.
