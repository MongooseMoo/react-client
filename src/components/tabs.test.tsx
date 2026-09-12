import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { expect, it, vi } from 'vitest';
import Tabs from './tabs';

it('mounts optional panels on first selection and keeps them mounted when hidden', () => {
  const mounted = vi.fn();
  const unmounted = vi.fn();
  function Feature() {
    useEffect(() => { mounted(); return unmounted; }, []);
    return <span>Transfer controls</span>;
  }
  render(<Tabs tabs={[
    { id: 'main', label: 'Main', content: <span>Main content</span> },
    { id: 'files', label: 'Files', content: <Feature />, mountOnSelect: true },
  ]} />);
  expect(mounted).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
  expect(mounted).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('tab', { name: 'Main' }));
  expect(unmounted).not.toHaveBeenCalled();
  expect(screen.getByText('Transfer controls')).not.toBeVisible();
});
