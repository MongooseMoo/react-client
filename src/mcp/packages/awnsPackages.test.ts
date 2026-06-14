import { describe, expect, it } from 'vitest';
import { McpSession } from '../session';
import { McpAwnsDisplayUrl } from './displayUrl';
import { McpAwnsJtext } from './jtext';
import { McpAwnsRehash } from './rehash';
import { McpAwnsServerInfo } from './serverInfo';
import { McpAwnsTimezone } from './timezone';
import { McpAwnsVisual } from './visual';

describe('AWNS MCP packages', () => {
  it('emits display URL requests', () => {
    const urls: string[] = [];
    const session = new McpSession(
      {
        sendLine: () => undefined,
      },
      () => 'auth01',
    );
    const displayUrl = session.registerPackage(McpAwnsDisplayUrl);
    displayUrl.on('displayUrl', (url) => urls.push(url));

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    session.receiveLine('#$#dns-com-awns-displayurl auth01 url: "https://example.test/help"');

    expect(urls).toEqual(['https://example.test/help']);
  });

  it('requests and emits server info URLs', () => {
    const sent: string[] = [];
    const infos: unknown[] = [];
    const session = new McpSession(
      {
        sendLine: (line) => sent.push(line),
      },
      () => 'auth01',
    );
    const serverInfo = session.registerPackage(McpAwnsServerInfo);
    serverInfo.on('serverInfo', (payload) => infos.push(payload));

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    sent.length = 0;
    serverInfo.requestServerInfo();
    session.receiveLine(
      '#$#dns-com-awns-serverinfo auth01 home_url: "https://example.test/" help_url: "https://example.test/help"',
    );

    expect(sent).toEqual(['#$#dns-com-awns-serverinfo-get auth01']);
    expect(infos).toEqual([
      {
        homeUrl: 'https://example.test/',
        helpUrl: 'https://example.test/help',
      },
    ]);
  });

  it('sends jtext pick requests with package-local typed payloads', () => {
    const sent: string[] = [];
    const session = new McpSession(
      {
        sendLine: (line) => sent.push(line),
      },
      () => 'auth01',
    );
    const jtext = session.registerPackage(McpAwnsJtext);

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    sent.length = 0;
    jtext.pick('help', 'topic: intro');

    expect(sent).toEqual(['#$#dns-com-awns-jtext-pick auth01 type: help args: "topic: intro"']);
  });

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

  it('tracks rehash command lists and abbreviation expansions', () => {
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
    session.receiveLine('#$#dns-com-awns-rehash-commands auth01 list: "open close r*ead"');
    session.receiveLine('#$#dns-com-awns-rehash-add auth01 list: "l*ook"');
    session.receiveLine('#$#dns-com-awns-rehash-remove auth01 list: "r*ead"');

    expect(sent).toEqual(['#$#dns-com-awns-rehash-getcommands auth01']);
    expect(commandEvents).toEqual([
      {
        list: 'open close r*ead',
        commands: ['open', 'close', 'r', 're', 'rea', 'read'],
      },
    ]);
    expect(addEvents).toEqual([
      {
        list: 'l*ook',
        commands: ['l', 'lo', 'loo', 'look'],
      },
    ]);
    expect(removeEvents).toEqual([
      {
        list: 'r*ead',
        commands: ['r', 're', 'rea', 'read'],
      },
    ]);
    expect(rehash.commands).toEqual(['open', 'close', 'l', 'lo', 'loo', 'look']);
  });

  it('sends visual requests with the server package gettopology spelling', () => {
    const sent: string[] = [];
    const session = new McpSession(
      {
        sendLine: (line) => sent.push(line),
      },
      () => 'auth01',
    );
    const visual = session.registerPackage(McpAwnsVisual);

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    sent.length = 0;
    visual.requestUsers();
    visual.requestLocation();
    visual.requestTopology('#123', 2);
    visual.requestSelf();

    expect(sent).toEqual([
      '#$#dns-com-awns-visual-getusers auth01',
      '#$#dns-com-awns-visual-getlocation auth01',
      '#$#dns-com-awns-visual-gettopology auth01 location: #123 distance: 2',
      '#$#dns-com-awns-visual-getself auth01',
    ]);
  });

  it('emits visual locations, users, topology, and self messages', () => {
    const locations: unknown[] = [];
    const users: unknown[] = [];
    const topologies: unknown[] = [];
    const selves: unknown[] = [];
    const session = new McpSession(
      {
        sendLine: () => undefined,
      },
      () => 'auth01',
    );
    const visual = session.registerPackage(McpAwnsVisual);
    visual.on('location', (payload) => locations.push(payload));
    visual.on('users', (payload) => users.push(payload));
    visual.on('topology', (payload) => topologies.push(payload));
    visual.on('self', (payload) => selves.push(payload));

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    session.receiveLine('#$#dns-com-awns-visual-location auth01 id: "#100"');
    session.receiveLine('#$#dns-com-awns-visual-self auth01 id: "#42"');
    session.receiveLine(
      '#$#dns-com-awns-visual-users auth01 id*: "" name*: "" location*: "" idle*: "" _data-tag: users1',
    );
    session.receiveLine('#$#* users1 id: #1');
    session.receiveLine('#$#* users1 id: #2');
    session.receiveLine('#$#* users1 name: Alice');
    session.receiveLine('#$#* users1 name: Bob B');
    session.receiveLine('#$#* users1 location: #10');
    session.receiveLine('#$#* users1 location: #11');
    session.receiveLine('#$#* users1 idle: 0');
    session.receiveLine('#$#* users1 idle: 30');
    session.receiveLine('#$#: users1');
    session.receiveLine(
      '#$#dns-com-awns-visual-topology auth01 id*: "" name*: "" exit*: "" _data-tag: top1',
    );
    session.receiveLine('#$#* top1 id: #10');
    session.receiveLine('#$#* top1 name: Courtyard');
    session.receiveLine('#$#* top1 exit: north #11 east #12');
    session.receiveLine('#$#: top1');

    expect(locations).toEqual([{ id: '#100' }]);
    expect(selves).toEqual([{ id: '#42' }]);
    expect(users).toEqual([
      [
        { id: '#1', name: 'Alice', location: '#10', idle: '0' },
        { id: '#2', name: 'Bob B', location: '#11', idle: '30' },
      ],
    ]);
    expect(topologies).toEqual([[{ id: '#10', name: 'Courtyard', exit: 'north #11 east #12' }]]);
    expect(visual.location).toBe('#100');
    expect(visual.self).toBe('#42');
  });
});
