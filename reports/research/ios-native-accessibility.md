# iOS Native Accessibility Research for MUD Client

**Date:** 2025-12-12
**Purpose:** Comprehensive research on native iOS accessibility for a text-based MUD client
**Target Users:** Blind and low-vision users who rely on VoiceOver
**Requirement:** FULLY NATIVE accessibility - no web views, no compromises

---

## Executive Summary

This document provides a comprehensive guide to implementing native iOS accessibility for a MUD (Multi-User Dungeon) client. Text-based games have historically been highly accessible to blind users, and this implementation must maintain that tradition while leveraging modern iOS accessibility APIs.

**Key Findings:**

1. **iOS Accessibility is First-Class:** SwiftUI and UIKit provide excellent native accessibility support that surpasses web-based solutions for screen reader users
2. **VoiceOver Integration is Critical:** Proper use of accessibility labels, hints, values, and announcements will make or break the experience
3. **Streaming Text Presents Unique Challenges:** MUD output requires careful announcement strategies to avoid overwhelming or interrupting users
4. **ANSI Colors Require Semantic Conversion:** Color information must be conveyed through text labels, not just visual styling
5. **Dynamic Type and Reduce Motion are Essential:** Users with low vision need scalable text; users with vestibular disorders need minimal animation

**Architecture Decision:** Use SwiftUI with UIKit interop for performance-critical components (output rendering), with comprehensive accessibility annotations throughout.

---

## 1. VoiceOver Integration

### 1.1 Core Accessibility Modifiers

SwiftUI provides five fundamental accessibility modifiers that must be used throughout the app:

#### `.accessibilityLabel(_:)`
Provides the primary description of an element. This is what VoiceOver reads first.

```swift
Button("⚔️") {
    client.sendCommand("attack")
}
.accessibilityLabel("Attack")
```

**Best Practices:**
- Keep labels short and descriptive (2-5 words)
- Avoid redundancy (don't say "button" - VoiceOver adds that automatically)
- Use present tense action verbs for interactive elements
- For MUD context: Label exit buttons with their direction, item buttons with the item name

**MUD-Specific Examples:**
```swift
// Exit buttons
Button("north") { ... }
    .accessibilityLabel("Go north")

// Item in room
Button("rusty sword") { ... }
    .accessibilityLabel("Rusty sword")

// Player action
Button("🎒") { ... }
    .accessibilityLabel("Open inventory")
```

#### `.accessibilityHint(_:)`
Provides additional context about what will happen when the user interacts with the element. Read after a short delay.

```swift
Button("Save Log") {
    saveOutputLog()
}
.accessibilityLabel("Save Log")
.accessibilityHint("Saves the output history to a file")
```

**Best Practices:**
- Optional - only add when the action isn't obvious
- Start with a verb ("Opens...", "Sends...", "Displays...")
- Keep concise (under 10 words)
- For MUD context: Explain game-specific actions that might not be obvious

**MUD-Specific Examples:**
```swift
// Complex action
Button("Cast Fireball") { ... }
    .accessibilityLabel("Cast Fireball")
    .accessibilityHint("Targets the enemy you're currently fighting")

// Navigation with context
Button("east") { ... }
    .accessibilityLabel("Go east")
    .accessibilityHint("Leads to the town square")
```

#### `.accessibilityValue(_:)`
Provides the current state or value of the element. Used for sliders, toggles, progress indicators.

```swift
Slider(value: $speechRate, in: 0.1...2.0)
    .accessibilityLabel("Speech rate")
    .accessibilityValue("\(Int(speechRate * 100))%")

Toggle(isOn: $localEcho)
    .accessibilityLabel("Local echo")
    .accessibilityValue(localEcho ? "On" : "Off")
```

**MUD-Specific Examples:**
```swift
// HP/MP vitals
Text("\(hp)/\(maxHp)")
    .accessibilityLabel("Health")
    .accessibilityValue("\(hp) out of \(maxHp)")

// Status effect
Image(systemName: isPoisoned ? "drop.fill" : "drop")
    .accessibilityLabel("Poison status")
    .accessibilityValue(isPoisoned ? "Poisoned" : "Not poisoned")
```

#### `.accessibilityAddTraits(_:)` and `.accessibilityRemoveTraits(_:)`
Specifies how the element should be treated by VoiceOver.

```swift
Text(roomDescription)
    .accessibilityAddTraits(.isHeader)

Text("You are in a dark forest...")
    .accessibilityAddTraits(.isStaticText)
    .accessibilityRemoveTraits(.updatesFrequently)

outputView
    .accessibilityAddTraits(.updatesFrequently)
```

**Common Traits:**
- `.isButton` - Element acts as a button
- `.isHeader` - Element is a heading
- `.isStaticText` - Text doesn't change (VoiceOver won't poll for updates)
- `.updatesFrequently` - Content changes often (VoiceOver will monitor)
- `.isLink` - Element is a link
- `.isSearchField` - Element is a search field
- `.playsSound` - Interaction produces sound
- `.startsMediaSession` - Interaction starts audio/video playback

**MUD-Specific Examples:**
```swift
// Room name is a header
Text(roomInfo.name)
    .font(.title)
    .accessibilityAddTraits(.isHeader)

// Output view updates frequently
ScrollView {
    LazyVStack {
        ForEach(outputEntries) { entry in
            OutputLineView(entry: entry)
        }
    }
}
.accessibilityAddTraits(.updatesFrequently)

// Exit links act as buttons but could be treated as links
Button("north") { ... }
    .accessibilityAddTraits(.isLink)
```

#### `.accessibilityHidden(_:)`
Hides decorative elements from VoiceOver.

```swift
// Decorative divider
Divider()
    .accessibilityHidden(true)

// Background pattern
Image("texture")
    .resizable()
    .accessibilityHidden(true)
```

**Best Practice:** Hide purely decorative elements to reduce cognitive load for screen reader users.

### 1.2 Accessibility Announcements for Live Content

For streaming MUD output, we need to announce new content without overwhelming users. iOS provides `UIAccessibility.post(notification:argument:)`.

#### Basic Announcement Pattern

