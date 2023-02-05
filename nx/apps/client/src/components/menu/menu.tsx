import { useCallback, useState } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';

interface Props {
  children: React.ReactNode;
}

function Menu({ children }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  return (
    <div className="relative">
      <button className="btn btn-borderless" onClick={toggleOpen}>
        <GiHamburgerMenu />
      </button>
      {isOpen && (
        <ul className="absolute bg-slate-600 py-4 rounded-lg right-4 top-10 w-60">
          {children}
        </ul>
      )}
    </div>
  );
}

export default Menu;
