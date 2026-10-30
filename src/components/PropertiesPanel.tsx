import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type MudClient from '../client';
import { editableValue, type PropertyFilter, type PropertyRow } from '../gmcp/Object/Properties';
import { useConnectionStore } from '../stores/connectionStore';
import { usePropertyBrowserStore } from '../stores/propertyBrowserStore';
import PropertyValueEditor from './PropertyValueEditor';
import './PropertiesPanel.css';

function inheritance(row: PropertyRow): string {
  if (row.builtin) return 'Built-in';
  if (row.local) return 'Defined here';
  return row.clear ? 'Inherited' : 'Overridden here';
}

/** Native table browsing and a separate property form share the server's permission-checked view. */
export default function PropertiesPanel({ client }: { client: MudClient }) {
  const state = usePropertyBrowserStore();
  const ready = useConnectionStore((connection) => connection.sessionReady);
  const [target, setTarget] = useState('');
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PropertyFilter>('all');
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const objectInput = useRef<HTMLInputElement>(null);
  const propertyButtons = useRef(new Map<string, HTMLButtonElement>());
  const returnToProperty = useRef<string | null>(null);
  const packageHandler = () => client.gmcp.require('Object.Properties');
  const disabled = !ready || state.busy;
  const detail = state.detail;
  const valueDirty = !!detail && JSON.stringify(state.draft) !== JSON.stringify(detail.value);
  const metadataDirty = !!detail && (state.ownerDraft !== detail.owner || state.flagsDraft !== detail.flags);
  const dirty = valueDirty || metadataDirty;
  const navigatingDisabled = disabled || dirty;
  const canEditValue = !!detail && !!detail.editable && !!detail.writable && editableValue(detail.value);
  const canEditMetadata = !!detail?.metadataWritable && !!detail.identity && !!detail.snapshot;

  useEffect(() => {
    // Reset also removes local lookup text on sign-out, account or connection changes.
    setTarget(''); setName(''); setSearch(''); setFilter('all');
  }, [state.resetCount]);
  useEffect(() => { if (state.detailCount) detailHeading.current?.focus(); }, [state.detailCount]);
  useLayoutEffect(() => {
    if (detail || !returnToProperty.current) return;
    const button = propertyButtons.current.get(returnToProperty.current);
    (button ?? objectInput.current)?.focus();
    returnToProperty.current = null;
  }, [detail]);

  const browse = (reference: string) => {
    if (navigatingDisabled) return;
    setTarget(reference);
    packageHandler().list(reference, search, filter);
  };
  const close = () => {
    returnToProperty.current = detail?.name ?? null;
    usePropertyBrowserStore.getState().cancel();
  };
  const referenceButton = (reference: string, label: string) => reference ? (
    <button type="button" className="property-reference" disabled={navigatingDisabled} onClick={() => browse(reference)}>{label} {reference}</button>
  ) : <span>Unavailable</span>;

  return (
    <section className="properties-panel" aria-label="Property browser" aria-busy={state.busy}>
      <header className="property-intro"><h3>Properties</h3><p>Explore how an object is built. Edit the values your permissions allow.</p></header>
      <form className="property-lookup" onSubmit={(event) => { event.preventDefault(); browse(target.trim()); }}>
        <label htmlFor="properties-object">Object</label>
        <div className="property-actions">
          <input id="properties-object" ref={objectInput} value={target} placeholder="Object name, #number or $reference" disabled={state.busy || dirty} onChange={(event) => setTarget(event.currentTarget.value)} />
          <button type="submit" disabled={navigatingDisabled || !target.trim()}>Browse object</button>
          <button type="button" disabled={navigatingDisabled} onClick={() => browse('here')}>Here</button>
          <button type="button" disabled={navigatingDisabled} onClick={() => browse('me')}>Me</button>
        </div>
      </form>
      <form className="property-lookup" onSubmit={(event) => { event.preventDefault(); packageHandler().get(target.trim() || state.target, name.trim()); }}>
        <label htmlFor="properties-name">Property name</label>
        <div className="property-actions">
          <input id="properties-name" value={name} disabled={state.busy || dirty} onChange={(event) => setName(event.currentTarget.value)} />
          <button type="submit" disabled={navigatingDisabled || !name.trim() || !(target.trim() || state.target)}>Open property</button>
        </div>
        <p className="property-hint">A known property can be opened even when its object’s property list is private.</p>
      </form>
      {!ready && <p>Log in to browse or edit properties.</p>}
      {state.busy && <p role="status">Waiting for the server…</p>}
      {state.message && <p className={state.error ? 'property-error' : 'property-notice'} role={state.error ? 'alert' : 'status'}>{state.message}</p>}
      {dirty && <p className="property-hint">You have unsaved changes. Save or cancel before choosing another object or property.</p>}
      {detail && state.draft ? (
        <article className="property-detail">
          <div className="property-detail-title"><h4 ref={detailHeading} tabIndex={-1}>{detail.name}</h4><span className="property-badge">{inheritance(detail)}</span></div>
          <p className="property-target">{state.targetName} <code>{state.target}</code></p>
          <dl className="property-metadata">
            <dt>Defined on</dt><dd>{referenceButton(detail.definer, 'Browse defining object')}</dd>
            <dt>Value supplied by</dt><dd>{referenceButton(detail.supplier, 'Browse value supplier')}</dd>
            <dt>Property owner</dt><dd>{detail.owner || 'Not disclosed'}</dd>
            <dt>Flags</dt><dd>{detail.flags || 'None disclosed'}</dd>
            <dt>Access</dt><dd>{detail.readable ? 'Readable' : 'Not readable'}; {detail.writable ? 'writable' : 'not writable'}</dd>
          </dl>
          <form onSubmit={(event) => { event.preventDefault(); if (canEditValue && state.draft) packageHandler().save(state.target, detail, state.draft); }}>
            <fieldset disabled={disabled || metadataDirty}>
              <legend>Property value</legend>
              <PropertyValueEditor value={state.draft} readOnly={!canEditValue} onChange={(value) => state.edit(value)} onBrowse={browse} />
              <p className="property-hint">Saving assigns this property’s value directly, like @set. Builder configuration commands such as @configure perform their own domain operations.</p>
              {canEditValue && <div className="property-actions"><button type="submit" className="property-primary">Save value</button>
                {!detail.builtin && !detail.local && !detail.clear && <button type="button" disabled={valueDirty} onClick={() => packageHandler().clearProperty(state.target, detail)}>Reset to inherited value</button>}
              </div>}
            </fieldset>
          </form>
          {canEditMetadata && (
            <form onSubmit={(event) => { event.preventDefault(); packageHandler().saveMetadata(state.target, detail, state.ownerDraft.trim(), state.flagsDraft); }}>
              <fieldset disabled={disabled || valueDirty}>
                <legend>Property permissions</legend>
                <div className="property-field"><label htmlFor="properties-owner">Property owner</label>
                  <input id="properties-owner" value={state.ownerDraft} readOnly={!detail.ownerWritable} aria-describedby="properties-owner-hint" onChange={(event) => state.editMetadata(event.currentTarget.value, state.flagsDraft)} />
                  {!detail.ownerWritable && <p id="properties-owner-hint" className="property-hint">Your permissions allow flag changes, but not changing the property owner.</p>}</div>
                <div className="property-field"><label htmlFor="properties-flags">Permission flags</label>
                  <input id="properties-flags" value={state.flagsDraft} aria-describedby="properties-flags-hint" onChange={(event) => state.editMetadata(state.ownerDraft, event.currentTarget.value)} />
                  <p id="properties-flags-hint" className="property-hint">r: readable; w: writable; c: ownership changes on descendants. The server checks which changes you may make.</p></div>
                <button type="submit">Save permissions</button>
              </fieldset>
            </form>
          )}
          <button type="button" disabled={state.busy} onClick={close}>{dirty ? 'Cancel' : 'Close property'}</button>
        </article>
      ) : (
        <>
          <form className="property-filters" onSubmit={(event) => { event.preventDefault(); packageHandler().list(state.target || target, search, filter); }}>
            <div className="property-field"><label htmlFor="properties-search">Search property names</label><input id="properties-search" value={search} disabled={disabled} onChange={(event) => setSearch(event.currentTarget.value)} /></div>
            <div className="property-field"><label htmlFor="properties-filter">Show properties</label><select id="properties-filter" value={filter} disabled={disabled} onChange={(event) => {
              const value = event.currentTarget.value;
              if (value === 'all' || value === 'local' || value === 'writable') setFilter(value);
            }}><option value="all">All properties</option><option value="local">Locally set</option><option value="writable">Writable</option></select></div>
            <button type="submit" disabled={disabled || !(state.target || target)}>Apply filters</button>
          </form>
          {state.listed ? (
            <div className="property-list">
              <div className="property-table-scroll">
                <table><caption>{state.targetName} {state.target} — properties</caption>
                  <thead><tr><th scope="col">Property</th><th scope="col">Type / source</th><th scope="col">Access</th></tr></thead>
                  <tbody>{state.rows.map((row) => <tr key={row.name}>
                    <th scope="row"><button type="button" ref={(button) => { if (button) propertyButtons.current.set(row.name, button); else propertyButtons.current.delete(row.name); }} disabled={disabled} onClick={() => packageHandler().get(state.target, row.name)}>{row.name}</button></th>
                    <td><span className="property-type">{row.type || 'Undisclosed'}</span><span className="property-source">{inheritance(row)}</span></td>
                    <td>{row.readable ? 'Read' : 'Private'}{row.writable ? ' / Write' : ''}</td>
                  </tr>)}</tbody>
                </table>
              </div>
              {!state.rows.length && <p>No matching properties on this page.</p>}
              <p>{state.total} matching {state.total === 1 ? 'property' : 'properties'}. {state.rows.length > 0 ? `Showing ${state.offset + 1}–${state.offset + state.rows.length}.` : ''}</p>
              <nav className="property-actions" aria-label="Property pages">
                <button type="button" disabled={disabled || state.offset === 0} onClick={() => packageHandler().list(state.target, search, filter, Math.max(0, state.offset - 30))}>Previous page</button>
                <button type="button" disabled={disabled || state.offset + 30 >= state.total} onClick={() => packageHandler().list(state.target, search, filter, state.offset + 30)}>Next page</button>
              </nav>
            </div>
          ) : <p className="property-empty">Choose an object to explore its properties.</p>}
        </>
      )}
    </section>
  );
}