```swift
import UIKit

class OutputViewModel: ObservableObject {
    @Published var outputEntries: [OutputEntry] = []
    private var announcementQueue: [String] = []
    private var isAnnouncing = false

    func appendEntry(_ entry: OutputEntry, shouldAnnounce: Bool = true) {
        outputEntries.append(entry)

        if shouldAnnounce && UIAccessibility.isVoiceOverRunning {
            let plainText = entry.toPlainText()
            queueAnnouncement(plainText)
        }
    }

    private func queueAnnouncement(_ text: String) {
        announcementQueue.append(text)
        processAnnouncementQueue()
    }

    private func processAnnouncementQueue() {
        guard !isAnnouncing, let next = announcementQueue.first else { return }

        isAnnouncing = true
        announcementQueue.removeFirst()

        UIAccessibility.post(
            notification: .announcement,
            argument: next
        )

        // Listen for announcement completion
        NotificationCenter.default.addObserver(
            forName: UIAccessibility.announcementDidFinishNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let self = self else { return }

            // Check if announcement was successful
            if let userInfo = notification.userInfo,
               let wasSuccessful = userInfo[UIAccessibility.announcementStringValueUserInfoKey] as? String,
               wasSuccessful == next {

                self.isAnnouncing = false

                // Process next announcement after a brief delay
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.processAnnouncementQueue()
                }
            }
        }
    }
}
```

#### Announcement Types

iOS provides several notification types for different scenarios:

```swift
// General announcement (doesn't move focus)
UIAccessibility.post(
    notification: .announcement,
    argument: "Welcome to the game!"
)

// Layout changed (moves focus, plays sound)
UIAccessibility.post(
    notification: .layoutChanged,
    argument: newButton // Focus moves to this element
)

// Screen changed (entire screen replaced, plays different sound)
UIAccessibility.post(
    notification: .screenChanged,
    argument: firstElement
)
```

**MUD-Specific Usage:**
- `.announcement` - For new output lines, combat messages, room descriptions
- `.layoutChanged` - When items appear/disappear in room, inventory updates
- `.screenChanged` - When connecting/disconnecting, changing major UI sections

#### Rate Limiting Announcements

MUD output can be rapid. Implement rate limiting to prevent overwhelming users:

```swift
class MUDAnnouncer {
    private var lastAnnouncementTime = Date.distantPast
    private let minimumInterval: TimeInterval = 0.5 // 500ms
    private var pendingAnnouncement: String?

    func announce(_ text: String, priority: AnnouncementPriority = .normal) {
        let now = Date()
        let timeSinceLastAnnouncement = now.timeIntervalSince(lastAnnouncementTime)

        switch priority {
        case .critical:
            // Always announce immediately
            performAnnouncement(text)

        case .high:
            // Announce if enough time has passed, otherwise queue
            if timeSinceLastAnnouncement >= minimumInterval {
                performAnnouncement(text)
            } else {
                pendingAnnouncement = text
                scheduleDelayedAnnouncement()
            }

        case .normal:
            // Queue and debounce
            pendingAnnouncement = text
            scheduleDelayedAnnouncement()

        case .low:
            // Only announce if user is idle
            if timeSinceLastAnnouncement >= 2.0 {
                performAnnouncement(text)
            }
        }
    }

    private func performAnnouncement(_ text: String) {
        UIAccessibility.post(notification: .announcement, argument: text)
        lastAnnouncementTime = Date()
        pendingAnnouncement = nil
    }

    private func scheduleDelayedAnnouncement() {
        DispatchQueue.main.asyncAfter(deadline: .now() + minimumInterval) { [weak self] in
            guard let self = self, let pending = self.pendingAnnouncement else { return }
            self.performAnnouncement(pending)
        }
    }
}

enum AnnouncementPriority {
    case critical  // Death, level up, critical errors
    case high      // Combat results, important messages
    case normal    // Room descriptions, NPC dialogue
    case low       // Ambient messages, flavor text
}
```

#### Grouping Related Output

For rapid combat or channel messages, group related content:

```swift
class OutputGrouper {
    private var currentGroup: [String] = []
    private var groupTimer: Timer?
    private let groupDelay: TimeInterval = 1.0

    func addToGroup(_ text: String, announce: @escaping (String) -> Void) {
        currentGroup.append(text)

        // Reset timer
        groupTimer?.invalidate()
        groupTimer = Timer.scheduledTimer(withTimeInterval: groupDelay, repeats: false) { [weak self] _ in
            guard let self = self else { return }

            // Announce grouped content
            let grouped = self.currentGroup.joined(separator: ". ")
            announce(grouped)

            self.currentGroup.removeAll()
        }
    }
}
```

### 1.3 Live Regions

SwiftUI doesn't have a direct equivalent to ARIA live regions, but we can replicate the behavior:

```swift
struct LiveRegionView: View {
    @State private var liveMessages: [String] = []
    private let maxMessages = 50 // Limit like React's LIVE_REGION_LIMIT

    var body: some View {
        // Hidden from sighted users but read by VoiceOver
        VStack {
            ForEach(liveMessages.indices, id: \.self) { index in
                Text(liveMessages[index])
                    .accessibilityAddTraits(.updatesFrequently)
            }
        }
        .frame(width: 0, height: 0)
        .accessibilityHidden(false) // Visible to VoiceOver
    }

    func addMessage(_ message: String) {
        liveMessages.append(message)

        // Trim to limit
        if liveMessages.count > maxMessages {
            liveMessages.removeFirst(liveMessages.count - maxMessages)
        }

        // Also announce immediately
        UIAccessibility.post(notification: .announcement, argument: message)
    }
}
```

**Alternative Approach:** Use accessibility announcements directly rather than hidden views:

```swift
// Preferred for MUD client - simpler and more direct
func handleNewOutput(_ text: String) {
    // Store in model
    outputEntries.append(OutputEntry(text: text))

    // Announce if VoiceOver is running
    if UIAccessibility.isVoiceOverRunning {
        announcer.announce(text, priority: .normal)
    }
}
```

---

## 2. Dynamic Type Support

Dynamic Type allows users to scale text size system-wide. This is critical for low-vision users.

### 2.1 Using System Fonts

SwiftUI automatically supports Dynamic Type when using system text styles:

```swift
// GOOD - Scales with user preference
Text("Room Description")
    .font(.title)

Text(roomDescription)
    .font(.body)

Text("Health: \(hp)/\(maxHp)")
    .font(.caption)

// BAD - Fixed size
Text("Room Description")
    .font(.system(size: 24))
```

**System Text Styles:**
- `.largeTitle` - Largest heading
- `.title`, `.title2`, `.title3` - Section headings
- `.headline` - Emphasized body text
- `.body` - Default body text
- `.callout` - Secondary information
- `.subheadline` - Less prominent than body
- `.footnote` - Least prominent
- `.caption`, `.caption2` - Smallest text

