interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function MatchScore({ score, size = 'md' }: Props) {
  const getColor = () => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-accent-600 bg-accent-50 border-accent-200';
    return 'text-primary-600 bg-primary-50 border-primary-200';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-lg px-4 py-2 font-bold',
  };

  return (
    <span className={`rounded-full border font-semibold whitespace-nowrap ${getColor()} ${sizeClasses[size]}`}>
      {score}% match
    </span>
  );
}
