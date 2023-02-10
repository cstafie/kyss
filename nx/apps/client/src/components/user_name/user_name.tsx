import { useState } from 'react';
import { useAuthContext } from '../../contexts/auth';
import Emoji from '../emoji';
import UserNameForm from './user_name_form';

const pencilEmoji = '✏️';

const UserName = () => {
  const { user } = useAuthContext();

  const [editing, setEditing] = useState(false);

  const className = 'flex justify-end items-center gap-2';

  return editing ? (
    <UserNameForm className={className} onSubmit={() => setEditing(false)} />
  ) : (
    <section className={className}>
      <button
        onClick={() => setEditing(true)}
        className="btn btn-borderless flex gap-2 whitespace-nowrap"
      >
        <Emoji description="Pencil">{pencilEmoji}</Emoji>
        <div>{user.name}</div>
      </button>
    </section>
  );
};

export default UserName;