### 2.2 Scaling Custom Fonts

For the monospace MUD output, use Dynamic Type with custom fonts:

```swift
// Define scaled metrics
@ScaledMetric var fontSize: CGFloat = 14

var body: some View {
    Text(outputLine)
        .font(.system(size: fontSize, design: .monospaced))
}
```

Or create a custom font modifier:

```swift
extension Font {
    static func mudMonospace(_ style: Font.TextStyle = .body) -> Font {
        return .system(style, design: .monospaced)
    }
}

// Usage
Text(outputLine)
    .font(.mudMonospace(.body))
```

### 2.3 Layout Adaptation

Layouts must adapt to larger text sizes. Test with the largest accessibility sizes:

```swift
struct RoomInfoView: View {
    @Environment(\.sizeCategory) var sizeCategory

    var body: some View {
        Group {
            if sizeCategory.isAccessibilityCategory {
                // Vertical layout for large text
                VStack(alignment: .leading, spacing: 8) {
                    roomContent
                }
            } else {
                // Horizontal layout for normal text
                HStack(spacing: 12) {
                    roomContent
                }
            }
        }
    }

    @ViewBuilder
    var roomContent: some View {
        Text(roomName)
            .font(.headline)

        Text(roomArea)
            .font(.caption)
            .foregroundColor(.secondary)
    }
}
```

### 2.4 Minimum Touch Targets

iOS Human Interface Guidelines specify 44×44 points minimum for touch targets. This becomes more critical with large text:

```swift
Button("N") {
    client.sendCommand("north")
}
.frame(minWidth: 44, minHeight: 44)
.accessibilityLabel("Go north")

// For smaller visual buttons, expand the tap area invisibly
Button(action: { ... }) {
    Image(systemName: "arrow.up")
        .frame(width: 24, height: 24)
}
.frame(minWidth: 44, minHeight: 44)
```

### 2.5 Testing Dynamic Type

Test with Xcode Accessibility Inspector or device settings:

```swift
// Preview with different text sizes
struct RoomInfoView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            RoomInfoView(roomInfo: sampleRoom)
                .environment(\.sizeCategory, .medium)
                .previewDisplayName("Medium")

            RoomInfoView(roomInfo: sampleRoom)
                .environment(\.sizeCategory, .accessibilityExtraExtraExtraLarge)
                .previewDisplayName("AX5 (Largest)")
        }
    }
}
```

---

## 3. MUD-Specific Accessibility Challenges

### 3.1 Streaming Text Output

**Challenge:** MUD servers send continuous text. How do we announce new content without interrupting the user or causing announcement spam?

**Solution Strategy:**

#### Approach 1: Polite Announcements with Queueing
```swift
class MUDOutputManager: ObservableObject {
    @Published var outputLines: [OutputLine] = []
    private let announcer = MUDAnnouncer()

    func appendLine(_ text: String, type: OutputType) {
        let line = OutputLine(text: text, type: type)
        outputLines.append(line)

        // Determine announcement priority
        let priority: AnnouncementPriority = {
            switch type {
            case .death, .levelUp, .criticalError:
                return .critical
            case .combatResult, .say, .tell:
                return .high
            case .roomDescription, .look:
                return .normal
            case .ambience, .weather:
                return .low
            }
        }()

        announcer.announce(text, priority: priority)
    }
}
```

#### Approach 2: User-Controlled Verbosity
```swift
enum VoiceOverVerbosity: String, CaseIterable {
    case all = "Announce All Messages"
    case important = "Important Messages Only"
    case critical = "Critical Messages Only"
    case manual = "Manual Only (User Navigates)"
}

class AccessibilityPreferences: ObservableObject {
    @AppStorage("voiceOverVerbosity") var verbosity: VoiceOverVerbosity = .important

    func shouldAnnounce(_ type: OutputType) -> Bool {
        switch verbosity {
        case .all:
            return true
        case .important:
            return type.isImportant
        case .critical:
            return type.isCritical
        case .manual:
            return false // User navigates with swipes
        }
    }
}

extension OutputType {
    var isImportant: Bool {
        switch self {
        case .death, .levelUp, .criticalError, .say, .tell, .combatResult:
            return true
        default:
            return false
        }
    }

    var isCritical: Bool {
        switch self {
        case .death, .levelUp, .criticalError:
            return true
        default:
            return false
        }
    }
}
```

#### Approach 3: Navigable History (Recommended)
```swift
// Allow VoiceOver users to swipe through output history
// Announcements are minimal, user explores at their own pace

struct OutputView: View {
    let entries: [OutputEntry]

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 4) {
                ForEach(entries) { entry in
                    OutputLineView(entry: entry)
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel(entry.accessibilityLabel)
                }
            }
        }
        // Important: Allow VoiceOver to navigate line by line
        .accessibilityElement(children: .contain)
    }
}

struct OutputLineView: View {
    let entry: OutputEntry

    var body: some View {
        Text(entry.attributedString)
            .font(.mudMonospace())
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

extension OutputEntry {
    var accessibilityLabel: String {
        // Convert ANSI styled text to plain text with semantic info
        let plain = toPlainText()

        // Add type context
        let prefix: String = {
            switch type {
            case .say:
                return "Someone says: "
            case .tell:
                return "Private message: "
            case .combatResult:
                return "Combat: "
            case .roomDescription:
                return "Description: "
            default:
                return ""
            }
        }()

        return prefix + plain
    }
}
```

### 3.2 ANSI Colors and Accessibility

**Challenge:** ANSI color codes are purely visual. Blind users can't perceive "red text" vs "green text". MUDs often use color to convey meaning (red = damage, green = healing, yellow = warning).

**Solution:** Convert visual styling to semantic labels.

