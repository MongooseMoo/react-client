# MOO expression assignments

## Goal
Fix the false undefined-local warning for `if (valid(channel = this:current_channel(player)))` and push a client PR. Q authorized implementation with "MAKE IT SO!". ToastStunt at `~/src/toaststunt` is the syntax authority.

## State
Branch `fix/moo-expression-assignments`, isolated from the user's dirty primary checkout, based on origin/master at 000c4b15. Scanner fix implemented: scan the entire masked source with an identifier boundary and exclude property names. Ready to commit and open PR; hosted validation pending.

## Decisions and why
Smallest change: approximately 20 lines in the existing assignment-definition collector. Scan masked source for identifier assignment targets regardless of expression punctuation or line breaks; exclude property names using the existing previous-character helper. No new parser or semantic architecture.

ToastStunt `src/parser.y:139` accepts expressions in if conditions; `:466-486` constructs assignment expressions. The installed tree-sitter WASM parses the reported example into an assignment_expression with hasError false. Client `src/editor/moocode/semantics.ts:919` instead requires a preceding line start, whitespace or semicolon, missing the target immediately after `(`. Correct that existing rule first.

No npm package change is justified by this example. Other reported issues have not yet been supplied. Do not publish an unchanged parser package.

## Surprises
The warning is produced by the client's text-based semantic model, not tree-sitter. The current checkout is older than origin/master and contains unrelated untracked work.

## Next step
Commit, push and open the PR. Use hosted CI rather than running its steps locally. No new guards or test files added, per Q's standing instruction. Do not merge or release as part of this client PR request.
