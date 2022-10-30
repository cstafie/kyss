interface Props {
  char: string;
}

const Block = () => <div className="bg-black flex"></div>;

export const Square = ({ char }: Props) => {
  switch (char) {
    case '#':
      return <Block />;
    default:
      return null;
  }
};
