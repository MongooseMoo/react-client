# Goal
Restore desktop notifications for StageTalk directed speech whenever the client window is unfocused. Q explicitly requires this without an idle delay or the remote notification service.

# State
PR #213 on fix/stagetalk-desktop-notifications restores the original say_to_you behavior regardless of the per-channel notify flag. Other channels still follow their flag. The Channels preference row displays Always when unfocused for directed speech instead of offering a toggle that the restored behavior would ignore. Updated the existing notification test to exercise focused and unfocused directed speech with notify false and ordinary channels. No new test infrastructure. Hosted checks are running; asked Q for normal merge/deployment approval.

# Decisions and why
Source history shows directed speech previously notified unconditionally when unfocused; channel preferences replaced that condition. Restore it at the existing handler. Server #89 already sends say_to_you before its separate idle/offline push checks. No server changes belong to this fix. The unrelated server idle-threshold change from the earlier investigation was reverted live.

# Surprises
Computer Use refused access to the installed Mongoose window because it could not verify whether the URL was allowed. No bypass attempted. Physical desktop notification receipt is not verified. Current server q connection supports Comm.Channel and is not gagged.

# Next step
Commit and publish the scoped PR, wait for hosted CI, resolve any failures, and complete the authorized delivery. Preserve unrelated primary checkout work.
