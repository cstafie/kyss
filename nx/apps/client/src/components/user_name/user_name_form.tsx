import { FormEvent, SyntheticEvent, useCallback, useRef } from 'react';
import { useAuthContext } from '../../contexts/auth';

const MAX_PLAYER_NAME_LENGTH = 12;

// TODO: this is gross
// https://felixgerschau.com/react-typescript-onfocus-event-type/
interface FocusEvent<T = Element> extends SyntheticEvent<T> {
  relatedTarget: EventTarget | null;
  target: EventTarget & T;
}

interface Props {
  className?: string;
  onSubmit?: () => void;
}

function UserNameForm({ className, onSubmit }: Props) {
  const { setName } = useAuthContext();

  const userName = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const value = userName?.current?.value;

      // TODO: better validation
      if (value && value.toLocaleLowerCase() !== 'you') {
        setName(value);
        onSubmit && onSubmit();

        // TODO: this is a bit faux pas
        window.location.reload();
      }
    },
    [setName, onSubmit]
  );

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target?.select();
  }, []);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        ref={userName}
        className="text-black p-1 h-6 w-36 rounded-md text-sm"
        autoFocus
        placeholder="Enter user name..."
        onFocus={handleFocus}
        maxLength={MAX_PLAYER_NAME_LENGTH}
      />
      <button type="submit" className="btn btn-blue btn-sm">
        OK
      </button>
    </form>
  );
}

export default UserNameForm;
