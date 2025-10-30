import {
  type FormEvent,
  type SyntheticEvent,
  useCallback,
  useRef,
} from "react";
import { useUser } from "@/contexts/user";
import Button from "../button";

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
  const { setName } = useUser();

  const userName = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const value = userName?.current?.value;

      // TODO: better validation
      if (value && value.toLocaleLowerCase() !== "you") {
        setName(value);
        onSubmit?.();
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
        className="text-white p-2 h-6 w-36 rounded-md text-sm bg-black border border-white focus:border-blue-500 focus:outline-none"
        autoFocus
        placeholder="Enter user name..."
        onFocus={handleFocus}
        maxLength={MAX_PLAYER_NAME_LENGTH}
      />
      <Button type="submit" className="btn-sm btn-blue">
        OK
      </Button>
    </form>
  );
}

export default UserNameForm;
