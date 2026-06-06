export const MOO_LANGUAGE_ID = 'moocode';
export const PLAINTEXT_LANGUAGE_ID = 'plaintext';

export const MOO_SESSION_TYPES = ['moo-code', 'moocode', 'lambdamoo'] as const;

export const STATEMENT_KEYWORDS = [
  'if',
  'else',
  'elseif',
  'endif',
  'for',
  'in',
  'endfor',
  'fork',
  'endfork',
  'return',
  'while',
  'endwhile',
  'try',
  'except',
  'finally',
  'endtry',
  'ANY',
  'break',
  'continue',
] as const;

export const OPERATOR_WORDS = ['and', 'or', 'bitor', 'bitand', 'bitxor'] as const;

export const ERROR_CONSTANTS = [
  'E_NONE',
  'E_TYPE',
  'E_DIV',
  'E_PERM',
  'E_PROPNF',
  'E_VERBNF',
  'E_VARNF',
  'E_INVIND',
  'E_RECMOVE',
  'E_MAXREC',
  'E_RANGE',
  'E_ARGS',
  'E_NACC',
  'E_INVARG',
  'E_QUOTA',
  'E_FLOAT',
  'E_FILE',
  'E_EXEC',
  'E_INTRPT',
] as const;

export const BUILTIN_VARIABLES = [
  'player',
  'this',
  'caller',
  'verb',
  'args',
  'argstr',
  'dobj',
  'dobjstr',
  'prepstr',
  'iobj',
  'iobjstr',
] as const;

export const SYSTEM_REFERENCES = [
  '$login',
  '$local',
  '$network',
  '$player',
  '$room',
  '$string_utils',
  '$telnet_utils',
  '$utils',
  '$wiz',
] as const;

export const BUILTIN_FUNCTIONS = [
  'abs',
  'add_property',
  'add_verb',
  'all_members',
  'ancestors',
  'boot_player',
  'callers',
  'caller_perms',
  'children',
  'chparent',
  'chparents',
  'clear_property',
  'connected_players',
  'connected_seconds',
  'connection_info',
  'connection_name',
  'connection_options',
  'ctime',
  'decode_binary',
  'delete_property',
  'delete_verb',
  'descendants',
  'dump_database',
  'equal',
  'eval',
  'explode',
  'floatstr',
  'forked',
  'function_info',
  'idle_seconds',
  'index',
  'is_clear_property',
  'is_member',
  'is_player',
  'isa',
  'length',
  'listappend',
  'listdelete',
  'listinsert',
  'listset',
  'listeners',
  'listen',
  'match',
  'max',
  'max_object',
  'memory_usage',
  'min',
  'move',
  'notify',
  'object_bytes',
  'open_network_connection',
  'parent',
  'parents',
  'pass',
  'players',
  'properties',
  'property_info',
  'queue_info',
  'queued_tasks',
  'raise',
  'random',
  'read',
  'recycled_objects',
  'resume',
  'rindex',
  'rmatch',
  'seconds_left',
  'server_log',
  'server_version',
  'set_player_flag',
  'set_property_info',
  'set_task_perms',
  'set_verb_args',
  'set_verb_code',
  'set_verb_info',
  'setadd',
  'setremove',
  'shutdown',
  'sort',
  'strcmp',
  'strsub',
  'substitute',
  'suspend',
  'task_id',
  'task_perms',
  'task_stack',
  'ticks_left',
  'time',
  'tofloat',
  'toint',
  'toliteral',
  'toobj',
  'tostr',
  'typeof',
  'unlisten',
  'valid',
  'value_bytes',
  'verb_args',
  'verb_code',
  'verb_info',
  'verbs',
] as const;

export type MooBlockKind = 'if' | 'for' | 'while' | 'fork' | 'try';

export type MooBlockDefinition = {
  close: string;
  middle?: readonly string[];
  isLoop?: boolean;
};

export const MOO_BLOCKS: Record<MooBlockKind, MooBlockDefinition> = {
  if: { close: 'endif', middle: ['elseif', 'else'] },
  for: { close: 'endfor', isLoop: true },
  while: { close: 'endwhile', isLoop: true },
  fork: { close: 'endfork' },
  try: { close: 'endtry', middle: ['except', 'finally'] },
};

export const MOO_CLOSE_KEYWORDS = Object.fromEntries(
  Object.entries(MOO_BLOCKS).map(([kind, block]) => [block.close, kind]),
) as Record<string, MooBlockKind>;

export const MOO_MIDDLE_KEYWORDS = Object.fromEntries(
  Object.entries(MOO_BLOCKS).flatMap(([kind, block]) =>
    (block.middle ?? []).map((keyword) => [keyword, kind]),
  ),
) as Record<string, MooBlockKind>;

export const MOO_INDENT_OPEN_KEYWORDS = [
  ...Object.keys(MOO_BLOCKS),
  ...Object.values(MOO_BLOCKS).flatMap((block) => block.middle ?? []),
] as const;