#### ANSI Parser with Semantic Extraction
```swift
struct ANSIToken {
    let text: String
    let foregroundColor: UIColor?
    let backgroundColor: UIColor?
    let isBold: Bool
    let isUnderline: Bool

    // Semantic interpretation
    var semanticMeaning: String? {
        // Interpret colors in MUD context
        if let fg = foregroundColor {
            if fg == .systemRed {
                return "damage"
            } else if fg == .systemGreen {
                return "healing"
            } else if fg == .systemYellow {
                return "warning"
            } else if fg == .systemCyan {
                return "information"
            }
        }

        if isBold {
            return "emphasized"
        }

        return nil
    }
}

class AccessibleANSIParser {
    func parseToAttributedString(_ ansi: String) -> NSAttributedString {
        // Standard ANSI parsing
        let tokens = parseANSI(ansi)

        let attributed = NSMutableAttributedString()

        for token in tokens {
            var attrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.monospacedSystemFont(ofSize: 14, weight: token.isBold ? .bold : .regular)
            ]

            if let fg = token.foregroundColor {
                attrs[.foregroundColor] = fg
            }

            if let bg = token.backgroundColor {
                attrs[.backgroundColor] = bg
            }

            if token.isUnderline {
                attrs[.underlineStyle] = NSUnderlineStyle.single.rawValue
            }

            // Store semantic meaning as custom attribute
            if let semantic = token.semanticMeaning {
                attrs[.accessibilitySpeechIPANotation] = semantic // Using existing key as example
            }

            attributed.append(NSAttributedString(string: token.text, attributes: attrs))
        }

        return attributed
    }

    func parseToAccessibleText(_ ansi: String) -> String {
        // Convert ANSI to text with semantic annotations
        let tokens = parseANSI(ansi)

        var result = ""

        for token in tokens {
            if let semantic = token.semanticMeaning {
                // Wrap in semantic markers
                result += "[\(semantic)] \(token.text) "
            } else {
                result += token.text
            }
        }

        return result.trimmingCharacters(in: .whitespaces)
    }
}

// Usage
let parser = AccessibleANSIParser()
let visual = parser.parseToAttributedString(ansiText) // For display
let accessible = parser.parseToAccessibleText(ansiText) // For VoiceOver

Text(AttributedString(visual))
    .accessibilityLabel(accessible)
```

#### Color Name Announcements (Alternative)
```swift
extension UIColor {
    var accessibilityName: String {
        switch self {
        case .systemRed: return "red"
        case .systemGreen: return "green"
        case .systemBlue: return "blue"
        case .systemYellow: return "yellow"
        case .systemOrange: return "orange"
        case .systemPurple: return "purple"
        case .systemPink: return "pink"
        case .systemTeal: return "teal"
        default: return "colored"
        }
    }
}

// Option in preferences
@AppStorage("announceColors") var announceColors = false

func accessibleLabel(for token: ANSIToken) -> String {
    var parts: [String] = []

    if announceColors, let color = token.foregroundColor?.accessibilityName {
        parts.append("in \(color)")
    }

    if token.isBold {
        parts.append("emphasized")
    }

    parts.append(token.text)

    return parts.joined(separator: ", ")
}
```

### 3.3 Room Descriptions and Navigation

**Challenge:** Room descriptions can be long. Exits, items, and players need to be easily discoverable.

**Solution:** Use accessibility rotors for custom navigation.

#### Custom Rotor for Room Elements
```swift
struct RoomInfoView: View {
    let roomInfo: RoomInfo
    @Namespace private var namespace

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Room name
                Text(roomInfo.name)
                    .font(.title)
                    .accessibilityAddTraits(.isHeader)
                    .accessibilityIdentifier("room-name")

                // Description
                Text(roomInfo.description)
                    .font(.body)

                // Exits
                if !roomInfo.exits.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Exits")
                            .font(.headline)
                            .accessibilityAddTraits(.isHeader)

                        FlowLayout(spacing: 8) {
                            ForEach(roomInfo.exits, id: \.self) { exit in
                                ExitButton(direction: exit)
                                    .accessibilityIdentifier("exit-\(exit)")
                            }
                        }
                    }
                }

                // Items
                if !roomInfo.items.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Items")
                            .font(.headline)
                            .accessibilityAddTraits(.isHeader)

                        ForEach(roomInfo.items) { item in
                            ItemRow(item: item)
                                .accessibilityIdentifier("item-\(item.id)")
                        }
                    }
                }

                // Players
                if !roomInfo.players.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Players")
                            .font(.headline)
                            .accessibilityAddTraits(.isHeader)

                        ForEach(roomInfo.players) { player in
                            PlayerRow(player: player)
                                .accessibilityIdentifier("player-\(player.id)")
                        }
                    }
                }
            }
            .padding()
        }
        // Custom rotors for navigation
        .accessibilityRotor("Exits") {
            ForEach(roomInfo.exits, id: \.self) { exit in
                AccessibilityRotorEntry("Exit \(exit)", id: "exit-\(exit)")
            }
        }
        .accessibilityRotor("Items") {
            ForEach(roomInfo.items) { item in
                AccessibilityRotorEntry(item.name, id: "item-\(item.id)")
            }
        }
        .accessibilityRotor("Players") {
            ForEach(roomInfo.players) { player in
                AccessibilityRotorEntry(player.name, id: "player-\(player.id)")
            }
        }
    }
}
```

**How Rotors Work:**
1. User focuses on the RoomInfoView
2. User rotates two fingers on screen (or uses rotor gesture)
3. Rotor menu appears with options: "Headings", "Exits", "Items", "Players"
4. User selects "Exits" rotor
5. User swipes up/down to jump between exits
6. VoiceOver announces each exit as the user navigates

This is **vastly superior** to forcing users to swipe through every piece of content linearly.

### 3.4 Combat Messages

**Challenge:** Combat generates rapid messages. Announcing every hit/miss would be overwhelming.

**Solution:** Summarize combat rounds.

```swift
class CombatAnnouncer {
    private var combatBuffer: [CombatMessage] = []
    private var summarizeTimer: Timer?

    func handleCombatMessage(_ message: CombatMessage) {
        combatBuffer.append(message)

        // Reset summary timer
        summarizeTimer?.invalidate()
        summarizeTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: false) { [weak self] _ in
            self?.summarizeCombat()
        }
    }

    private func summarizeCombat() {
        guard !combatBuffer.isEmpty else { return }

        let summary = generateSummary(from: combatBuffer)

        UIAccessibility.post(
            notification: .announcement,
            argument: summary
        )

        combatBuffer.removeAll()
    }

    private func generateSummary(from messages: [CombatMessage]) -> String {
        var playerHits = 0
        var playerMisses = 0
        var enemyHits = 0
        var enemyMisses = 0
        var playerDamage = 0
        var enemyDamage = 0

        for message in messages {
            switch message.type {
            case .playerHit(let damage):
                playerHits += 1
                playerDamage += damage
            case .playerMiss:
                playerMisses += 1
            case .enemyHit(let damage):
                enemyHits += 1
                enemyDamage += damage
            case .enemyMiss:
                enemyMisses += 1
            }
        }

        var parts: [String] = []

        if playerHits > 0 {
            parts.append("You hit \(playerHits) times for \(playerDamage) damage")
        }

        if enemyHits > 0 {
            parts.append("Enemy hit you \(enemyHits) times for \(enemyDamage) damage")
        }

        if parts.isEmpty {
            return "Combat round: no hits"
        }

        return parts.joined(separator: ". ")
    }
}
```

