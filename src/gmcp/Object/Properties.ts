import { inbound, outbound } from '../../protocol/messages';
import { useConnectionStore } from '../../stores/connectionStore';
import { ownerKey, usePersonalDataStore } from '../../stores/personalDataStore';
import { usePropertyBrowserStore } from '../../stores/propertyBrowserStore';
import { gmcpJsonMessage } from '../messages';
import { GMCPPackage } from '../package';

export type ScalarType = 'str' | 'int' | 'float' | 'bool' | 'obj' | 'err';
export type PropertyValue =
  | { type: ScalarType; text: string }
  | { type: 'list'; items: PropertyValue[] }
  | { type: 'map'; entries: [PropertyValue, PropertyValue][] }
  | { type: 'opaque' | 'truncated'; text: string };
export type PropertyFilter = 'all' | 'local' | 'writable';
export type PropertyOperation = 'List' | 'Get' | 'Set' | 'Clear';
type Bit = 0 | 1;

export interface PropertyRow {
  name: string;
  type: string;
  definer: string;
  supplier: string;
  local: Bit;
  clear: Bit;
  readable: Bit;
  writable: Bit;
  builtin: Bit;
  owner: string;
  flags: string;
  metadataWritable: Bit;
  ownerWritable: Bit;
}

export interface PropertyDetail extends PropertyRow {
  value: PropertyValue;
  editable: Bit;
  identity: string;
  snapshot: string;
}

export interface PropertyResult {
  id: string;
  operation: PropertyOperation;
  ok: Bit;
  message: string;
  target: string;
  targetName: string;
  rows?: PropertyRow[];
  total?: number;
  offset?: number;
  detail?: PropertyDetail;
}

interface TargetRequest { id: string; target: string }
interface ListRequest extends TargetRequest { search: string; filter: PropertyFilter; offset: number }
interface GetRequest extends TargetRequest { name: string; edit: 1 }
interface EditRequest extends TargetRequest { name: string; identity: string; snapshot: string }
type SetRequest = EditRequest & ({ value: PropertyValue } | { owner: string; flags: string });

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function bit(value: unknown): value is Bit { return value === 0 || value === 1; }

export function isPropertyValue(value: unknown, depth = 0, budget = { nodes: 0, text: 0 }): value is PropertyValue {
  if (!record(value) || depth > 16 || ++budget.nodes > 2048) return false;
  if (value.type === 'list') return Array.isArray(value.items) && value.items.every((item) => isPropertyValue(item, depth + 1, budget));
  if (value.type === 'map') return Array.isArray(value.entries) && value.entries.every((entry) =>
    Array.isArray(entry) && entry.length === 2 && entry.every((item) => isPropertyValue(item, depth + 1, budget)));
  if (!['str', 'int', 'float', 'bool', 'obj', 'err', 'opaque', 'truncated'].includes(String(value.type)) || typeof value.text !== 'string') return false;
  budget.text += value.text.length;
  return budget.text <= 131072;
}

function isRow(value: unknown): value is PropertyRow {
  return record(value) && ['name', 'type', 'definer', 'supplier', 'owner', 'flags'].every((key) => typeof value[key] === 'string') &&
    ['local', 'clear', 'readable', 'writable', 'builtin', 'metadataWritable', 'ownerWritable'].every((key) => bit(value[key]));
}

function isDetail(value: unknown): value is PropertyDetail {
  return isRow(value) && record(value) && bit(value.editable) && typeof value.identity === 'string' && typeof value.snapshot === 'string' && isPropertyValue(value.value);
}

function isResult(value: unknown): value is PropertyResult {
  if (!record(value) || !['id', 'operation', 'message', 'target', 'targetName'].every((key) => typeof value[key] === 'string') ||
    !['List', 'Get', 'Set', 'Clear'].includes(String(value.operation)) || !bit(value.ok)) return false;
  if (value.ok === 0) return true;
  if (value.operation !== 'List') return isDetail(value.detail);
  return Array.isArray(value.rows) && value.rows.length <= 30 && value.rows.every(isRow) &&
    typeof value.total === 'number' && Number.isSafeInteger(value.total) && value.total >= 0 &&
    typeof value.offset === 'number' && Number.isSafeInteger(value.offset) && value.offset >= 0;
}

const resultMessage = gmcpJsonMessage<'Result', PropertyResult>('Result', {
  encode: (value: PropertyResult) => value,
  decode(value: unknown): PropertyResult {
    if (!isResult(value)) throw new Error('Invalid property response');
    return value;
  },
});

