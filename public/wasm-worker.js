/**
 * wasm-worker.js — Web Worker that runs the WASM MOO server.
 *
 * Messages FROM main thread:
 *   { type: "start", dbData: Uint8Array }  — boot the server with this database
 *   { type: "input", data: string }         — inject a command line
 *   { type: "save" }                        — request a checkpoint (save)
 *
 * Messages TO main thread:
 *   { type: "output", data: string }        — a line of server output
 *   { type: "log", data: string }           — stderr/log message
 *   { type: "connected", connId: number }   — virtual connection established
 *   { type: "saved", data: Uint8Array }     — saved database file
 *   { type: "error", message: string }      — error
 *   { type: "ready" }                       — server is listening
 */

// Will be loaded by importScripts
var ToastStuntModule;
var Module = null;
var connId = -1;

self.onmessage = async function (e) {
  var msg = e.data;

  if (msg.type === "start") {
    try {
      // Load the Emscripten-generated JS glue
      importScripts("/wasm/moo.js");

      Module = await ToastStuntModule({
        print: function (text) {
          // network_send_line() calls Module['print']() for each output line.
          // Forward to main thread for display.
          self.postMessage({ type: "output", data: text });
        },
        printErr: function (text) {
          self.postMessage({ type: "log", data: text });
          // Detect when server has finished booting and is listening.
          // The server logs "LISTEN:" when it opens the listener.
          if (text.indexOf("LISTEN:") !== -1) {
            self.postMessage({ type: "ready" });
            // Create a virtual connection after a short delay to let
            // the server finish its startup tasks.
            setTimeout(function () {
              if (Module && connId < 0) {
                connId = Module._wasm_new_connection();
                self.postMessage({ type: "connected", connId: connId });
              }
            }, 200);
          }
        },
        locateFile: function (path) {
          return "/wasm/" + path;
        },
        preRun: [
          function (mod) {
            // Write the database file into the virtual filesystem.
            var data = new Uint8Array(msg.dbData);
            // Check if CRLF normalization is needed (scan first 1000 bytes).
            // Only do the TextDecoder roundtrip if CRLF is actually present,
            // which avoids overhead for large LF-only files like mongoose.db.
            var needsCrlfFix = false;
            var scanLen = Math.min(data.length, 1000);
            for (var i = 0; i < scanLen; i++) {
              if (data[i] === 0x0d && i + 1 < data.length && data[i + 1] === 0x0a) {
                needsCrlfFix = true;
                break;
              }
            }
            if (needsCrlfFix) {
              var text = new TextDecoder("utf-8").decode(data);
              text = text.replace(/\r\n/g, "\n");
              data = new TextEncoder().encode(text);
            }
            mod.FS.writeFile("/server.db", data);
            // Create an empty .new file for checkpoint output
            mod.FS.writeFile("/server.db.new", new Uint8Array(0));
          },
        ],
        arguments: ["/server.db", "/server.db.new"],
        noExitRuntime: true,
      });
    } catch (err) {
      self.postMessage({ type: "error", message: err.toString() });
    }
  }

  if (msg.type === "input" && Module && connId >= 0) {
    // Inject input line into the virtual connection.
    // Use ccall which handles string->C conversion internally.
    Module.ccall(
      "wasm_inject_input",   // C function name
      null,                  // return type
      ["number", "string"],  // argument types
      [connId, msg.data]     // argument values
    );
  }

  if (msg.type === "save" && Module) {
    Module._wasm_checkpoint();
    // Wait for the checkpoint to complete (it runs on the next main loop
    // iteration), then read the saved file from the virtual filesystem.
    setTimeout(function () {
      try {
        var saved = Module.FS.readFile("/server.db.new");
        self.postMessage({ type: "saved", data: saved });
      } catch (saveErr) {
        self.postMessage({
          type: "error",
          message: "Save failed: " + saveErr,
        });
      }
    }, 2000);
  }
};
