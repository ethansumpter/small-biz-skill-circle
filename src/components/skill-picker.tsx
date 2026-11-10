import { SKILL_GROUPS } from '@/lib/businesses';
import { Button } from '@/components/ui/button';
export function SkillPicker({ selected, onChange }: { selected: string[]; onChange: (skills: string[]) => void }) {
  return <div className="space-y-4">{SKILL_GROUPS.map((group) => <div key={group.name}><span className="label">{group.name}</span><div className="flex flex-wrap gap-1">{group.skills.map((skill) => <Button key={skill} variant={selected.includes(skill) ? 'secondary' : 'outline'} size="sm" aria-pressed={selected.includes(skill)} className="h-auto whitespace-normal text-left" onClick={() => onChange(selected.includes(skill) ? selected.filter((s) => s !== skill) : [...selected, skill])}>{skill}</Button>)}</div></div>)}</div>;
}
