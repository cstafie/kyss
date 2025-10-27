import { useMemo, useState } from "react";
import { useUser } from "@/contexts/user";
import Emoji from "../emoji";
import UserNameForm from "./user_name_form";
import Button from "../button";
import { useLocation } from "react-router-dom";

const PENCIL_EMOJI = "✏️";

const UserName = () => {
  const { name } = useUser();
  const [editing, setEditing] = useState(false);
  const location = useLocation();

  const disabled = useMemo(() => {
    return location.pathname.split("/").includes("xword");
  }, [location.pathname]);

  return editing ? (
    <UserNameForm
      className="flex justify-end items-center gap-2"
      onSubmit={() => setEditing(false)}
    />
  ) : (
    <Button
      onClick={() => setEditing(true)}
      className="flex gap-2 btn-blue btn-transparent"
      disabled={disabled}
    >
      <Emoji description="Pencil">{PENCIL_EMOJI}</Emoji>
      <div>{name}</div>
    </Button>
  );
};

export default UserName;
