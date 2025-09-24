type TypingIndicatorProps = {
  users: string[];
  currentUser: string;
};

const TypingIndicator = ({ users, currentUser }: TypingIndicatorProps) => {
  const others = users.filter((user) => user !== currentUser);

  if (others.length === 0) {
    return null;
  }

  const [first, ...rest] = others;
  const message =
    rest.length === 0
      ? `${first} esta digitando...`
      : `${first} e mais ${rest.length} pessoa(s) estao digitando...`;

  return (
    <div className="mt-3 text-sm text-slate-400" role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default TypingIndicator;
