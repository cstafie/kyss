interface Props {
  description: string;
  children: string; // the emoji
}

function Emoji({ description, children }: Props) {
  return (
    <span role="img" aria-label={description}>
      {children}
    </span>
  );
}

export default Emoji;
