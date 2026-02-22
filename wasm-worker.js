/**
 * wasm-worker.js — Web Worker that runs the WASM MOO server.
 *
 * Messages FROM main thread:
 *   { type: "start", dbData: Uint8Array }                    — boot the server with this database
 *   { type: "input", data: string, connId?: number }         — inject a command line (connId defaults to 0)
 *   { type: "save" }                                         — request a checkpoint (save)
 *   { type: "remote-connect" }                               — create a new virtual connection
 *   { type: "remote-input", connId: number, data: string }   — inject input for a specific connection
 *   { type: "remote-disconnect", connId: number }            — close a specific connection
 *   { type: "remote-set-name", connId: number, name: string }— set a connection's player name
 *
 * Messages TO main thread:
 *   { type: "output", data: string }                         — a line of non-connection output (boot messages etc.)
 *   { type: "conn-output", connId: number, data: string }    — a line of output for a specific guest connection
 *   { type: "log", data: string }                            — stderr/log message
 *   { type: "remote-connected", connId: number }             — new virtual connection established
 *   { type: "saved", data: Uint8Array }                      — saved database file
 *   { type: "error", message: string }                       — error
 *   { type: "ready" }                                        — server is listening
 */

// Will be loaded by importScripts
var ToastStuntModule;
var Module = null;

self.onmessage = async function (e) {
  var msg = e.data;

  switch (msg.type) {
    case "start":
      try {
        // Load the Emscripten-generated JS glue
        importScripts("/wasm/moo.js");

        Module = await ToastStuntModule({
          onConnectionOutput: function (connId, text) {
            if (connId === 0) {
              // Host connection - same as old Module.print behavior
              self.postMessage({ type: "output", data: text });
            } else {
              // Guest connection - tagged with connId
              self.postMessage({
                type: "conn-output",
                connId: connId,
                data: text,
              });
            }
          },
          print: function (text) {
            // Non-connection output (boot messages, etc.)
            self.postMessage({ type: "output", data: text });
          },
          printErr: function (text) {
            self.postMessage({ type: "log", data: text });
            // Detect when server has finished booting and is listening.
            // The server logs "LISTEN:" when it opens the listener.
            if (text.indexOf("LISTEN:") !== -1) {
              self.postMessage({ type: "ready" });
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
                if (
                  data[i] === 0x0d &&
                  i + 1 < data.length &&
                  data[i + 1] === 0x0a
                ) {
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
      break;

    case "input":
      if (Module) {
        var targetConn = msg.connId !== undefined ? msg.connId : 0;
        Module.ccall("wasm_inject_input", null, ["number", "string"], [
          targetConn,
          msg.data,
        ]);
      }
      break;

    case "remote-connect":
      if (Module) {
        var newConnId = Module._wasm_new_connection();
        if (newConnId >= 0) {
          self.postMessage({ type: "remote-connected", connId: newConnId });
        } else {
          self.postMessage({
            type: "error",
            message: "Failed to create connection (max reached)",
          });
        }
      }
      break;

    case "remote-input":
      if (Module) {
        Module.ccall("wasm_inject_input", null, ["number", "string"], [
          msg.connId,
          msg.data,
        ]);
      }
      break;

    case "remote-disconnect":
      if (Module) {
        Module._wasm_close_connection(msg.connId);
      }
      break;

    case "remote-set-name":
      if (Module) {
        Module.ccall("wasm_set_connection_name", null, ["number", "string"], [
          msg.connId,
          msg.name,
        ]);
      }
      break;

    case "save":
      if (Module) {
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
      break;
  }
};
