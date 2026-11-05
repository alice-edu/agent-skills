# GitHub

How the user's reviews and replies read on GitHub, and how to post them so they land.

## A review of someone else's PR

- One review a round. The body starts with `**AI:**`, then what was reviewed and the verdict in a sentence or two: "Re-reviewed at `abc1234`. Every earlier fix checks out. One new P1 …".
- Each finding is an inline comment at its line, starting `**AI:** **P1.**` or `**AI:** **P2.**`: what goes wrong, for whom, the evidence, and a suggested fix. A P2 says it's optional.
- The event follows the findings: `REQUEST_CHANGES` when a P1 is open, `APPROVE` when only P2s are left ("a few optional nits, none blocking"), `COMMENT` only when the user chose it.
- Post it in one call, pinned to the head reviewed:

  ```bash
  gh api repos/<owner>/<repo>/pulls/<n>/reviews --input review.json
  # {"commit_id": "<head sha>", "event": "APPROVE|REQUEST_CHANGES|COMMENT",
  #  "body": "**AI:** …", "comments": [{"path": "…", "line": 12, "side": "RIGHT", "body": "**AI:** **P2.** …"}]}
  ```

- An inline comment's `line` has to be a line the diff shows (`side: "RIGHT"` for the new code, `"LEFT"` for removed), or GitHub rejects the whole review with a 422. A finding about code outside the diff goes in the body, with its `file:line`.
- Read it back (`gh api repos/<owner>/<repo>/pulls/<n>/reviews`). Done when the newest review by `gh api user --jq .login` has the intended `state` and `commit_id`. Saying "approved" in Slack while GitHub shows no approval leaves the author unable to merge (alicia #711), so the Slack reply waits for this.

## Replies on the user's own PR

- Each reviewer comment gets a reply in its thread, no prefix: `Agreed, fixed in <sha>: <what changed>.`, or for one kept as it is, the reason in a sentence or two, with the evidence (a line, a test, a doc).
- Post with `gh api repos/<owner>/<repo>/pulls/<n>/comments/<root id>/replies -f body=…`, where the root is the thread's first comment: a comment's `in_reply_to_id` when it has one, else its own `id` (GitHub takes replies to the root only). A top-level review's points get one PR comment (`gh pr comment`).
- The reviewer resolves threads. Leave them open.
- Re-request the reviewer after a round: `gh api -X POST repos/<owner>/<repo>/pulls/<n>/requested_reviewers -f 'reviewers[]=<login>'`.
