# Win32 Port - Foreman Protocol

**CRITICAL LESSON LEARNED**: Previous session failed because agents output logs directly to foreman, blowing up context window.

---

## Agent Communication Rules

### 1. OUTPUT ONLY TO MARKDOWN FILES
- Agents write findings to `reports/win32/wave{N}/XX-topic.md`
- Agents NEVER dump logs/analysis to stdout for foreman to read
- First ~50 lines of agent output is just status confirmation

### 2. FOREMAN BEHAVIOR
- Launch agents with `run_in_background: true`
- DO NOT poll agent output constantly
- Wait for completion, then read markdown summaries
- Check task status periodically, not obsessively

### 3. FILE STRUCTURE
```
reports/win32/
├── FOREMAN_PROTOCOL.md     # This file
├── STATUS.md               # Current progress tracker
├── wave1/                  # Understanding current architecture
│   ├── 01-msvc-example.md      ✅ COMPLETE
│   ├── 02-architecture.md      ✅ COMPLETE
│   ├── 03-gmcp.md              ✅ COMPLETE
│   ├── 04-networking.md        ✅ COMPLETE
│   ├── 05-ui-rendering.md      ✅ COMPLETE
│   ├── 06-accessibility.md     ✅ COMPLETE
│   └── 07-audio.md             ✅ COMPLETE
├── wave2/                  # Verification & gap-finding
│   ├── 01-architecture-verify.md
│   ├── 02-gmcp-verify.md
│   ├── 03-networking-verify.md
│   └── 04-gaps-found.md
├── wave3/                  # Win32/MSVC translation planning
│   ├── 01-win32-architecture.md
│   ├── 02-win32-networking.md
│   ├── 03-win32-ui.md
│   └── 04-win32-gmcp.md
└── wave4/                  # Translation verification
    ├── 01-feasibility.md
    └── 02-completeness.md
```

### 4. AGENT PROMPT TEMPLATE
```
You are a research agent. Your task is: [SPECIFIC TASK]

**CRITICAL OUTPUT RULES**:
1. Write ALL findings to: reports/win32/wave{N}/XX-name.md
2. Do NOT output lengthy analysis to stdout
3. Only output brief status updates (started, section complete, done)
4. Use the Write tool to create your markdown report
5. Include: executive summary, findings, code references, recommendations

**Your output directory**: C:\Users\Q\code\react-client\reports\win32\wave{N}/
**Reference**: Can consult reports/wave1/, reports/wave2/, plans/ios/ for context
```

---

## Current Status

**Wave 1**: ✅ COMPLETE (7 reports)
**Wave 2**: 🔄 PENDING - Need verification agents
**Wave 3**: ⏳ WAITING
**Wave 4**: ⏳ WAITING

---

## Wave 2 Agent Assignments

1. **Architecture Verifier**: Cross-check wave1 architecture report, find gaps
2. **GMCP Verifier**: Verify all GMCP packages documented, check implementation details
3. **Networking Verifier**: Verify WebSocket/Telnet handling documented correctly
4. **Gap Hunter**: Read ALL wave1 reports, find anything missed

Each agent writes to `reports/win32/wave2/XX-name.md`
