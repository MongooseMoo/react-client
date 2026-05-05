import { useEffect, useRef, useState } from "react";
import { announce } from "@react-aria/live-announcer";
import Anser from "anser";
import MudClient from "../client";
import { preferencesStore, NavigationKeyScheme } from "../PreferencesStore";

const navigationKeyMaps: Record<NavigationKeyScheme, { up: string; down: string; left: string; right: string }> = {
  jkli: { up: "i", down: "k", left: "j", right: "l" },
  wasd: { up: "w", down: "s", left: "a", right: "d" },
  "dvorak-rh": { up: "c", down: "t", left: "h", right: "n" },
  "dvorak-lh": { up: ",", down: "o", left: "a", right: "e" },
};

/** Match a key event against a navigation key, using e.code as fallback for macOS Option+letter */
function matchesNavKey(e: KeyboardEvent, navKey: string): boolean {
  if (e.key.toLowerCase() === navKey) return true;
  if (navKey === ",") return e.code === "Comma";
  if (navKey.length === 1) return e.code === `Key${navKey.toUpperCase()}`;
  return false;
}

/** Extract digit 0-9 from a key event, using e.code as fallback for macOS Option+number */
function getDigit(e: KeyboardEvent): number | null {
  const fromKey = parseInt(e.key);
  if (!isNaN(fromKey) && fromKey >= 0 && fromKey <= 9) return fromKey;
  // macOS Option+number produces special chars, fall back to physical key
  const match = e.code.match(/^Digit(\d)$/);
  if (match) return parseInt(match[1]);
  return null;
}

interface Message {
  id: number;
  message: string;
  timestamp: number;
  channel?: string;
  talker?: string;
}

interface Buffer {
  name: string;
  messages: Message[];
  currentIndex: number;
}

const MAX_MESSAGES_PER_BUFFER = 100000;

export function formatChannelMessage(channel: string, talker: string, text: string): string {
  const plainText = Anser.ansiToText(text).trim();

  if (!talker) {
    return plainText;
  }

  if (plainText.startsWith("S/He ")) {
    return `${talker}${plainText.slice(4)}`;
  }

  if (plainText.includes(talker)) {
    return plainText;
  }

  if (channel === "say") {
    return `${talker}: ${plainText}`;
  }

  return `${talker}: ${plainText}`;
}

