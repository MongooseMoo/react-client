import { afterEach, describe, expect, it } from 'vitest';
import { useMenuStore } from '../../stores/menuStore';
import { McpSession } from '../session';
import { McpWorldMongooseMenu } from './menu';

function connectedSession() {
  const session = new McpSession({ sendLine: () => {} }, () => 'auth01');
  session.registerPackage(McpWorldMongooseMenu);
  session.receiveLine('#$#MCP version: 2.1 to: 2.1');
  return session;
}

describe('world.mongoose.menu', () => {
  afterEach(() => {
    useMenuStore.getState().clear();
  });

  it('shows the menu once its multiline values close', () => {
    const session = connectedSession();

    session.receiveLine(
      '#$#world.mongoose.menu auth01 prompt: "your selection:" options*: "" responses*: "" _data-tag: t1',
    );
    session.receiveLine('#$#* t1 options: Pick a level');
    session.receiveLine('#$#* t1 options: Low');
    session.receiveLine('#$#* t1 options: Other');
    session.receiveLine('#$#* t1 responses:');
    session.receiveLine('#$#* t1 responses: 1');
    session.receiveLine('#$#* t1 responses: o');
    expect(useMenuStore.getState().menu).toBeNull();

    session.receiveLine('#$#: t1');

    expect(useMenuStore.getState().menu).toEqual({
      prompt: 'your selection:',
      items: [
        { label: 'Pick a level', response: '' },
        { label: 'Low', response: '1' },
        { label: 'Other', response: 'o' },
      ],
    });
  });

  it('advertises the package during negotiation', () => {
    const sent: string[] = [];
    const session = new McpSession({ sendLine: (line) => sent.push(line) }, () => 'auth01');
    session.registerPackage(McpWorldMongooseMenu);

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');

    expect(sent).toContain(
      '#$#mcp-negotiate-can auth01 package: world.mongoose.menu min-version: 1.0 max-version: 1.0',
    );
  });
});
