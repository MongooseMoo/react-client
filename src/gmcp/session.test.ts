import { beforeEach, describe, expect, it, vi } from 'vitest';

import type MudClient from '../client';
import { identityCodec, inbound, messageEnvelope } from '../protocol/messages';
import type { TelnetParser } from '../telnet';
import { GMCPPackage } from './package';
import { GmcpSession } from './session';

const registryThing = messageEnvelope('Thing', identityCodec<{ ok: boolean }>());

const RegistryPackageBase = GMCPPackage.with({
  packageName: 'Registry',
  messages: [inbound(registryThing)] as const,
});

class RegistryPackage extends RegistryPackageBase {}

class MockCorePackage extends GMCPPackage {
  packageName = 'Core';
  sendHello = vi.fn();
}

class MockCoreSupportsPackage extends GMCPPackage {
  packageName = 'Core.Supports';
  sendSet = vi.fn();
}

class MockAutoLoginPackage extends GMCPPackage {
  packageName = 'Auth.Autologin';
  sendLogin = vi.fn();
}

class MockClientMediaPackage extends GMCPPackage {
  packageName = 'Client.Media';
  sendEffectsSupport = vi.fn();
}

function createSession() {
  const client = {
    emit: vi.fn(),
  } as unknown as MudClient;
  const session = new GmcpSession(client);
  return { client, session };
}

describe('GmcpSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers typed packages and dispatches inbound GMCP messages', () => {
    const { session } = createSession();
    const handler = session.register(RegistryPackage);
    const listener = vi.fn();
    handler.on('thing', listener);

    session.receive('Registry.Thing', '{"ok":true}');

    expect(listener).toHaveBeenCalledWith({ ok: true });
  });

  it('encodes outbound messages through the attached telnet transport', () => {
    const { session } = createSession();
    const telnet = {
      sendGmcp: vi.fn(),
    } as unknown as TelnetParser;
    session.attachTransport(telnet);

    session.send('Test.Thing', { ok: true });

    expect(telnet.sendGmcp).toHaveBeenCalledWith('Test.Thing', '{"ok":true}');
  });

  it('runs GMCP startup packages and marks GMCP ready once', () => {
    const { client, session } = createSession();
    const core = session.register(MockCorePackage);
    const supports = session.register(MockCoreSupportsPackage);
    const autoLogin = session.register(MockAutoLoginPackage);
    const media = session.register(MockClientMediaPackage);

    session.start();
    session.start();

    expect(core.sendHello).toHaveBeenCalledTimes(2);
    expect(supports.sendSet).toHaveBeenCalledTimes(2);
    expect(autoLogin.sendLogin).toHaveBeenCalledTimes(2);
    expect(media.sendEffectsSupport).toHaveBeenCalledTimes(2);
    expect(session.ready).toBe(true);
    expect(client.emit).toHaveBeenCalledWith('gmcpReady');
    expect(client.emit).toHaveBeenCalledTimes(1);
  });

  it('owns session readiness and reset state', () => {
    const { client, session } = createSession();

    session.markReady();
    session.markSessionReady();
    session.markSessionReady();

    expect(session.ready).toBe(true);
    expect(session.sessionReady).toBe(true);
    expect(client.emit).toHaveBeenCalledWith('gmcpReady');
    expect(client.emit).toHaveBeenCalledWith('sessionReady');
    expect(client.emit).toHaveBeenCalledTimes(2);

    session.reset();

    expect(session.ready).toBe(false);
    expect(session.sessionReady).toBe(false);
  });
});
