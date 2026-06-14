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
  advertisedModules = vi.fn(() => ['Core 1', 'Core.Supports 1']);
  sendSet = vi.fn();
}

class MockAutoLoginPackage extends GMCPPackage {
  packageName = 'Auth.Autologin';
  sendStoredLogin = vi.fn();
}

class MockClientMediaPackage extends GMCPPackage {
  packageName = 'Client.Media';
  publishEffectsSupport = vi.fn();
}

function createSession() {
  const client = {} as unknown as MudClient;
  const session = new GmcpSession(client);
  return { session };
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
    const { session } = createSession();
    const core = session.register(MockCorePackage);
    const supports = session.register(MockCoreSupportsPackage);
    const autoLogin = session.register(MockAutoLoginPackage);
    const media = session.register(MockClientMediaPackage);

    expect(session.start()).toBe(true);
    expect(session.start()).toBe(false);

    expect(core.sendHello).toHaveBeenCalledTimes(2);
    expect(supports.sendSet).toHaveBeenCalledTimes(2);
    expect(supports.sendSet).toHaveBeenCalledWith(['Core 1', 'Core.Supports 1']);
    expect(autoLogin.sendStoredLogin).toHaveBeenCalledTimes(2);
    expect(media.publishEffectsSupport).toHaveBeenCalledTimes(2);
    expect(session.ready).toBe(true);
  });

  it('owns session readiness and reset state', () => {
    const { session } = createSession();

    expect(session.markReady()).toBe(true);
    expect(session.markReady()).toBe(false);
    expect(session.markSessionReady()).toBe(true);
    expect(session.markSessionReady()).toBe(false);

    expect(session.ready).toBe(true);
    expect(session.sessionReady).toBe(true);

    session.reset();

    expect(session.ready).toBe(false);
    expect(session.sessionReady).toBe(false);
  });
});