### 3.5 Channel Messages

**Challenge:** Multiple chat channels with different importance levels.

**Solution:** Differentiate channels and allow filtering.

```swift
struct ChannelMessage {
    let channel: String
    let sender: String
    let message: String
    let priority: ChannelPriority
}

enum ChannelPriority {
    case high      // tells, sayto (directed at player)
    case medium    // say, emote (same room)
    case low       // ooc, chat, auction (global channels)
}

class ChannelAnnouncer {
    @AppStorage("announceChannels") var channelPreferences: [String: Bool] = [:]

    func handleChannelMessage(_ message: ChannelMessage) {
        // Check if this channel should be announced
        guard shouldAnnounce(channel: message.channel) else { return }

        // Format announcement with channel context
        let announcement = formatAnnouncement(message)

        // Announce with appropriate priority
        let announcementPriority: AnnouncementPriority = {
            switch message.priority {
            case .high: return .high
            case .medium: return .normal
            case .low: return .low
            }
        }()

        announcer.announce(announcement, priority: announcementPriority)
    }

    private func shouldAnnounce(channel: String) -> Bool {
        channelPreferences[channel] ?? (channel == "tell" || channel == "sayto")
    }

    private func formatAnnouncement(_ message: ChannelMessage) -> String {
        switch message.channel {
        case "tell":
            return "\(message.sender) tells you: \(message.message)"
        case "say":
            return "\(message.sender) says: \(message.message)"
        case "ooc":
            return "OOC from \(message.sender): \(message.message)"
        default:
            return "On \(message.channel), \(message.sender) says: \(message.message)"
        }
    }
}

// Settings UI
struct ChannelPreferencesView: View {
    @ObservedObject var announcer: ChannelAnnouncer
    let channels = ["tell", "sayto", "say", "emote", "ooc", "chat", "auction"]

    var body: some View {
        Form {
            Section("Announce Channels") {
                ForEach(channels, id: \.self) { channel in
                    Toggle(channel.capitalized, isOn: binding(for: channel))
                }
            }
        }
    }

    private func binding(for channel: String) -> Binding<Bool> {
        Binding(
            get: { announcer.channelPreferences[channel] ?? false },
            set: { announcer.channelPreferences[channel] = $0 }
        )
    }
}
```

---

## 4. SwiftUI Accessibility APIs Reference

### 4.1 Complete Modifier List

```swift
// Basic identification
.accessibilityLabel("Description")
.accessibilityHint("What happens when activated")
.accessibilityValue("Current state")

// Traits
.accessibilityAddTraits(.isButton)
.accessibilityRemoveTraits(.isImage)

// Visibility
.accessibilityHidden(false)

// Grouping
.accessibilityElement(children: .combine)  // Combine children into one
.accessibilityElement(children: .contain)  // Keep children separate
.accessibilityElement(children: .ignore)   // Hide all children

// Actions
.accessibilityAction(.default) {
    // Default action (e.g., tap)
}
.accessibilityAction(.escape) {
    // Escape gesture (dismiss modal)
}
.accessibilityAction(named: "Delete") {
    // Custom action
}

// Adjustable controls
.accessibilityAdjustableAction { direction in
    switch direction {
    case .increment:
        value += 1
    case .decrement:
        value -= 1
    @unknown default:
        break
    }
}

// Focus
.accessibilityFocused($isFocused)

// Input labels
.accessibilityInputLabels(["alternative", "labels"])

// Sorting priority (lower reads first)
.accessibilitySortPriority(10)

// Custom rotors
.accessibilityRotor("Name") {
    ForEach(items) { item in
        AccessibilityRotorEntry(item.name, id: item.id)
    }
}

// Text selection (iOS 15+)
.accessibilityTextContentType(.plainText)
.accessibilityShowsLargeContentViewer()

// Direct touch area (for drawing apps)
.accessibilityDirectTouch(options: .silentOnTouch)

// Responsive to environment
.accessibilityRespondsToUserInteraction(true)

// Zoom
.accessibilityZoomAction { action in
    switch action.direction {
    case .zoomIn:
        scale *= 1.2
    case .zoomOut:
        scale /= 1.2
    @unknown default:
        break
    }
}
```

### 4.2 Accessibility Traits

```swift
enum AccessibilityTraits {
    .isButton           // Acts as a button
    .isHeader          // Heading/section divider
    .isSelected        // Currently selected
    .isLink            // Hyperlink
    .isSearchField     // Search input
    .isImage           // Image content
    .playsSound        // Plays audio on interaction
    .isKeyboardKey     // Virtual keyboard key
    .isStaticText      // Text doesn't change
    .isSummaryElement  // Summary of content
    .updatesFrequently // Content changes often
    .startsMediaSession // Begins audio/video
    .allowsDirectInteraction // Passes touch events through
    .causesPageTurn    // Triggers page navigation
}
```

### 4.3 Accessibility Notifications

```swift
// Post notifications to VoiceOver
UIAccessibility.post(notification: .announcement, argument: "Text to speak")
UIAccessibility.post(notification: .layoutChanged, argument: viewToFocus)
UIAccessibility.post(notification: .screenChanged, argument: firstElement)
UIAccessibility.post(notification: .pageScrolled, argument: "Page 2 of 5")

// Listen for notifications
NotificationCenter.default.addObserver(
    forName: UIAccessibility.announcementDidFinishNotification,
    object: nil,
    queue: .main
) { notification in
    // Announcement completed
}

NotificationCenter.default.addObserver(
    forName: UIAccessibility.voiceOverStatusDidChangeNotification,
    object: nil,
    queue: .main
) { notification in
    let isRunning = UIAccessibility.isVoiceOverRunning
}
```

### 4.4 Accessibility Properties

```swift
// Check VoiceOver state
UIAccessibility.isVoiceOverRunning // Bool

// Check other accessibility settings
UIAccessibility.isBoldTextEnabled
UIAccessibility.isGrayscaleEnabled
UIAccessibility.isReduceMotionEnabled
UIAccessibility.isReduceTransparencyEnabled
UIAccessibility.isDarkerSystemColorsEnabled
UIAccessibility.isShakeToUndoEnabled
UIAccessibility.isAssistiveTouchRunning
UIAccessibility.isSwitchControlRunning
UIAccessibility.isClosedCaptioningEnabled
UIAccessibility.isGuidedAccessEnabled

// Differentiate without color (color blind mode)
UIAccessibility.shouldDifferentiateWithoutColor

// Preferred content size category
UIApplication.shared.preferredContentSizeCategory
```

