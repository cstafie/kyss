import {
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useCallback,
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

  const [value, setValue] = useState(user.name);
  const [editing, setEditing] = useState(false);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      // TODO: better validation
      if (value) {
        setName(value);
        setEditing(false);
      }
    },
    [value]
  );

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target?.select();
  }, []);

  const handleOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  return (
    <div onClick={() => setEditing(true)} className="flex">
      {editing ? (
        <form onSubmit={handleSubmit}>
          <input
            className="text-black"
            autoFocus
            onFocus={handleFocus}
            onChange={handleOnChange}
            value={value}
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
    </div>
  );
};

export default UserName;
