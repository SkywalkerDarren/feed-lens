# Label limits

Checked against TypeSafe documentation on 2026-09-22.

| Field | Feed Lens constraint |
|---|---|
| Label display | Required, up to 30 UTF-16 code units (unchanged) |
| Label description | Required, not whitespace-only, up to 400 UTF-16 code units |
| Labels per platform | Up to 60, across both groups |
| Configuration file | Up to 1 MiB; includes all three platforms |

The editor, save/export/import validation and API request builder use the same label validation. Stored custom labels are not rewritten automatically; existing empty descriptions must be filled before classification or saving.

Each label creates an independent Noul question, allowing multiple labels to match. TypeSafe's [255-option Choice limit](https://docs.typesafe.ai/api) is not a limit on Noul questions. The reviewed API and primitives references do not specify a numeric maximum for the questions map or a separate character maximum for instructions.

[Jev model context](https://docs.typesafe.ai/models) is 64k tokens for state plus all questions, and 32k tokens for state plus the longest question. Feed Lens uses conservative local UTF-8 JSON byte budgets of 60,000 and 30,000 respectively before sending. These are product preflight checks, not the provider's tokenizer or an exact token count; a request above them reports a size error without sending. The 60-label and 400-character caps are product limits, not claimed API limits. Keep descriptions focused; many maximum-length descriptions may exceed the combined request budget.