---

## 5. Reduce Motion and Other Accessibility Settings

### 5.1 Reduce Motion

Users with vestibular disorders can experience discomfort from animations. Respect this preference:

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

var body: some View {
    Button("Connect") {
        connect()
    }
    .scaleEffect(isPressed ? 0.95 : 1.0)
    .animation(reduceMotion ? .none : .spring(), value: isPressed)
}
```

**Alternative: Crossfade Instead of Motion**
```swift
if reduceMotion {
    // Fade in/out
    content
        .transition(.opacity)
} else {
    // Slide animation
    content
        .transition(.move(edge: .trailing))
}
```

### 5.2 Differentiate Without Color

Some users have color blindness. Ensure information isn't conveyed by color alone:

```swift
@Environment(\.accessibilityDifferentiateWithoutColor) var differentiateWithoutColor

var body: some View {
    HStack {
        if differentiateWithoutColor {
            // Add shape indicator
            Image(systemName: isConnected ? "checkmark.circle.fill" : "xmark.circle.fill")
        }

        Circle()
            .fill(isConnected ? .green : .red)
            .frame(width: 12, height: 12)

        Text(isConnected ? "Connected" : "Disconnected")
    }
}
```

### 5.3 Reduce Transparency

Transparency effects can make text harder to read for some users:

```swift
@Environment(\.accessibilityReduceTransparency) var reduceTransparency

var body: some View {
    if reduceTransparency {
        Color.black
    } else {
        Color.black.opacity(0.8)
            .background(.ultraThinMaterial)
    }
}
```

### 5.4 Increase Contrast

```swift
@Environment(\.colorSchemeContrast) var contrast

var body: some View {
    Text("Output")
        .foregroundColor(contrast == .increased ? .white : .gray)
        .background(contrast == .increased ? .black : Color(.systemBackground))
}
```

---

## 6. Testing Accessibility

### 6.1 Xcode Accessibility Inspector

Built into Xcode, allows inspecting accessibility properties:

1. Open Accessibility Inspector: Xcode > Open Developer Tool > Accessibility Inspector
2. Select your device/simulator
3. Click "Inspect" button
4. Hover over elements to see accessibility information
5. Run "Audit" to find common issues

### 6.2 VoiceOver Testing Checklist

**On Device:**
1. Enable VoiceOver: Settings > Accessibility > VoiceOver
2. Triple-click side button to toggle VoiceOver
3. Swipe right to move forward, left to move back
4. Double-tap to activate
5. Two-finger rotate for rotor
6. Swipe up/down with rotor active to use rotor items

**What to Test:**
- [ ] All interactive elements have labels
- [ ] Labels are concise and descriptive
- [ ] Hints provide useful context (when needed)
- [ ] Navigation order is logical
- [ ] Custom controls have appropriate traits
- [ ] Live regions announce updates
- [ ] Rotors work for custom navigation
- [ ] No "unlabeled button" or "unlabeled image"
- [ ] Decorative elements are hidden
- [ ] Text scales with Dynamic Type
- [ ] Layouts adapt to large text sizes
- [ ] Animations respect Reduce Motion
- [ ] Color isn't the only indicator

### 6.3 Automated Testing

```swift
import XCTest

class AccessibilityTests: XCTestCase {
    func testVoiceOverLabels() {
        let app = XCUIApplication()
        app.launch()

        // Check that main elements have accessibility labels
        XCTAssertTrue(app.buttons["Connect"].exists)
        XCTAssertTrue(app.textFields["Command input"].exists)
        XCTAssertTrue(app.scrollViews["MUD output"].exists)
    }

    func testMinimumTapTargets() {
        let app = XCUIApplication()
        app.launch()

        // Verify touch target sizes
        let exitButton = app.buttons["Go north"]
        XCTAssertGreaterThanOrEqual(exitButton.frame.width, 44)
        XCTAssertGreaterThanOrEqual(exitButton.frame.height, 44)
    }
}
```

---

## 7. Code Examples for MUD Client

### 7.1 Accessible Output View

```swift
import SwiftUI

struct AccessibleOutputView: View {
    @ObservedObject var outputManager: MUDOutputManager
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    @Environment(\.sizeCategory) var sizeCategory

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 4) {
                    ForEach(outputManager.entries) { entry in
                        OutputLineView(entry: entry)
                            .id(entry.id)
                            .accessibilityElement(children: .combine)
                            .accessibilityLabel(entry.accessibilityLabel)
                            .accessibilityAddTraits(entry.traits)
                    }
                }
                .padding(.horizontal, 8)
            }
            .onChange(of: outputManager.entries.count) { _ in
                if outputManager.shouldAutoScroll {
                    let animation: Animation? = reduceMotion ? .none : .easeOut(duration: 0.3)
                    withAnimation(animation) {
                        proxy.scrollTo(outputManager.entries.last?.id, anchor: .bottom)
                    }
                }
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Game output")
        .accessibilityHint("Swipe to read previous messages")
        .accessibilityAddTraits(.updatesFrequently)
        .accessibilityRotor("Important Messages") {
            ForEach(outputManager.importantEntries) { entry in
                AccessibilityRotorEntry(entry.summary, id: entry.id)
            }
        }
    }
}

struct OutputLineView: View {
    let entry: OutputEntry
    @ScaledMetric var fontSize: CGFloat = 14

    var body: some View {
        Text(entry.attributedText)
            .font(.system(size: fontSize, design: .monospaced))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.vertical, 2)
    }
}

extension OutputEntry {
    var accessibilityLabel: String {
        let typePrefix: String = {
            switch type {
            case .say: return "Says: "
            case .tell: return "Private message: "
            case .combatHit: return "Combat hit: "
            case .combatMiss: return "Combat miss: "
            case .death: return "Important: "
            case .levelUp: return "Level up! "
            case .roomDescription: return ""
            default: return ""
            }
        }()

        let plainText = toPlainText()
        let semanticInfo = extractSemanticInfo()

        return typePrefix + semanticInfo + plainText
    }

