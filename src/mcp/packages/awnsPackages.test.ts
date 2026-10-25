import { describe, expect, it } from 'vitest';
import { McpSession } from '../session';
import { McpWorldMongooseLocation } from './location';
import { McpAwnsRehash } from './rehash';
import { McpAwnsTimezone } from './timezone';

describe('AWNS MCP packages', () => {
  it('sends timezone updates as package-root messages', () => {
    const sent: string[] = [];
    const session = new McpSession(
      {
        sendLine: (line) => sent.push(line),
      },
      () => 'auth01',
    );
    const timezone = session.registerPackage(McpAwnsTimezone);

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    sent.length = 0;
    timezone.sendTimezone({ timezone: 'MST' });

    expect(sent).toEqual(['#$#dns-com-awns-timezone auth01 timezone: MST']);
  });

  it('sends browser location updates as package-root messages', () => {
    const sent: string[] = [];
    const session = new McpSession(
      {
        sendLine: (line) => sent.push(line),
      },
      () => 'auth01',
    );
    const location = session.registerPackage(McpWorldMongooseLocation);

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    sent.length = 0;
    location.sendLocation({ lat: 39.7392, lon: -104.9903 });

    expect(sent).toEqual(['#$#world.mongoose.location auth01 lat: 39.7392 lon: -104.9903']);
  });

  it('tracks rehash command lists by full command name', () => {
    const sent: string[] = [];
    const commandEvents: unknown[] = [];
    const addEvents: unknown[] = [];
    const removeEvents: unknown[] = [];
    const session = new McpSession(
      {
        sendLine: (line) => sent.push(line),
      },
      () => 'auth01',
    );
    const rehash = session.registerPackage(McpAwnsRehash);
    rehash.on('commands', (payload) => commandEvents.push(payload));
    rehash.on('add', (payload) => addEvents.push(payload));
    rehash.on('remove', (payload) => removeEvents.push(payload));

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    sent.length = 0;
    rehash.requestCommands();
    session.receiveLine('#$#dns-com-awns-rehash-commands auth01 list: "open close r*ead @grants* *"');
    session.receiveLine('#$#dns-com-awns-rehash-add auth01 list: "l*ook"');
    session.receiveLine('#$#dns-com-awns-rehash-remove auth01 list: "r*ead"');

    expect(sent).toEqual(['#$#dns-com-awns-rehash-getcommands auth01']);
    expect(commandEvents).toEqual([
      {
        list: 'open close r*ead @grants* *',
        commands: ['open', 'close', 'read', '@grants'],
      },
    ]);
    expect(addEvents).toEqual([
      {
        list: 'l*ook',
        commands: ['look'],
      },
    ]);
    expect(removeEvents).toEqual([
      {
        list: 'r*ead',
        commands: ['read'],
      },
    ]);
    expect(rehash.commands).toEqual(['open', 'close', '@grants', 'look']);
  });
});
