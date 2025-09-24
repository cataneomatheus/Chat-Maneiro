type OnlineBadgeProps = {
  users: string[];
};

const OnlineBadge = ({ users }: OnlineBadgeProps) => {
  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-100 ring-1 ring-slate-700">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        {users.length} online
      </div>
      {users.length > 0 ? (
        <p className="max-w-xs text-xs text-slate-400">
          {users.join(', ')}
        </p>
      ) : (
        <p className="text-xs text-slate-500">Aguardando usuarios...</p>
      )}
    </div>
  );
};

export default OnlineBadge;
