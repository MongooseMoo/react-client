import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type MudClient from "../client";
import { useFocusRecovery } from "../hooks/useFocusRecovery";
import { performItemAction } from "../itemActions";
import type { UserlistPlayer } from "../mcp";
import { type UserlistMenuItem, useUserlistStore } from "../stores/userlistStore";
import AccessibleList from "./AccessibleList";
import "./ItemCard.css";
import "./userlist.css";

export interface UserlistProps {
    client: Pick<MudClient, "sendCommand">;
}

type Presence = "active" | "idle" | "away";

const PRESENCE_ORDER: Record<Presence, number> = { active: 0, idle: 1, away: 2 };
const HEADING_ID = "userlist-heading";
const LIST_ID = "userlist";

function presence(player: UserlistPlayer): Presence {
    if (player.away) return "away";
    return player.idle ? "idle" : "active";
}

/** "3 min", "2 h", "4 days": short enough to read in a list. */
export function shortDuration(ms: number): string {
    const minutes = Math.max(0, Math.floor(ms / 60_000));
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "1 day" : `${days} days`;
}

/** What the list says about a player after their name and role. */
export function presenceText(player: UserlistPlayer, now: number): string {
    const idleFor = player.lastActive === null ? "" : ` ${shortDuration(now - player.lastActive)}`;
    switch (presence(player)) {
        case "away":
            return player.idle ? `away, idle${idleFor}` : "away";
        case "idle":
            return `idle${idleFor}`;
        default:
            return "active";
    }
}

/** The server's command with this player filled in; a trailing space means the player finishes it. */
function menuAction(item: UserlistMenuItem, player: UserlistPlayer) {
    const fill = (text: string) => text.replaceAll("$(1)", player.id).replaceAll("$(2)", player.name);
    const command = fill(item.command);
    const label = fill(item.label);
    return {
        verb: label.split(" ")[0].toLowerCase(),
        label,
        description: label,
        command,
        caret: /\s$/.test(command) ? command.length : undefined,
    };
}

/** Re-render once a minute so idle times stay true while the panel is open. */
function useMinuteClock(): number {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 60_000);
        return () => window.clearInterval(timer);
    }, []);
    return now;
}

const PlayerCard: React.FC<{
    player: UserlistPlayer;
    isYou: boolean;
    now: number;
    menu: UserlistMenuItem[];
    client: UserlistProps["client"];
}> = ({ player, isYou, now, menu, client }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    useFocusRecovery(cardRef, LIST_ID, HEADING_ID);
    const actions = isYou ? [] : menu.map((item) => menuAction(item, player));
    return (
        <section ref={cardRef} className="item-card userlist-card" aria-label={player.name}>
            <div className="item-details">
                <div className="item-name">{player.name}{isYou && " (you)"}</div>
                <ul className="userlist-facts">
                    {player.role && <li>{player.role}</li>}
                    <li>{presenceText(player, now)}</li>
                    {player.connectedAt !== null && (
                        <li>connected {shortDuration(now - player.connectedAt)} ago</li>
                    )}
                </ul>
            </div>
            {actions.length > 0 && (
                <div className="item-actions">
                    {actions.map((action) => (
                        <button
                            key={action.command}
                            type="button"
                            className="item-action-button"
                            onClick={() => performItemAction(client, action)}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};

const Userlist: React.FC<UserlistProps> = ({ client }) => {
    const players = useUserlistStore((state) => state.players);
    const you = useUserlistStore((state) => state.you);
    const menu = useUserlistStore((state) => state.menu);
    const now = useMinuteClock();
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const sorted = useMemo(
        () =>
            [...players].sort(
                (a, b) =>
                    PRESENCE_ORDER[presence(a)] - PRESENCE_ORDER[presence(b)] ||
                    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
            ),
        [players],
    );
    const active = sorted.filter((player) => presence(player) === "active").length;
    const selected = sorted[selectedIndex] ?? null;

    return (
        <div className="userlist-panel" role="region" aria-labelledby={HEADING_ID}>
            <h4 id={HEADING_ID} tabIndex={-1}>
                Players: {sorted.length} online, {active} active
            </h4>
            {sorted.length === 0 ? (
                <p>Nobody else is connected.</p>
            ) : (
                <AccessibleList
                    items={sorted}
                    listId={LIST_ID}
                    labelledBy={HEADING_ID}
                    focusReturnId={HEADING_ID}
                    className="userlist-accessible-container"
                    onSelectedIndexChange={setSelectedIndex}
                    getItemTextValue={(player) => player.name}
                    itemClassName={(player) => `userlist-item ${presence(player)}`}
                    renderItem={(player) => (
                        <>
                            <span className="userlist-dot" aria-hidden="true" />
                            <span className="userlist-name">
                                {player.name}
                                {player.id === you && " (you)"}
                            </span>
                            {player.role && (
                                <span className="userlist-role">
                                    <span className="sr-only">, </span>
                                    {player.role}
                                </span>
                            )}
                            <span className="userlist-presence">
                                <span className="sr-only">, </span>
                                {presenceText(player, now)}
                            </span>
                        </>
                    )}
                />
            )}
            {selected && (
                <PlayerCard player={selected} isYou={selected.id === you} now={now} menu={menu} client={client} />
            )}
        </div>
    );
};

export default Userlist;
