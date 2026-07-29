import JZZ from 'jzz';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { virtualMidiService } from './VirtualMidiService';

const { openMidiOut, refresh, register, tiny } = vi.hoisted(() => ({
  openMidiOut: vi.fn(),
  refresh: vi.fn(),
  register: vi.fn(),
  tiny: vi.fn(),
}));

vi.mock('jzz', () => {
  const jzz = vi.fn(() => ({
    openMidiOut,
    refresh,
  }));

  return {
    default: Object.assign(jzz, {
      synth: {
        Tiny: {
          register,
        },
      },
    }),
  };
});

vi.mock('jzz-synth-tiny', () => ({
  Tiny: tiny,
}));

describe('VirtualMidiService', () => {
  beforeEach(() => {
    virtualMidiService.close();
    vi.clearAllMocks();
  });

  it('closes the existing virtual port before replacing it', async () => {
    const firstPort = {
      close: vi.fn(),
    };
    const secondPort = {
      close: vi.fn(),
    };
    openMidiOut.mockResolvedValueOnce(firstPort).mockResolvedValueOnce(secondPort);

    await virtualMidiService.getVirtualPort();
    await virtualMidiService.getVirtualPort();

    expect(firstPort.close).toHaveBeenCalledOnce();
    expect(secondPort.close).not.toHaveBeenCalled();
    expect(JZZ().openMidiOut).toHaveBeenCalledTimes(2);
  });
});
