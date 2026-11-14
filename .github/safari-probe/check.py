"""Classifies each probed file by onset offset against ffmpeg's edit-list-honouring decode.
Exits 1 unless every file matches outcome A (honours the edit list)."""
import json
import sys

EXPECT = {  # path: (edit-list media time M or None, ffmpeg onsets with the edit list honoured)
    "sonniss-gdc/2020/fox-audio-post-production-mechanimal-vocalization/mechanimal-096.m4a": (1024, [9093, 13685, 17949]),
    "sonniss-gdc/2019/the-chris-alan-gliss-bliss/marimba-gliss-up-down-flourish-slow-04.m4a": (1024, [10723, 13073, 16178]),
    "sonniss-gdc/2018/bluezone-corporation-metal-debris/bluezone-bc0236-metal-whoosh-021.m4a": (1024, [4171, 13822, 29069]),
    "sonniss-gdc/2020/matias-mac-sd-retrace/fx-transition-06.m4a": (1024, [2196, 16180, 36493]),
    "sonniss-gdc/2020/smart-sound-fx-user-interaction/slide-generic-small-plastic-turn-back-02.m4a": (1024, [3114, 6287, 7170]),
    "mud/alteraeon-mushz/world-sounds/combat/grunts/1/neuter/65.m4a": (768, [261, 704, 2040]),
    "user-131/reaction/applaud-8-1.m4a": (0, [2541, 2916, 53861]),
    "chatmud/spongebob-wav.m4a": (None, [604, 1790, 3482]),
    "destruction/glass/window-broken.m4a": (0, [2188, 3835, 4147]),
}
TOL = 64
A = "A honours edit list"

data = json.load(open(sys.argv[1]))
print(data["userAgent"])
ok = True
for r in data["results"]:
    M, ref = EXPECT[r["path"]]
    if "error" in r:
        print("ERROR", r["path"], r["error"])
        ok = False
        continue
    d = r["onset"][0] - ref[0] if r["onset"][0] is not None else None
    hyps = {A: 0, "C edit list + 2112": -2112}
    if M is not None:
        hyps["B ignores edit list"] = M
        hyps["D ignores edit list, trims 2112"] = M - 2112
    else:
        hyps["no trim of iTunSMPB priming"] = 2112
    match = [h for h, v in hyps.items() if d is not None and abs(d - v) <= TOL]
    print(r["path"], "rate", r["sampleRate"], "len", r["length"], "onsets", r["onset"], "d", d, "->", match or "OTHER")
    # With M = 0, B equals A, so membership (not equality with [A]) decides.
    ok = ok and A in match
sys.exit(0 if ok else 1)