    var traits: AccessibilityTraits {
        switch type {
        case .roomDescription:
            return [.isHeader, .isStaticText]
        case .death, .levelUp:
            return [.isStaticText, .playsSound] // Assume these trigger sounds
        default:
            return .isStaticText
        }
    }

    var summary: String {
        // Short summary for rotor
        String(toPlainText().prefix(50))
    }

    private func extractSemanticInfo() -> String {
        // Extract color-based semantics
        var info = ""

        if hasRedText {
            info += "[damage] "
        }
        if hasGreenText {
            info += "[healing] "
        }
        if hasYellowText {
            info += "[warning] "
        }

        return info
    }
}
```

### 7.2 Accessible Command Input

```swift
struct AccessibleCommandInput: View {
    @Binding var text: String
    let onSubmit: () -> Void
    @FocusState private var isFocused: Bool
    @ObservedObject var history: CommandHistory

    var body: some View {
        HStack(spacing: 8) {
            // History navigation buttons
            Button(action: { history.navigateUp() }) {
                Image(systemName: "arrow.up")
                    .frame(width: 44, height: 44)
            }
            .accessibilityLabel("Previous command")
            .accessibilityHint("Recalls the previous command from history")

            Button(action: { history.navigateDown() }) {
                Image(systemName: "arrow.down")
                    .frame(width: 44, height: 44)
            }
            .accessibilityLabel("Next command")
            .accessibilityHint("Recalls the next command from history")

            // Input field
            TextField("Enter command", text: $text)
                .textFieldStyle(.roundedBorder)
                .focused($isFocused)
                .onSubmit(onSubmit)
                .accessibilityLabel("Command input")
                .accessibilityHint("Type a command and press return to send")
                .accessibilityValue(text.isEmpty ? "Empty" : text)

            // Send button
            Button(action: onSubmit) {
                Image(systemName: "paperplane.fill")
                    .frame(width: 44, height: 44)
            }
            .accessibilityLabel("Send command")
            .disabled(text.isEmpty)
        }
        .padding()
        .onAppear {
            // Auto-focus for VoiceOver users
            if UIAccessibility.isVoiceOverRunning {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    isFocused = true
                }
            }
        }
    }
}
```

### 7.3 Accessible Room Info with Rotors

```swift
struct AccessibleRoomInfoView: View {
    let roomInfo: RoomInfo
    let onExitTapped: (String) -> Void
    let onItemTapped: (Item) -> Void
    let onPlayerTapped: (Player) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Room name
                Text(roomInfo.name)
                    .font(.title)
                    .accessibilityAddTraits(.isHeader)

                // Description
                Text(roomInfo.description)
                    .font(.body)

                // Exits section
                if !roomInfo.exits.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Exits")
                            .font(.headline)
                            .accessibilityAddTraits(.isHeader)

                        FlowLayout(spacing: 8) {
                            ForEach(roomInfo.exits, id: \.self) { exit in
                                ExitButton(direction: exit) {
                                    onExitTapped(exit)
                                }
                            }
                        }
                    }
                }

                // Items section
                if !roomInfo.items.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Items (\(roomInfo.items.count))")
                            .font(.headline)
                            .accessibilityAddTraits(.isHeader)

                        ForEach(roomInfo.items) { item in
                            ItemRowView(item: item) {
                                onItemTapped(item)
                            }
                        }
                    }
                }

                // Players section
                if !roomInfo.players.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Players (\(roomInfo.players.count))")
                            .font(.headline)
                            .accessibilityAddTraits(.isHeader)

                        ForEach(roomInfo.players) { player in
                            PlayerRowView(player: player) {
                                onPlayerTapped(player)
                            }
                        }
                    }
                }
            }
            .padding()
        }
        // Custom rotors for quick navigation
        .accessibilityRotor("Exits") {
            ForEach(roomInfo.exits, id: \.self) { exit in
                AccessibilityRotorEntry("Exit \(exit)", id: exit)
            }
        }
        .accessibilityRotor("Items") {
            ForEach(roomInfo.items) { item in
                AccessibilityRotorEntry(item.name, id: item.id)
            }
        }
        .accessibilityRotor("Players") {
            ForEach(roomInfo.players) { player in
                AccessibilityRotorEntry(player.name, id: player.id)
            }
        }
    }
}

struct ExitButton: View {
    let direction: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(direction.capitalized)
                .font(.body)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(8)
        }
        .frame(minWidth: 44, minHeight: 44) // Minimum touch target
        .accessibilityLabel("Go \(direction)")
    }
}
```

### 7.4 Accessible Preferences

```swift
struct AccessibilityPreferencesView: View {
    @ObservedObject var preferences: PreferencesStore

    var body: some View {
        Form {
            Section {
                Text("Configure how VoiceOver announces game content")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } header: {
                Text("VoiceOver Settings")
            }

            Section {
                Picker("Verbosity", selection: $preferences.voiceOverVerbosity) {
                    ForEach(VoiceOverVerbosity.allCases, id: \.self) { mode in
                        Text(mode.rawValue).tag(mode)
                    }
                }
                .accessibilityLabel("VoiceOver verbosity")
                .accessibilityHint("Controls how much content is announced automatically")

                Toggle("Announce Colors", isOn: $preferences.announceColors)
                    .accessibilityLabel("Announce color names")
                    .accessibilityHint("Speaks color names for colored text")

                Toggle("Summarize Combat", isOn: $preferences.summarizeCombat)
                    .accessibilityLabel("Summarize combat rounds")
                    .accessibilityHint("Groups rapid combat messages into summaries")
            } header: {
                Text("Announcements")
            }

            Section {
                Toggle("Tell", isOn: binding(for: "tell"))
                Toggle("Say", isOn: binding(for: "say"))
                Toggle("OOC", isOn: binding(for: "ooc"))
                Toggle("Chat", isOn: binding(for: "chat"))
            } header: {
                Text("Channel Announcements")
            }

            Section {
                Stepper("Announcement Rate Limit: \(preferences.announcementRateLimit)ms",
                       value: $preferences.announcementRateLimit,
                       in: 100...2000,
                       step: 100)
                    .accessibilityLabel("Announcement rate limit")
                    .accessibilityValue("\(preferences.announcementRateLimit) milliseconds")
                    .accessibilityHint("Minimum time between announcements")
            } header: {
                Text("Advanced")
            }
        }
        .navigationTitle("Accessibility")
    }

