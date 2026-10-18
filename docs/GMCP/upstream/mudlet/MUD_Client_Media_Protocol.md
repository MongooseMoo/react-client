# MUD Client Media Protocol (MCMP)

## A Standard for Loading, Playing and Stopping Media Files with MUD Clients over GMCP

## Status of this Memo

This memo describes the addition of a standardized namespace of the Generic Mud Communication Protocol (GMCP) telnet sub-negotiation protocol (201) that provides syntax and usage guidance for sending JSON formatted messages from game servers to text-based game clients to load, play and stop media files.

## Overview and Rationale

With renewed interest in the MUD genre of gaming, expectations are high to provide sight and sound content that competes for audience with other gaming platforms. The purpose of the MUD Client Media Protocol (MCMP) is to establish a method of delivering media, such as game sounds, background music and video snippets, to text-based game clients via their widely accepted messaging platform, GMCP, which uses JSON as its data-interchange format. The intended return for introducing this protocol is to improve the MUD gaming experience and accessibility through standardized messaging between game servers and game clients. MUD Client Media Protocol (MCMP) is inspired by its predecessor [Mud Sound Protocol](https://www.zuggsoft.com/zmud/msp.htm) (MSP).

## Overview of the GMCP (201) Sub-negotiation Protocol

To recap, the GMCP protocol is a bidirectional telnet sub-negotiation protocol (See RFC 854) which fulfills the following conditions:

- GMCP is separated into several 'namespaces', which may be enabled or disabled by the client at any time. The 'Core' namespace is always enabled and may not be disabled. Namespaces should consist of case-insensitive alphabetical characters and stop characters (. - ASCII 46/0x2E), representable as \[A-Za-z.\].
- GMCP messages consist of the namespace and a command (case insensitive alpha characters) delineated by a stop character, and optionally a space character and JSON-encoded payload.
- GMCP messages may be sent by both the client or server at any time with no warning.

## Update to namespace: Client.\* for Client.Media

We are proposing an addition to the Client.\* meta-namespace for Client.Media. This serves the purpose of reserving this namespace for handling game client media operations and supporting future expansion and integration.

## Video Demonstration of Client.Media

<https://wiki.mudlet.org/w/File:MCMP_Background_Music_Demo_with_Mudlet.mp4>

## Specification for Client.Media

The Client.Media family of GMCP packages provide a way for games to send sound, music and video events. GMCP media events are sent in one direction: from game server to to game client. Media files may be downloaded manually by the user and/or automatically via the game client. Game clients should advertise to servers that Client.Media is supported with a Core.Supports message from game client to server.

    Core.Supports.Set ["Client.Media 1", ...]

### Commands - Server

Due to the limitations for legacy gaming platforms supporting all JSON data types, such as boolean (*true* and *false*), game clients should support parsing of values within the Client.Media namespace also as strings (surrounded by quotes).

#### Client.Media.Default

- Package: Client.Media.Default
- Purpose: Identify to the game client a default URL directory to load media files from an external resource.
- Guidance: For games that automatically download media files, perform a Client.Media.Default GMCP event once upon player login.

Syntax:

    Client.Media.Default {"url": "hxxps://www.example.com/media/"}

Usage:

[TABLE]

![Note](/images/6/60/Bulbgraph.png "Note") **Note:**

Some examples are shown [here](/w/Special:MyLanguage/Manual:Scripting#Loading_Media "Special:MyLanguage/Manual:Scripting").

#### Client.Media.Load

- Package: Client.Media.Load
- Purpose: Load media files from an external source.
- Guidance: For games that automatically download media files and have the capability to cache with the game client.

Syntax:

    Client.Media.Load {
      "name": "sword1.mp3",
      "url": "hxxps://www.example.com/media/"
    }

Usage:

[TABLE]

![Note](/images/6/60/Bulbgraph.png "Note") **Note:**

    Some examples are shown here.

#### Client.Media.Play

- Package: Client.Media.Play
- Purpose: Play media files.
- Guidance: Game clients could choose whether to play only one media file at one time or multiple files at one time.

Syntax:

    Client.Media.Play {
      "name": "80_Blacksmith_Shoppe.mp3",
      "url": "hxxps://www.example.com/media/",
      "type": "music",
      "tag": "environment",
      "volume": 25,
      "fadein": 5000,
      "fadeout": 7000,
      "start": 1000,
      "finish": 20000,
      "loops": 3,
      "priority": 60,
      "continue": true,
      "key": "area-background-music",
      "caption": "Blacksmith Hammering"
    }

Usage:

[TABLE]

![Note](/images/6/60/Bulbgraph.png "Note") **Note:**

    To support players with hearing impairments or who prefer captioned media, the caption field may be used to provide contextual and caption-style text. For best practices, see Captioning Key: Sound Effects and Music.

![Note](/images/6/60/Bulbgraph.png "Note") **Note:**

    Some examples are shown here.

#### Client.Media.Stop

- Package: Client.Media.Stop
- Purpose: Stop playing media files.
- Guidance: An empty body will stop all media.

Syntax:

    Client.Media.Stop {
      "name": "city.mp3",
      "type": "music",
      "tag": "environment",
      "priority": 60,
      "key": "area-background-music",
      "fadeaway": true,
      "fadeout": 7000
    }

Usage:

[TABLE]

![Note](/images/6/60/Bulbgraph.png "Note") **Note:**

    Some examples are shown here.

## Best Practices for Server Implementors

In keeping with best practices widely adopted in modern web applications and browsers, server-side implementors of the \`Client.Media\` protocol are advised to consider the following:

- **Avoid Autoplay Before User Interaction**: Media files should not be played immediately upon client connection, especially before the user has had an opportunity to interact with the game environment. Autoplaying media without user initiation may be blocked or suppressed by some clients, particularly web-based ones, and can create a disruptive experience for players.

&nbsp;

- **Use Secure Media URLs**: Whenever possible, media files should be served via secure HTTPS URLs. Serving media over insecure HTTP links may trigger mixed content security warnings or result in blocked requests in web-based clients or modern operating systems with strict security policies.

## Notes for Web Client Developers

Developers of web-based Mud clients should be aware of the following constraints that may impact media playback behavior:

- Most browsers impose restrictions on media autoplay unless the user has interacted with the page. This may prevent \`Client.Media.Play\` messages sent immediately after connection from functioning as intended.

&nbsp;

- Serving media over non-HTTPS URLs may result in blocked requests or mixed content warnings, depending on the browser and hosting setup.

These limitations are imposed by browser security models and are not under the control of the game server or client developers. Where possible, client developers may want to inform users or log these situations for debugging.

## Versions

- Version 1.0: Initial specification.
- Version 1.0.1: fadein, fadeout and start added to Client.Media.Play by Mike Conley (mike.conley\[at\]stickmud.com) on 22-DEC-2021.
- Version 1.0.2: finish added to Client.Media.Play and fadeaway and fadeout added to Client.Media.Stop by Mike Conley (mike.conley\[at\]stickmud.com) on 10-DEC-2023.
- Version 1.0.3: caption added to Client.Media.Play for improved accessibility by Mike Conley (mike.conley\[at\]stickmud.com) on 10-MAY-2025.

## Advertise Support for MCMP

Consider advertising your games support of MCMP (and GMCP) to mud lists via the Mud Server Status Protocol, [MSSP](/w/Special:MyLanguage/Manual:Supported_Protocols#MSSP "Special:MyLanguage/Manual:Supported Protocols"), by providing a MSSP variable of "MCMP" and value of "1".

## Authors

- Mike Conley (Tamarindo, Co-Administrator at StickMUD and Mudlet contributor) mike.conley\[at\]stickmud.com
- Eric Oestrich (Developer of ExVenture and Grapevine) eric\[at\]oestrich.org

## Clients

- Known clients implementing this specification:
  - Mudlet version 4.4+. See [documentation](/w/Special:MyLanguage/Manual:Scripting#MUD_Client_Media_Protocol "Special:MyLanguage/Manual:Scripting").
  - BeipMU version 4.00.298 implements basic load/play/stop commands.
  - LociTerm version 2.5.1 and beyond.


