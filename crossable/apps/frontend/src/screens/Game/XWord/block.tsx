interface Props {
  isGameDone: boolean;
}

const Block = ({ isGameDone }: Props) => (
  <div
    className={`bg-black flex justify-center items-center ${
      isGameDone ? 'rainbow' : ''
    }`}
  ></div>
);

export default Block;
