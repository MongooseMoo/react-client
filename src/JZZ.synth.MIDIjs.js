(function() {
  if (!JZZ) return;
  if (!JZZ.synth) JZZ.synth = {};

  function _name(name) { return name ? name : 'JZZ.synth.MIDIjs'; }

  var _waiting = false;
  var _running = false;
  var _bad = false;
  var _error;

  // Dynamic loading state management
  var _loadingInstruments = {}; // Track instruments currently being loaded
  var _pendingProgramChanges = []; // Queue program changes waiting for load completion

  function _receive(a) {
    var s = a[0]>>4;
    var c = a[0]&0xf;
    
    if (s == 0xC) { // Program Change (0xC0-0xCF)
      var program = a[1];
      var instrumentName = MIDI.GM && MIDI.GM.byId && MIDI.GM.byId[program] ? MIDI.GM.byId[program].id : null;
      
      if (instrumentName && MIDI.Soundfont && !MIDI.Soundfont[instrumentName]) {
        // Instrument not loaded
        console.log('Program change to unloaded instrument:', instrumentName, 'program:', program);
        
        // Check if already loading this instrument
        if (_loadingInstruments[instrumentName]) {
          // Queue this program change for after loading completes
          _pendingProgramChanges.push({channel: c, program: program, instrument: instrumentName});
          console.log('Queuing program change while loading:', instrumentName);
          return; // Don't process original program change
        }
        
        // Start loading process
        _loadingInstruments[instrumentName] = true;
        _pendingProgramChanges.push({channel: c, program: program, instrument: instrumentName});
        
        // Immediate fallback to acoustic_grand_piano (program 0)
        console.log('Falling back to piano while loading:', instrumentName);
        if (MIDI.programChange) {
          MIDI.programChange(c, 0);
        }
        
        // Load the requested instrument
        if (MIDI.loadResource) {
          MIDI.loadResource({
            instruments: [instrumentName],
            onsuccess: function() {
              console.log('Successfully loaded instrument:', instrumentName);
              
              // Send deferred program changes for this instrument
              var pending = _pendingProgramChanges.filter(function(p) { return p.instrument === instrumentName; });
              pending.forEach(function(p) {
                console.log('Sending deferred program change:', p.instrument, 'program:', p.program);
                if (MIDI.programChange) {
                  MIDI.programChange(p.channel, p.program);
                }
              });
              
              // Clean up
              delete _loadingInstruments[instrumentName];
              _pendingProgramChanges = _pendingProgramChanges.filter(function(p) { return p.instrument !== instrumentName; });
            },
            onerror: function(err) {
              console.warn('Failed to load instrument:', instrumentName, 'error:', err, '- staying on piano');
              delete _loadingInstruments[instrumentName];
              _pendingProgramChanges = _pendingProgramChanges.filter(function(p) { return p.instrument !== instrumentName; });
            }
          });
        }
        
        return; // Don't process original program change
      }
      
      // Instrument already loaded or no MIDI.js available yet - pass through
      if (MIDI.programChange) {
        MIDI.programChange(c, program);
      }
      return;
    }
    
    // Standard MIDI message processing
    if (s == 0x8) {
      if (MIDI.noteOff) {
        MIDI.noteOff(c, a[1]);
      }
    }
    else if (s == 0x9) {
      if (MIDI.noteOn) {
        MIDI.noteOn(c, a[1], a[2]);
      }
    }
  }

  var _ports = [];
  function _release(port, name) {
    port._info = _engine._info(name);
    port._receive = _receive;
    port._resume();
  }

  function _onsuccess() {
    _running = true;
    _waiting = false;
    for (var i=0; i<_ports.length; i++) _release(_ports[i][0], _ports[i][1]);
  }

  function _onerror(evt) {
    _bad = true;
    _error = evt;
    for (var i=0; i<_ports.length; i++) _ports[i][0]._crash(_error);
  }

  var _engine = {};

  _engine._info = function(name) {
    return {
      type: 'MIDI.js',
      name: _name(name),
      manufacturer: 'virtual',
      version: '0.3.2'
    };
  }

  _engine._openOut = function(port, name) {
    if (_running) {
      _release(port, name);
      return;
    }
    if (_bad) {
      port._crash(_error);
      return;
    }
    port._pause();
    _ports.push([port, name]);
    if (_waiting) return;
    _waiting = true;
    var arg = _engine._arg;
    if (!arg) arg = {};
    arg.onsuccess = _onsuccess;
    arg.onerror = _onerror;
    try {
      MIDI.loadPlugin(arg);
    }
    catch(e) {
      _error = e.message;
      _onerror(_error);
    }
  }

  JZZ.synth.MIDIjs = function() {
    var name, arg;
    if (arguments.length == 1) arg = arguments[0];
    else { name = arguments[0]; arg = arguments[1];}
    name = _name(name);
    if (!_running && !_waiting) _engine._arg = arg;
    return JZZ.lib.openMidiOut(name, _engine);
  }

  JZZ.synth.MIDIjs.register = function() {
    var name, arg;
    if (arguments.length == 1) arg = arguments[0];
    else { name = arguments[0]; arg = arguments[1];}
    name = _name(name);
    if (!_running && !_waiting) _engine._arg = arg;
    return JZZ.lib.registerMidiOut(name, _engine);
  }

})();