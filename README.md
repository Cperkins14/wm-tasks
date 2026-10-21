# WM tasks (lab pilot)

Five working memory tasks (jsPsych 7) plus a results dashboard.

| File | What it is |
|---|---|
| `index.html` | Task list RAs land on. Link format: `.../?pid=RA01` |
| `ospan.html`, `symspan.html`, `rspan.html`, `rotspan.html`, `digit-span-backward.html` | The tasks. Each saves one CSV to Google Drive (clairep8@illinois.edu, folder "WM Tasks Pilot") through DataPipe (experiment `y2DwCTqgFGGu`) when it finishes. |
| `results.html` | Forwards to the live lab dashboard (a Google Apps Script web app that reads the Drive folder; Illinois login). |
| `dashboard.html` | Backup: drop a data zip in to score it by hand. Runs in the browser, nothing is uploaded. |

Saved files are named `Task_ID_date_random.csv`, e.g. `OSpan_RA01_2026-10-21_k8qjkg.csv`.

No participant data lives in this repo. It's all in Google Drive (older pilot data is on OSF).