    private func binding(for channel: String) -> Binding<Bool> {
        Binding(
            get: { preferences.channelAnnouncements[channel] ?? false },
            set: { preferences.channelAnnouncements[channel] = $0 }
        )
    }
}
```

---

## 8. Recommendations and Best Practices

### 8.1 Design Principles

**1. Accessibility First, Not Accessibility Added**
- Design with VoiceOver in mind from the start
- Test with VoiceOver during development, not at the end
- Involve blind testers early and often

**2. Semantic Over Visual**
- Don't rely on color alone
- Use text labels for all visual indicators
- Structure content with headers and sections

**3. Respect User Preferences**
- Support Dynamic Type
- Respect Reduce Motion
- Provide verbosity controls
- Allow customization of announcements

**4. Progressive Disclosure**
- Don't announce everything at once
- Use rotors for quick navigation
- Provide summaries with details on demand

**5. Consistency**
- Use standard iOS patterns
- Maintain consistent accessibility labels
- Follow iOS Human Interface Guidelines

### 8.2 MUD-Specific Recommendations

**For Output:**
- **Default:** Manual navigation (user swipes through output)
- **Option:** Announce important messages only (tells, combat results, deaths)
- **Option:** Announce all messages (for users who prefer passive listening)
- **Advanced:** Allow per-message-type configuration

**For Colors:**
- **Default:** Convert semantic colors to labels ([damage], [healing], [warning])
- **Option:** Announce color names for users who want that information
- **Avoid:** Relying on color alone for game-critical information

**For Combat:**
- **Default:** Summarize combat rounds after 1-2 seconds of inactivity
- **Option:** Announce every message (for users who want full detail)
- **Avoid:** Spamming announcements during rapid combat

**For Channels:**
- **Default:** Announce tells/sayto (directed at player)
- **Option:** Configure which channels to announce
- **Avoid:** Announcing every OOC/chat message by default

**For Navigation:**
- **Always:** Provide exit buttons with clear labels
- **Bonus:** Use rotors to jump between exits/items/players
- **Advanced:** Integrate with Maps app for spatial audio navigation (future)

### 8.3 Performance Considerations

**For Large Output Buffers:**
- Use LazyVStack, not VStack
- Limit announcement queue size
- Prune old accessibility announcements
- Cache accessibility labels

**For Rapid Updates:**
- Debounce announcements
- Group related messages
- Implement rate limiting
- Allow user to pause announcements

### 8.4 Testing Strategy

**Phase 1: Automated**
- XCTest accessibility checks
- Xcode Accessibility Inspector audits
- SwiftLint accessibility rules

**Phase 2: Manual (Sighted)**
- VoiceOver simulator testing
- Dynamic Type preview testing
- Reduce Motion testing

**Phase 3: Real Users**
- Blind beta testers
- Low-vision testers
- User feedback sessions

---

## 9. Additional Resources

### Apple Documentation
- [Accessibility - Apple Developer](https://developer.apple.com/documentation/swiftui/view-accessibility)
- [Supporting VoiceOver in your app](https://developer.apple.com/documentation/uikit/accessibility_for_uikit/supporting_voiceover_in_your_app)
- [Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

### Research Sources
- [iOS Accessibility Guidelines: Best Practices for 2025](https://medium.com/@david-auerbach/ios-accessibility-guidelines-best-practices-for-2025-6ed0d256200e)
- [SwiftUI VoiceOver Accessibility Guide](https://tanaschita.com/ios-accessibility-voiceover-swiftui-guide/)
- [Accessibility rotors in SwiftUI](https://swiftwithmajid.com/2021/09/14/accessibility-rotors-in-swiftui/)
- [Things we wish we knew about iOS Voice Over](https://exyte.com/blog/things-we-wish-we-knew-about-ios-voice-over)
- [Improving Color Accessibility For Color-Blind Users](https://www.smashingmagazine.com/2016/06/improving-color-accessibility-for-color-blind-users/)

### Community Resources
- [AppleVis](https://applevis.com/) - Community for blind iOS users
- [iOS-SwiftUI Accessibility Techniques (GitHub)](https://github.com/cvs-health/ios-swiftui-accessibility-techniques)

---

## 10. Implementation Checklist

### Core Accessibility (Must Have)
- [ ] All interactive elements have `.accessibilityLabel()`
- [ ] Complex actions have `.accessibilityHint()`
- [ ] State-based elements have `.accessibilityValue()`
- [ ] Appropriate `.accessibilityTraits()` applied
- [ ] Decorative elements are `.accessibilityHidden(true)`
- [ ] Logical navigation order (test with VoiceOver)
- [ ] Minimum 44×44pt touch targets
- [ ] Support for Dynamic Type
- [ ] Layout adapts to large text sizes
- [ ] Respect Reduce Motion preference
- [ ] New output announced to VoiceOver
- [ ] ANSI colors converted to semantic labels

### Enhanced Accessibility (Should Have)
- [ ] Custom accessibility rotors for exits/items/players
- [ ] Announcement rate limiting
- [ ] Combat message summarization
- [ ] Channel announcement preferences
- [ ] User-configurable verbosity
- [ ] Differentiate without color (shapes/labels)
- [ ] Reduce Transparency support
- [ ] Increase Contrast support
- [ ] Keyboard navigation (iPad)
- [ ] VoiceOver hints for complex interactions

### Advanced Accessibility (Nice to Have)
- [ ] Spatial audio for room navigation
- [ ] Haptic feedback for events
- [ ] Custom VoiceOver pronunciations
- [ ] Braille display support
- [ ] Voice Control compatibility
- [ ] Switch Control compatibility
- [ ] Guided Access mode
- [ ] Accessibility Shortcuts integration
- [ ] Per-user accessibility profiles
- [ ] Accessibility onboarding tutorial

---

## Conclusion

Building an accessible native iOS MUD client requires thoughtful implementation of VoiceOver integration, Dynamic Type support, and MUD-specific announcement strategies. The key is balancing automatic announcements with user control, providing multiple navigation methods, and converting visual information (like ANSI colors) into semantic, audible equivalents.

**The accessibility features outlined in this document are not optional.** For blind and low-vision users who are the primary audience for text-based games, accessibility is the difference between the app being usable or unusable. Native iOS provides superior accessibility compared to web-based solutions - let's use it.

**Next Steps:**
1. Implement core VoiceOver labels and traits
2. Test with VoiceOver on device
3. Add announcement system for live output
4. Implement ANSI-to-semantic conversion
5. Add accessibility rotors for room navigation
6. User test with blind players
7. Iterate based on feedback

The goal is simple: make this the most accessible MUD client on any platform.
