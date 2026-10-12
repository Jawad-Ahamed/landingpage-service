// An icon from the shared sprite (content/home/sprite.svg), e.g. <Icon name="check" />.
export default function Icon({ name, className }: { name: string; className?: string }) {
  return <svg className={className} aria-hidden="true"><use href={`#i-${name}`} /></svg>;
}
