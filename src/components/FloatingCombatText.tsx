import { useEffect, useRef, useState } from "react";
import { COMBAT_TIMING } from "../game/timing";

interface FloatingCombatTextProps {
  events: string[];
  eventId: number;
  onEventShown: (eventId: number, eventIndex: number) => void;
  onSequenceComplete: (eventId: number) => void;
}

export function FloatingCombatText({ events, eventId, onEventShown, onSequenceComplete }: FloatingCombatTextProps) {
  const [index, setIndex] = useState(0);
  const eventCallback = useRef(onEventShown);
  const completeCallback = useRef(onSequenceComplete);

  useEffect(() => { eventCallback.current = onEventShown; }, [onEventShown]);
  useEffect(() => { completeCallback.current = onSequenceComplete; }, [onSequenceComplete]);
  useEffect(() => {
    if (events.length === 0 || index >= events.length - 1) return;
    const timer = window.setTimeout(() => setIndex((current) => current + 1), COMBAT_TIMING.floatingMessageMs);
    return () => window.clearTimeout(timer);
  }, [events, eventId, index]);
  useEffect(() => {
    if (events.length === 0 || index !== events.length - 1) return;
    const timer = window.setTimeout(() => completeCallback.current(eventId), COMBAT_TIMING.floatingMessageMs);
    return () => window.clearTimeout(timer);
  }, [eventId, events.length, index]);

  const message = events[index];
  useEffect(() => {
    if (message) eventCallback.current(eventId, index);
  }, [eventId, index, message]);
  if (!message) return null;
  const tone = /damage|fallen/i.test(message) ? "damage" : /gain|reclaim|turn|victory/i.test(message) ? "positive" : "neutral";
  return <div className={`floating-combat-text ${tone}`} aria-live="polite"><span key={`${eventId}-${index}`} style={{ animationDuration: `${COMBAT_TIMING.floatingMessageMs}ms` }}>{message}</span></div>;
}
