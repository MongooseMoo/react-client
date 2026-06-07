# `Client.WebPush`

`Client.WebPush` is a Mongoose protocol for obtaining a short-lived bearer token
used by the browser Web Push subscription flow. It is implemented in
`src/gmcp/Client/WebPush.ts`.

## Package

- Name: `Client.WebPush`
- Version: `1`
- Source: Mongoose
- Direction: bidirectional

## Client to Server

### `Client.WebPush.Request`

Requests a bearer token.

```json
{}
```

The web push setup path calls this after the GMCP session is ready if it does
not already have a usable token.

## Server to Client

### `Client.WebPush.Token`

```json
{
  "token": "opaque-token",
  "expires_at": 1760000000000
}
```

- `token`: bearer token used by the HTTP web push registration API.
- `expires_at`: optional Unix epoch milliseconds.

The client treats tokens without `expires_at` as usable until shutdown. When an
expiry exists, the token is considered stale if it is within 10 percent of the
default five-minute TTL from expiry.

## Runtime Behavior

- `requestToken()` waits up to 5 seconds for `Token`.
- Tokens are emitted as a `webpushToken` client event.
- `shutdown()` clears the cached token and expiry.

