import { Link } from 'react-router-dom';

interface Props {
  className?: string;
}

const NavTitle = ({ className }: Props) => (
  <Link to="/">
    <h1
      className={`text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-700 text-transparent bg-clip-text w-fit ${className}`}
    >
      CROSSABLE
    </h1>
  </Link>
);

export default NavTitle;
