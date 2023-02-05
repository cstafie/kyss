interface Props {
  children: React.ReactNode;
}

function MenuItem({ children }: Props) {
  return <li className="px-4 py-2 text-lg hover:bg-blue-500">{children}</li>;
}

export default MenuItem;
