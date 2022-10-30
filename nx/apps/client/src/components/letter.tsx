interface Props {
  char: string;
}

const Letter = ({ char }: Props) => (
  <div className="bg-white flex justify-center items-center font-bold">
    {char}
  </div>
);

export default Letter;
