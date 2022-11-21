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

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();

    const value = userName?.current?.value;

    // TODO: better validation
    if (value && value.toLocaleLowerCase() !== 'you') {
      setName(value);
      setEditing(false);

      // TODO: this is a bit faux pas
      window.location.reload();
    }
  }, []);

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target?.select();
  }, []);

  return (
    <button onClick={() => setEditing(true)} className="flex">
      {editing ? (
        <form onSubmit={handleSubmit}>
          <input
            ref={userName}
            className="text-black"
            autoFocus
            onFocus={handleFocus}
            maxLength={MAX_PLAYER_NAME_LENGTH}
          />
          <button type="submit" className="btn btn-blue">
            OK
          </button>
        </form>
      ) : (
        <>
          {user.name}
          {pencilEmoji}
        </>
      )}
    </button>
  );
};

export default UserName;
