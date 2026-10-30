import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import { GMCPObjectProperties, type PropertyDetail, type PropertyResult } from '../gmcp/Object/Properties';
import { useConnectionStore } from '../stores/connectionStore';
import { usePersonalDataStore } from '../stores/personalDataStore';
import { usePropertyBrowserStore } from '../stores/propertyBrowserStore';
import PropertiesPanel from './PropertiesPanel';

const detail: PropertyDetail = {
  name: 'description', type: 'str', definer: '#7', supplier: '#101', local: 0, clear: 0,
  readable: 1, writable: 1, builtin: 0, owner: '#10', flags: 'rc', metadataWritable: 1, ownerWritable: 1,
  value: { type: 'str', text: 'A quiet room.' }, editable: 1, identity: 'room-lifetime', snapshot: 'old-snapshot',
};

describe('Properties browser journey', () => {
  let properties: GMCPObjectProperties;
  let send: ReturnType<typeof vi.fn>;
  let client: MudClient;
  let generation: number;

  beforeEach(() => {
    vi.useFakeTimers();
    generation = 1;
    usePropertyBrowserStore.getState().reset();
    useConnectionStore.getState().setSessionReady(true);
    usePersonalDataStore.setState({ owner: undefined, visitor: false, visitorWindow: false });
    send = vi.fn();
    client = { gmcp: { send, get generation() { return generation; }, require: () => properties } } as unknown as MudClient;
    properties = new GMCPObjectProperties(client);
  });

  afterEach(() => { properties.shutdown(); cleanup(); vi.useRealTimers(); });

  function request() {
    const call = send.mock.calls.at(-1);
    if (!call) throw new Error('Expected a GMCP request');
    return JSON.parse(call[1]);
  }

  function arrive(overrides: Partial<PropertyResult> = {}) {
    const sent = request();
    const wireName: string = send.mock.calls.at(-1)?.[0] ?? '';
    const operation = wireName.split('.').at(-1);
    act(() => properties.receive('Result', {
      id: sent.id, operation, ok: 1, message: 'Loaded.', target: '#101', targetName: 'Workshop',
      ...overrides,
    }));
  }

  function openDetail(value: PropertyDetail = detail) {
    render(<PropertiesPanel client={client} />);
    fireEvent.input(screen.getByLabelText('Object'), { target: { value: '#101' } });
    fireEvent.click(screen.getByRole('button', { name: 'Browse object' }));
    arrive({ rows: [value], total: 1, offset: 0 });
    fireEvent.click(screen.getByRole('button', { name: 'description' }));
    arrive({ detail: value });
  }

  it('looks up, selects, edits and saves an actual property with its original snapshot', () => {
    openDetail();
    expect(screen.getByRole('heading', { name: 'description' })).toHaveFocus();
    expect(screen.getByText('Overridden here')).toBeInTheDocument();
    fireEvent.input(screen.getByLabelText('Value'), { target: { value: 'Changed description.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save value' }));
    expect(request()).toMatchObject({ target: '#101', name: 'description', identity: 'room-lifetime', snapshot: 'old-snapshot', value: { type: 'str', text: 'Changed description.' } });
    arrive({ message: 'Value saved.', detail: { ...detail, snapshot: 'new-snapshot', value: { type: 'str', text: 'Changed description.' } } });
    expect(screen.getByLabelText('Value')).toHaveValue('Changed description.');
    fireEvent.click(screen.getByRole('button', { name: 'Close property' }));
    expect(screen.getByRole('button', { name: 'description' })).toHaveFocus();
  });

  it('preserves an unsaved draft after a stale edit refusal and timeout', () => {
    openDetail();
    fireEvent.input(screen.getByLabelText('Value'), { target: { value: 'Keep this draft.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save value' }));
    arrive({ ok: 0, message: 'This property changed. Reload before saving.' });
    expect(screen.getByLabelText('Value')).toHaveValue('Keep this draft.');
    expect(screen.getByRole('alert')).toHaveTextContent('This property changed');
    fireEvent.click(screen.getByRole('button', { name: 'Save value' }));
    act(() => vi.advanceTimersByTime(15000));
    expect(screen.getByRole('alert')).toHaveTextContent('did not answer');
    expect(screen.getByLabelText('Value')).toHaveValue('Keep this draft.');
  });

  it('keeps typed integer and map keys exact in nested editable values', () => {
    openDetail({ ...detail, type: 'list', value: { type: 'list', items: [{ type: 'map', entries: [[{ type: 'int', text: '1' }, { type: 'int', text: '9223372036854775807' }]] }] } });
    const maximum = screen.getByDisplayValue('9223372036854775807');
    fireEvent.input(maximum, { target: { value: '9223372036854775806' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save value' }));
    expect(request().value).toEqual({ type: 'list', items: [{ type: 'map', entries: [[{ type: 'int', text: '1' }, { type: 'int', text: '9223372036854775806' }]] }] });
  });

  it('does not offer whole-value editing when a nested value is opaque', () => {
    openDetail({ ...detail, type: 'list', value: { type: 'list', items: [{ type: 'opaque', text: 'WAIF' }] }, editable: 0 });
    expect(screen.queryByRole('button', { name: 'Save value' })).not.toBeInTheDocument();
    expect(screen.getByText(/cannot be recreated/i)).toBeInTheDocument();
  });

  it('resets an inherited override and separately saves native metadata', () => {
    openDetail();
    fireEvent.click(screen.getByRole('button', { name: 'Reset to inherited value' }));
    expect(send.mock.calls.at(-1)?.[0]).toBe('Object.Properties.Clear');
    expect(request()).toMatchObject({ identity: 'room-lifetime', snapshot: 'old-snapshot' });
    arrive({ detail: { ...detail, clear: 1, supplier: '#7', snapshot: 'cleared' } });
    fireEvent.input(screen.getByLabelText('Property owner'), { target: { value: '#11' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save permissions' }));
    expect(request()).toMatchObject({ owner: '#11', flags: 'rc', snapshot: 'cleared' });
    expect(request()).not.toHaveProperty('value');
  });

  it('lets a native writer change flags while keeping owner transfer unavailable', () => {
    openDetail({ ...detail, ownerWritable: 0 });
    expect(screen.getByLabelText('Property owner')).toHaveAttribute('readonly');
    fireEvent.input(screen.getByLabelText('Permission flags'), { target: { value: 'rwc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save permissions' }));
    expect(request()).toMatchObject({ owner: '#10', flags: 'rwc' });
  });

  it('pages and filters on the server without losing the selected object', () => {
    render(<PropertiesPanel client={client} />);
    fireEvent.click(screen.getByRole('button', { name: 'Here' }));
    expect(request()).toMatchObject({ target: 'here', offset: 0, filter: 'all' });
    arrive({ rows: [detail], total: 35, offset: 0 });
    expect(within(screen.getByRole('table')).getByRole('columnheader', { name: 'Access' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(request()).toMatchObject({ target: '#101', offset: 30 });
    arrive({ rows: [], total: 35, offset: 30 });
    fireEvent.change(screen.getByLabelText('Show properties'), { target: { value: 'writable' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(request()).toMatchObject({ target: '#101', filter: 'writable', offset: 0 });
  });

  it('allows a named property lookup after listing is refused', () => {
    render(<PropertiesPanel client={client} />);
    fireEvent.input(screen.getByLabelText('Object'), { target: { value: '#101' } });
    fireEvent.click(screen.getByRole('button', { name: 'Browse object' }));
    arrive({ ok: 0, message: 'The property table is private.' });
    fireEvent.input(screen.getByLabelText('Property name'), { target: { value: 'description' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open property' }));
    expect(request()).toMatchObject({ target: '#101', name: 'description', edit: 1 });
  });

  it('paginates the displayed listing until draft filters are applied', () => {
    render(<PropertiesPanel client={client} />);
    fireEvent.click(screen.getByRole('button', { name: 'Here' }));
    arrive({ rows: [detail], total: 70, offset: 0 });
    fireEvent.change(screen.getByLabelText('Show properties'), { target: { value: 'writable' } });
    fireEvent.input(screen.getByLabelText('Search property names'), { target: { value: 'description' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(request()).toMatchObject({ filter: 'all', search: '', offset: 30 });
    arrive({ rows: [detail], total: 70, offset: 30 });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(request()).toMatchObject({ filter: 'writable', search: 'description', offset: 0 });
  });

  it('clears private results and drafts on sign-out and ignores late replies', () => {
    openDetail();
    fireEvent.input(screen.getByLabelText('Value'), { target: { value: 'Private draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save value' }));
    act(() => usePersonalDataStore.getState().clear());
    arrive({ detail });
    expect(screen.queryByDisplayValue('Private draft')).not.toBeInTheDocument();
    expect(usePropertyBrowserStore.getState().detail).toBeNull();
  });

  it('does not label a previous object property list as a newly opened object', () => {
    openDetail();
    fireEvent.click(screen.getByRole('button', { name: 'Close property' }));
    fireEvent.input(screen.getByLabelText('Object'), { target: { value: '#202' } });
    fireEvent.input(screen.getByLabelText('Property name'), { target: { value: 'description' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open property' }));
    arrive({ target: '#202', targetName: 'Other room', detail: { ...detail, supplier: '#202' } });
    fireEvent.click(screen.getByRole('button', { name: 'Close property' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'description' })).not.toBeInTheDocument();
    expect(screen.getByText('Choose an object to explore its properties.')).toBeInTheDocument();
  });

  it('ignores responses from an older transport generation and disables logged-out requests', () => {
    properties.list('here');
    generation++;
    arrive({ rows: [detail], total: 1, offset: 0 });
    expect(usePropertyBrowserStore.getState().rows).toEqual([]);
    act(() => useConnectionStore.getState().setSessionReady(false));
    render(<PropertiesPanel client={client} />);
    expect(screen.getByRole('button', { name: 'Browse object' })).toBeDisabled();
  });

  it('rejects malformed typed values at the protocol boundary', () => {
    properties.get('#101', 'description');
    expect(() => properties.receive('Result', { id: request().id, operation: 'Get', ok: 1, message: '', target: '#101', targetName: 'Workshop', detail: { ...detail, value: { type: 'map', entries: [[{ type: 'int', text: 1 }]] } } })).toThrow(/property response/i);
    expect(usePropertyBrowserStore.getState().detail).toBeNull();
  });
});
