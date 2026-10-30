import { useId, useRef } from 'react';
import type { PropertyValue, ScalarType } from '../gmcp/Object/Properties';
import { useFocusRecovery } from '../hooks/useFocusRecovery';

type EditableType = ScalarType | 'list' | 'map';
const types: { type: EditableType; label: string }[] = [
  { type: 'str', label: 'String' }, { type: 'int', label: 'Integer' },
  { type: 'float', label: 'Float' }, { type: 'bool', label: 'Boolean' },
  { type: 'obj', label: 'Object reference' }, { type: 'err', label: 'Error value' },
  { type: 'list', label: 'List' }, { type: 'map', label: 'Map' },
];

function emptyValue(type: string): PropertyValue {
  switch (type) {
    case 'int': return { type, text: '0' };
    case 'float': return { type, text: '0.0' };
    case 'bool': return { type, text: 'false' };
    case 'obj': return { type, text: '#-1' };
    case 'err': return { type, text: 'E_NONE' };
    case 'list': return { type, items: [] };
    case 'map': return { type, entries: [] };
    default: return { type: 'str', text: '' };
  }
}

interface ValueEditorProps {
  value: PropertyValue;
  onChange: (value: PropertyValue) => void;
  onBrowse: (reference: string) => void;
  readOnly: boolean;
  label?: string;
  mapKey?: boolean;
  depth?: number;
}

/** Edits typed values through native controls; no value is parsed or evaluated as MOO source. */
export default function PropertyValueEditor({ value, onChange, onBrowse, readOnly, label = 'Value', mapKey = false, depth = 0 }: ValueEditorProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  useFocusRecovery(root, `${id}-type`);
  if (value.type === 'opaque' || value.type === 'truncated') {
    return <div className="property-opaque"><strong>{label}</strong><p>{value.text}</p><p>{value.type === 'opaque' ? 'This native value cannot be recreated by the browser.' : 'This value is incomplete. It cannot be saved from this view.'}</p></div>;
  }
  const typeControl = (
    <div className="property-field">
      <label htmlFor={`${id}-type`}>{label} type</label>
      <select id={`${id}-type`} value={value.type} disabled={readOnly} onChange={(event) => onChange(emptyValue(event.currentTarget.value))}>
        {types.filter((entry) => !mapKey || (entry.type !== 'map' && entry.type !== 'list')).map((entry) => <option key={entry.type} value={entry.type}>{entry.label}</option>)}
      </select>
    </div>
  );
  if (value.type === 'list') {
    return (
      <div className="property-value" ref={root}>
        {typeControl}
        <details open>
          <summary>{label}: list, {value.items.length} {value.items.length === 1 ? 'item' : 'items'}</summary>
          <ol className="property-items">
            {value.items.map((item, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: list positions are the edited data; focus recovers after removal
              <li key={index}>
                <PropertyValueEditor value={item} label={`${label} / item ${index + 1}`} depth={depth + 1} readOnly={readOnly} onBrowse={onBrowse}
                  onChange={(replacement) => onChange({ type: 'list', items: value.items.map((previous, position) => position === index ? replacement : previous) })} />
                {!readOnly && <button type="button" onClick={() => onChange({ type: 'list', items: value.items.filter((_, position) => position !== index) })}>Remove item {index + 1}</button>}
              </li>
            ))}
          </ol>
          {!readOnly && depth < 15 && <button type="button" onClick={() => onChange({ type: 'list', items: [...value.items, emptyValue('str')] })}>Add item to {label}</button>}
        </details>
      </div>
    );
  }
  if (value.type === 'map') {
    return (
      <div className="property-value" ref={root}>
        {typeControl}
        <details open>
          <summary>{label}: map, {value.entries.length} {value.entries.length === 1 ? 'entry' : 'entries'}</summary>
          <ol className="property-items">
            {value.entries.map(([key, item], index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: entry positions are the edited data; focus recovers after removal
              <li key={index}>
                <PropertyValueEditor value={key} label={`${label} / entry ${index + 1} key`} depth={depth + 1} mapKey readOnly={readOnly} onBrowse={onBrowse}
                  onChange={(replacement) => onChange({ type: 'map', entries: value.entries.map((previous, position) => position === index ? [replacement, item] : previous) })} />
                <PropertyValueEditor value={item} label={`${label} / entry ${index + 1} value`} depth={depth + 1} readOnly={readOnly} onBrowse={onBrowse}
                  onChange={(replacement) => onChange({ type: 'map', entries: value.entries.map((previous, position) => position === index ? [key, replacement] : previous) })} />
                {!readOnly && <button type="button" onClick={() => onChange({ type: 'map', entries: value.entries.filter((_, position) => position !== index) })}>Remove entry {index + 1}</button>}
              </li>
            ))}
          </ol>
          {!readOnly && depth < 15 && <button type="button" onClick={() => onChange({ type: 'map', entries: [...value.entries, [emptyValue('str'), emptyValue('str')]] })}>Add entry to {label}</button>}
        </details>
      </div>
    );
  }
  return (
    <div className="property-value" ref={root}>
      {typeControl}
      <div className="property-field">
        <label htmlFor={`${id}-value`}>{label}</label>
        {value.type === 'str' ? (
          <textarea id={`${id}-value`} rows={4} value={value.text} readOnly={readOnly} onChange={(event) => onChange({ ...value, text: event.currentTarget.value })} />
        ) : value.type === 'bool' ? (
          <select id={`${id}-value`} value={value.text} disabled={readOnly} onChange={(event) => onChange({ ...value, text: event.currentTarget.value })}>
            <option value="true">True</option><option value="false">False</option>
          </select>
        ) : (
          <input id={`${id}-value`} type="text" inputMode={value.type === 'int' || value.type === 'float' ? 'decimal' : 'text'}
            value={value.text} readOnly={readOnly} spellCheck={false} onChange={(event) => onChange({ ...value, text: event.currentTarget.value })} />
        )}
        {value.type === 'obj' && /^#\d+$/.test(value.text) && <button type="button" onClick={() => onBrowse(value.text)}>Browse {value.text}</button>}
      </div>
    </div>
  );
}
