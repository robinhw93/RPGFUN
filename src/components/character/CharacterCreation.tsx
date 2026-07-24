import {
  ChevronRight,
  Skull,
  UserRound
} from "lucide-react";
import { useState } from "react";
import type { CharacterAvatarId } from "../../game/avatars";
import { CHARACTER_AVATARS, DEFAULT_CHARACTER_AVATAR_ID } from "../../game/avatars";

export function CharacterCreation({ onCreate }: { onCreate: (name: string, avatarId: CharacterAvatarId) => void }) {
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<CharacterAvatarId>(DEFAULT_CHARACTER_AVATAR_ID);
  const trimmedName = name.trim();
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmedName) onCreate(trimmedName, avatarId);
  };
  return (
    <main className="character-creation">
      <section className="creation-card">
        <div className="creation-sigil"><UserRound size={28} /></div>
        <p className="eyebrow">A New Chronicle</p>
        <h1>Create Your Character</h1>
        <p>Choose the wanderer who will brave Arkenfall. This journey uses permadeath: if your character falls, their progress and possessions are lost.</p>
        <form onSubmit={submit}>
          <fieldset className="avatar-picker">
            <legend>Choose appearance</legend>
            <div className="avatar-options">
              {CHARACTER_AVATARS.map((avatar) => (
                <label className={`avatar-option ${avatar.id === avatarId ? "selected" : ""}`} key={avatar.id}>
                  <input
                    type="radio"
                    name="character-avatar"
                    value={avatar.id}
                    checked={avatar.id === avatarId}
                    onChange={() => setAvatarId(avatar.id)}
                    aria-label={avatar.label}
                  />
                  <span className="avatar-option-image"><img src={avatar.imageUrl} alt="" loading={avatar.id === avatarId ? "eager" : "lazy"} decoding="async" draggable={false} /></span>
                  <span className="avatar-option-check" aria-hidden="true">✓</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="creation-name-field">
            <label htmlFor="character-name">Character name</label>
            <input
              id="character-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              autoComplete="off"
              placeholder="Enter a name"
            />
            <small>{name.length}/24</small>
          </div>
          <button className="primary-button" type="submit" disabled={!trimmedName}>Begin Chronicle <ChevronRight size={17} /></button>
        </form>
        <div className="permadeath-warning"><Skull size={16} /><span>Permadeath - Your character is erased when it dies.</span></div>
      </section>
    </main>
  );
}
