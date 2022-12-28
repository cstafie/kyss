import React, {
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useAuthContext } from '../contexts/auth';

const pencilEmoji = '✏️';

const MAX_PLAYER_NAME_LENGTH = 12;

// TODO: this is gross
// https://felixgerschau.com/react-typescript-onfocus-event-type/
interface FocusEvent<T = Element> extends SyntheticEvent<T> {
  relatedTarget: EventTarget | null;
  target: EventTarget & T;
}

const UserName = () => {
  const { user, setName } = useAuthContext();

  const userName = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const value = userName?.current?.value;

      // TODO: better validation
      if (value && value.toLocaleLowerCase() !== 'you') {
        setName(value);
        setEditing(false);

        // TODO: this is a bit faux pas
        window.location.reload();
      }
    },
    [setName]
  );

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target?.select();
  }, []);

  const className = 'flex justify-end items-center gap-2 w-full';

  return editing ? (
    <form onSubmit={handleSubmit} className={className}>
      <input
        ref={userName}
        className="text-black p-1 h-6 w-36 rounded-md text-sm"
        autoFocus
        placeholder="Enter username..."
        onFocus={handleFocus}
        maxLength={MAX_PLAYER_NAME_LENGTH}
      />
      <button type="submit" className="btn btn-transparent btn-sm">
        OK
      </button>
    </form>
  ) : (
    <section onClick={() => setEditing(true)} className={className}>
      <div>{user.name}</div>
      <div>{pencilEmoji}</div>
    </section>
  );
};

export default UserName;