export const useChannelHistory = (client: MudClient | null) => {
  const [buffers, setBuffers] = useState<Map<string, Buffer>>(
    new Map([["all", { name: "all", messages: [], currentIndex: 0 }]])
  );
  const [bufferOrder, setBufferOrder] = useState<string[]>(["all"]);
  const [currentBufferIndex, setCurrentBufferIndex] = useState(0);
  const [timestampsEnabled, setTimestampsEnabled] = useState(true);
  const lastKeyPress = useRef<{ key: string; time: number; count: number } | null>(null);
  const messageIdCounter = useRef(0);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("channelHistory");
      if (saved) {
        const parsed = JSON.parse(saved);
        const loadedBuffers = new Map<string, Buffer>(
          parsed.bufferOrder.map((name: string): [string, Buffer] => [
            name,
            parsed.buffers[name] || { name, messages: [], currentIndex: 0 }
          ])
        );
        setBuffers(loadedBuffers);
        setBufferOrder(parsed.bufferOrder);
        setCurrentBufferIndex(parsed.currentBufferIndex || 0);
        setTimestampsEnabled(parsed.timestampsEnabled ?? true);
      }
    } catch (error) {
      console.error("Failed to load channel history:", error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const buffersObj: Record<string, Buffer> = {};
      buffers.forEach((buffer, name) => {
        buffersObj[name] = buffer;
      });

      localStorage.setItem("channelHistory", JSON.stringify({
        buffers: buffersObj,
        bufferOrder,
        currentBufferIndex,
        timestampsEnabled,
      }));
    } catch (error) {
      console.error("Failed to save channel history:", error);
    }
  }, [buffers, bufferOrder, currentBufferIndex, timestampsEnabled]);

  const addMessageToBuffer = (bufferName: string, message: string, channel?: string, talker?: string) => {
    setBuffers(prevBuffers => {
      const newBuffers = new Map(prevBuffers);
      const buffer = newBuffers.get(bufferName);

      if (!buffer) return prevBuffers;

      const newMessage: Message = {
        id: messageIdCounter.current++,
        message,
        timestamp: Date.now(),
        channel,
        talker,
      };

      const updatedMessages = [...buffer.messages, newMessage];

      // Trim if exceeds max
      if (updatedMessages.length > MAX_MESSAGES_PER_BUFFER) {
        updatedMessages.shift();
        if (buffer.currentIndex > 0) {
          buffer.currentIndex--;
        }
      }

      newBuffers.set(bufferName, {
        ...buffer,
        messages: updatedMessages,
      });

      return newBuffers;
    });
  };

  // Handle regular messages
  const handleMessage = (message: string) => {
    if (!message.trim()) return;
    // Strip ANSI codes before storing
    const plainText = Anser.ansiToText(message);
    addMessageToBuffer("all", plainText);
  };

  // Handle channel messages
  const handleChannelText = (data: { channel: string; talker: string; text: string }) => {
    const { channel, talker, text } = data;
    const formattedText = formatChannelMessage(channel, talker, text);

    // Create channel buffer if it doesn't exist
    if (!buffers.has(channel)) {
      setBuffers(prev => {
        const newBuffers = new Map(prev);
        newBuffers.set(channel, {
          name: channel,
          messages: [],
          currentIndex: 0,
        });
        return newBuffers;
      });
      setBufferOrder(prev => [...prev, channel]);

      // Add message after buffer is created
      setTimeout(() => addMessageToBuffer(channel, formattedText, channel, talker), 0);
    } else {
      addMessageToBuffer(channel, formattedText, channel, talker);
    }
  };

  // Set up client event listeners
  useEffect(() => {
    if (!client) return;

    client.on("channelText", handleChannelText);
    client.on("message", handleMessage);

    return () => {
      client.removeListener("channelText", handleChannelText);
      client.removeListener("message", handleMessage);
    };
  }, [client, buffers]);

  const getCurrentBuffer = (): Buffer | undefined => {
    return buffers.get(bufferOrder[currentBufferIndex]);
  };

  const changeBuffer = (direction: number) => {
    const newIndex = (currentBufferIndex + direction + bufferOrder.length) % bufferOrder.length;
    setCurrentBufferIndex(newIndex);

    const buffer = buffers.get(bufferOrder[newIndex]);
    if (buffer) {
      const messageCount = buffer.messages.length;
      const currentIdx = buffer.currentIndex;
      announce(
        `${buffer.name}: ${currentIdx > 0 ? currentIdx : messageCount > 0 ? messageCount : 0} of ${messageCount}`,
        "assertive", 2000
      );
    }
  };

  const jumpToBuffer = (bufferIndex: number) => {
    if (bufferIndex < 0 || bufferIndex >= bufferOrder.length) {
      announce("That buffer doesn't exist yet.", "assertive", 2000);
      return;
    }

    setCurrentBufferIndex(bufferIndex);
    const buffer = buffers.get(bufferOrder[bufferIndex]);
    if (buffer) {
      announce(`${buffer.name}: ${buffer.currentIndex || buffer.messages.length} of ${buffer.messages.length}`, "assertive", 2000);
    }
  };

  const calculateRelativeTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);

    if (seconds < 1) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      const remainingSeconds = seconds % 60;
      return `${minutes} minutes ${remainingSeconds > 0 ? remainingSeconds + " seconds " : ""}ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const remainingMinutes = minutes % 60;
      return `${hours} hours ${remainingMinutes} minutes ago`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    return `${days} days, ${remainingHours} hours, and ${remainingMinutes} minutes ago`;
  };

  const announceMessage = (message: Message, prefix: string = "") => {
    let announcement = prefix + message.message;

    if (timestampsEnabled) {
      const relativeTime = calculateRelativeTime(Date.now() - message.timestamp);
      const lastChar = message.message.slice(-1);
      if (/[a-zA-Z0-9]/.test(lastChar)) {
        announcement += ".";
      }
      announcement += " " + relativeTime;
    }

    announce(announcement, "assertive", 2000);
  };

  const readMessage = (messageNumber: number, isFromAllBuffer: boolean = false) => {
    const bufferName = isFromAllBuffer ? "all" : bufferOrder[currentBufferIndex];
    const buffer = buffers.get(bufferName);

    if (!buffer || buffer.messages.length === 0) {
      announce("No messages", "assertive", 2000);
      return;
    }

    if (messageNumber > buffer.messages.length) {
      announce("No message", "assertive", 2000);
      return;
    }

    const realIndex = buffer.messages.length - messageNumber;
    const message = buffer.messages[realIndex];

    if (!message) {
      announce("No message", "assertive", 2000);
      return;
    }

    announceMessage(message);
  };

  const navigateMessage = (offset: number) => {
    const buffer = getCurrentBuffer();

    if (!buffer || buffer.messages.length === 0) {
      announce("No messages", "assertive", 2000);
      return;
    }

    setBuffers(prev => {
      const newBuffers = new Map(prev);
      const currentBuffer = newBuffers.get(bufferOrder[currentBufferIndex]);

      if (!currentBuffer) return prev;

      let newIndex = currentBuffer.currentIndex + offset;
      let prefix = "";

      if (currentBuffer.currentIndex === 0) {
        newIndex = currentBuffer.messages.length;
      }

      if (newIndex < 1) {
        newIndex = 1;
        prefix = "Top: ";
      } else if (newIndex > currentBuffer.messages.length) {
        newIndex = currentBuffer.messages.length;
        prefix = "Bottom: ";
      }

      newBuffers.set(bufferOrder[currentBufferIndex], {
        ...currentBuffer,
        currentIndex: newIndex,
      });

      const message = currentBuffer.messages[newIndex - 1];
      if (message) {
        announceMessage(message, prefix);
      }

      return newBuffers;
    });
  };

  const copyCurrentMessage = () => {
    const buffer = getCurrentBuffer();
    if (!buffer || buffer.currentIndex === 0) {
      announce("No message selected", "assertive", 2000);
      return;
    }

    const message = buffer.messages[buffer.currentIndex - 1];
    if (message) {
      navigator.clipboard.writeText(message.message).then(() => {
        announce("Copied", "assertive", 2000);
      });
    }
  };

  const toggleTimestamps = () => {
    setTimestampsEnabled(prev => {
      const enabled = !prev;
      announce(
        enabled
          ? "You will now hear an approximate time after every message."
          : "Timestamps will no longer be spoken after messages.",
        "assertive", 2000
      );
      return enabled;
    });
  };

  const deleteCurrentBuffer = () => {
    const currentBufferName = bufferOrder[currentBufferIndex];

    if (currentBufferName === "all") {
      announce("Cannot delete the all buffer", "assertive", 2000);
      return;
    }

    if (bufferOrder.length === 1) {
      announce("Cannot delete the last buffer", "assertive", 2000);
      return;
    }

    setBuffers(prev => {
      const newBuffers = new Map(prev);
      newBuffers.delete(currentBufferName);
      return newBuffers;
    });

    setBufferOrder(prev => {
      const newOrder = prev.filter(name => name !== currentBufferName);
      const newIndex = currentBufferIndex >= newOrder.length ? 0 : currentBufferIndex;
      setCurrentBufferIndex(newIndex);

      const newBuffer = buffers.get(newOrder[newIndex]);
      if (newBuffer) {
        announce(newBuffer.name, "assertive", 2000);
      }

      return newOrder;
    });
  };

  const clearBuffer = (bufferName: string) => {
    setBuffers(prev => {
      const newBuffers = new Map(prev);
      const buffer = newBuffers.get(bufferName);
      if (buffer) {
        newBuffers.set(bufferName, {
          ...buffer,
          messages: [],
          currentIndex: 0,
        });
      }
      return newBuffers;
    });
  };

  const clearAllBuffers = () => {
    // Delete all buffers except "all", then clear "all"
    setBuffers(new Map([["all", { name: "all", messages: [], currentIndex: 0 }]]));
    setBufferOrder(["all"]);
    setCurrentBufferIndex(0);
  };

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const key = `${e.altKey ? "alt+" : ""}${e.ctrlKey ? "ctrl+" : ""}${e.shiftKey ? "shift+" : ""}${e.key}`;

      let pressCount = 1;
      if (lastKeyPress.current && lastKeyPress.current.key === key && now - lastKeyPress.current.time < 500) {
        pressCount = lastKeyPress.current.count + 1;
      }

      lastKeyPress.current = { key, time: now, count: pressCount };

      // Alt+Arrow keys: always work regardless of scheme
      if (e.key === "ArrowLeft" && e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        changeBuffer(-1);
        return;
      }

      if (e.key === "ArrowRight" && e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        changeBuffer(1);
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.shiftKey && e.key === "ArrowUp") {
        e.preventDefault();
        navigateMessage(-1);
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.shiftKey && e.key === "ArrowDown") {
        e.preventDefault();
        navigateMessage(1);
        return;
      }

      // Alt+letter: change buffers (using configured key scheme)
      const scheme = preferencesStore.getState().keyboard.navigationKeyScheme;
      const navKeys = navigationKeyMaps[scheme];

      if (matchesNavKey(e, navKeys.left) && e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        changeBuffer(-1);
        return;
      }

      if (matchesNavKey(e, navKeys.right) && e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        changeBuffer(1);
        return;
      }

      // Alt+1-0: Read from current buffer
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const digit = getDigit(e);
        if (digit !== null) {
          e.preventDefault();
          const messageNum = digit === 0 ? 10 : digit;
          if (pressCount >= 2) {
            // Double-press copies the message
            readMessage(messageNum, false);
            const buffer = getCurrentBuffer();
            if (buffer) {
              const realIndex = buffer.messages.length - messageNum;
              const message = buffer.messages[realIndex];
              if (message) {
                navigator.clipboard.writeText(message.message).then(() => {
                  announce("Copied", "assertive", 2000);
                });
              }
            }
          } else {
            readMessage(messageNum, false);
          }
          return;
        }
      }

      // Alt+Shift+1-0: Jump to buffer
      if (e.altKey && e.shiftKey && !e.ctrlKey) {
        const digit = getDigit(e);
        if (digit !== null && digit >= 1 && digit <= 9) {
          e.preventDefault();
          jumpToBuffer(digit - 1);
          return;
        }
        if (digit === 0) {
          e.preventDefault();
          jumpToBuffer(9);
          return;
        }
      }

      // Alt+letter: Navigate within buffer (using configured key scheme)
      if (e.altKey && !e.ctrlKey && !e.shiftKey && matchesNavKey(e, navKeys.up)) {
        e.preventDefault();
        navigateMessage(-1);
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.shiftKey && matchesNavKey(e, navKeys.down)) {
        e.preventDefault();
        navigateMessage(1);
        return;
      }

      // Alt+PageUp/PageDown: Navigate 10 messages
      if (e.altKey && e.key === "PageUp") {
        e.preventDefault();
        navigateMessage(-10);
        return;
      }

      if (e.altKey && e.key === "PageDown") {
        e.preventDefault();
        navigateMessage(10);
        return;
      }

      // Alt+Home/End: Navigate to start/end
      if (e.altKey && e.key === "Home") {
        e.preventDefault();
        navigateMessage(-2000);
        return;
      }

      if (e.altKey && e.key === "End") {
        e.preventDefault();
        navigateMessage(2000);
        return;
      }

      // Alt+Space: Repeat current message
      if (e.altKey && !e.shiftKey && e.key === " ") {
        e.preventDefault();
        navigateMessage(0);
        return;
      }

      // Alt+Shift+Space: Copy current message
      if (e.altKey && e.shiftKey && e.key === " ") {
        e.preventDefault();
        copyCurrentMessage();
        return;
      }

      // Alt+Shift+T: Toggle timestamps
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleTimestamps();
        return;
      }

      // Alt+Shift+Delete: Delete current buffer
      if (e.altKey && e.shiftKey && e.key === "Delete") {
        e.preventDefault();
        deleteCurrentBuffer();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [buffers, bufferOrder, currentBufferIndex, timestampsEnabled]);

  return {
    buffers,
    currentBufferIndex,
    bufferOrder,
    getCurrentBuffer,
    clearAllBuffers,
  };
};
