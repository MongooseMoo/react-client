# The `Client.Media` package

This package can be used to play sound effects, background music or videos on the client. It copies concepts from the MUD Sound Protocol (MSP) and extends it further.

Source: [Mudlet Wiki](https://wiki.mudlet.org/w/Standards:MUD_Client_Media_Protocol)

## Client.Media.Default

Sent by the server to identify to the game client a default URL directory to load media files from an external resource.\
**Guidance**: For games that automatically download media files, perform a Client.Media.Default GMCP event once upon player login.

``` json
Client.Media.Default {"url": "https://www.example.com/media/"}
```

[TABLE]

## Client.Media.Load

Load media files from an external source.\
**Guidance**: For games that automatically download media files and have the capability to cache with the game client.

``` json
Client.Media.Load {
  "name": "sword1.mp3",
  "url": "hxxps://www.example.com/media/"
}
```

[TABLE]

## Client.Media.Play

Play media files.\
**Guidance**: Game clients could choose whether to play only one media file at one time or multiple files at one time.

``` json
Client.Media.Play {
  "name": "80_Blacksmith_Shoppe.mp3",
  "url": "https://www.example.com/media/",
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
```

[TABLE]

## Client.Media.Stop

Stop playing media files. **Guidance**: An empty body will stop all media.

``` json
Client.Media.Stop {
  "name": "city.mp3",
  "type": "music",
  "tag": "environment",
  "priority": 60,
  "key": "area-background-music",
  "fadeaway": true,
  "fadeout": 7000
}
```

[TABLE]