const PropertiesBase = GMCPPackage.with({
  packageName: 'Object.Properties',
  messages: [
    outbound(gmcpJsonMessage<'List', never, ListRequest>('List')),
    outbound(gmcpJsonMessage<'Get', never, GetRequest>('Get')),
    outbound(gmcpJsonMessage<'Set', never, SetRequest>('Set')),
    outbound(gmcpJsonMessage<'Clear', never, EditRequest>('Clear')),
    inbound(resultMessage),
  ] as const,
});

/** True only for a complete value the browser can replace without inventing native identities. */
export function editableValue(value: PropertyValue): boolean {
  if (value.type === 'opaque' || value.type === 'truncated') return false;
  if (value.type === 'list') return value.items.every(editableValue);
  if (value.type === 'map') return value.entries.every(([key, item]) => editableValue(key) && editableValue(item));
  return true;
}

let instanceCounter = 0;

export class GMCPObjectProperties extends PropertiesBase {
  private readonly instance = ++instanceCounter;
  private serial = 0;
  private pending?: { id: string; operation: PropertyOperation; generation: number; timer: ReturnType<typeof setTimeout> };
  private readonly unsubscribe: () => void;

  constructor(client: ConstructorParameters<typeof PropertiesBase>[0]) {
    super(client);
    this.on('result', (result) => this.accept(result));
    this.unsubscribe = usePersonalDataStore.subscribe((current, previous) => {
      const currentOwner = current.owner ? ownerKey(current.owner) : '';
      const previousOwner = previous.owner ? ownerKey(previous.owner) : '';
      if (currentOwner !== previousOwner || current.visitor !== previous.visitor || current.visitorWindow !== previous.visitorWindow ||
        current.connects !== previous.connects || current.gameSessionId !== previous.gameSessionId ||
        (!current.owner && !current.reconnectingOwner && current !== previous)) this.reset();
    });
  }

  private request(operation: PropertyOperation, payload: Omit<ListRequest, 'id'> | Omit<GetRequest, 'id'> | Omit<EditRequest, 'id'> | (Omit<EditRequest, 'id'> & { value: PropertyValue }) | (Omit<EditRequest, 'id'> & { owner: string; flags: string })): void {
    const state = usePropertyBrowserStore.getState();
    if (this.pending) return;
    const policy = usePersonalDataStore.getState();
    if (!useConnectionStore.getState().sessionReady || (policy.visitor && !policy.visitorWindow)) {
      state.fail('Log in to browse or edit properties.');
      return;
    }
    const id = `${this.instance}:${++this.serial}`;
    const timer = setTimeout(() => {
      if (this.pending?.id !== id) return;
      this.pending = undefined;
      usePropertyBrowserStore.getState().fail('The server did not answer. Your draft is still here. Check the connection, then try again.');
    }, 15000);
    this.pending = { id, operation, generation: this.client.gmcp.generation, timer };
    state.begin();
    this.sendData(operation, { ...payload, id });
  }

  list(target: string, search = '', filter: PropertyFilter = 'all', offset = 0): void {
    this.request('List', { target, search, filter, offset });
  }

  get(target: string, name: string): void { this.request('Get', { target, name, edit: 1 }); }

  save(target: string, detail: PropertyDetail, value: PropertyValue): void {
    this.request('Set', { target, name: detail.name, identity: detail.identity, snapshot: detail.snapshot, value });
  }

  saveMetadata(target: string, detail: PropertyDetail, owner: string, flags: string): void {
    this.request('Set', { target, name: detail.name, identity: detail.identity, snapshot: detail.snapshot, owner, flags });
  }

  clearProperty(target: string, detail: PropertyDetail): void {
    this.request('Clear', { target, name: detail.name, identity: detail.identity, snapshot: detail.snapshot });
  }

  private accept(result: PropertyResult): void {
    const pending = this.pending;
    if (!pending || result.id !== pending.id || result.operation !== pending.operation || pending.generation !== this.client.gmcp.generation) return;
    clearTimeout(pending.timer);
    this.pending = undefined;
    usePropertyBrowserStore.getState().accept(result);
  }

  override reset(): void {
    if (this.pending) clearTimeout(this.pending.timer);
    this.pending = undefined;
    usePropertyBrowserStore.getState().reset();
  }

  override shutdown(): void { this.unsubscribe(); this.reset(); }
}
