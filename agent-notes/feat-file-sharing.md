# feat/file-share-small

## Goal

DC++-style sharing on top of the existing `Client.FileTransfer` send: share a folder, let
other players browse, search and request files, and send each requested file through the
existing engine. Q: about 20 lines on top of the existing system.

## State

- b07ced28: the sharing messages (Share, Browse, List, Search, Result, Request), plus
  top-level `resume` on Offer and `hash` on Candidate.
- 7c29b714: `sharedFile` engine option (a Request sends the shared file, or rejects);
  `src/fileTransfer/sharing.ts` (folder pick, content-id hashing, Browse/Search answers,
  auto-accept of requested offers); `src/components/FileTransfer/Sharing.tsx`.
- MOO side live on `#5897` (handle_share, handle_browse/handle_request,
  handle_list/handle_result, handle_search, rate limits), read live 2026-10-18.

## Decisions and why

- No new frames, storage or multi-source: the existing engine already transfers, resumes
  and verifies.
- CI on the PR is the check. Nothing is re-run locally.

## Next step

Push, open the PR, read CI.
