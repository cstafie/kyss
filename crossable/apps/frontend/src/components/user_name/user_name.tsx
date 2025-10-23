import { useState } from "react";
import { useUser } from "@/contexts/user";
import Emoji from "../emoji";
import UserNameForm from "./user_name_form";
import Button from "../button";

const pencilEmoji = "✏️";

const UserName = () => {
  const { user } = useUser();
  const [editing, setEditing] = useState(false);

  return editing ? (
    <UserNameForm
      className="flex justify-end items-center gap-2"
      onSubmit={() => setEditing(false)}
    />
  ) : (
    <Button onClick={() => setEditing(true)} className="flex gap-2 btn-blue">
      <Emoji description="Pencil">{pencilEmoji}</Emoji>
      <div>{user.name}</div>
    </Button>
  );
};

export default UserName;
