import { beforeEach, describe, expect, it, vi } from 'vitest';

const loaderMock = vi.hoisted(() => ({
  config: vi.fn(),
}));

vi.mock('@monaco-editor/react', () => ({
  loader: loaderMock,
}));

describe('configureMonacoLoader', () => {
  beforeEach(() => {
    vi.resetModules();
    loaderMock.config.mockClear();
  });

  it('configures @monaco-editor/react to use an explicit Monaco version once', async () => {
    const { MONACO_LOADER_VS_PATH, configureMonacoLoader } = await import('./monacoLoader');

    configureMonacoLoader();
    configureMonacoLoader();

    expect(MONACO_LOADER_VS_PATH).toBe(
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs',
    );
    expect(loaderMock.config).toHaveBeenCalledTimes(1);
    expect(loaderMock.config).toHaveBeenCalledWith({
      paths: {
        vs: MONACO_LOADER_VS_PATH,
      },
    });
  });
});
