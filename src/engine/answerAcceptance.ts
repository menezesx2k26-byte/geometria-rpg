export function isAcceptedOption(
  selectedId: string | undefined,
  canonicalId: string,
  acceptedAlternativeIds: readonly string[] = [],
) {
  return Boolean(selectedId && (selectedId === canonicalId || acceptedAlternativeIds.includes(selectedId)));
}

export function sameMembers(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) return false;
  const counts = new Map<string, number>();
  for (const value of left) counts.set(value, (counts.get(value) ?? 0) + 1);
  for (const value of right) {
    const count = counts.get(value) ?? 0;
    if (count <= 0) return false;
    if (count === 1) counts.delete(value);
    else counts.set(value, count - 1);
  }
  return counts.size === 0;
}

export function matchesUnorderedGroups(selectedIds: readonly string[], groups: readonly (readonly string[])[]) {
  const total = groups.reduce((sum, group) => sum + group.length, 0);
  if (selectedIds.length !== total || groups.some((group) => group.length === 0)) return false;
  const match = (offset: number, remaining: readonly (readonly string[])[]): boolean => {
    if (!remaining.length) return offset === selectedIds.length;
    return remaining.some((group, index) => {
      const candidate = selectedIds.slice(offset, offset + group.length);
      if (!sameMembers(candidate, group)) return false;
      return match(offset + group.length, [...remaining.slice(0, index), ...remaining.slice(index + 1)]);
    });
  };
  return match(0, groups);
}

const journeyAlternatives: Readonly<Record<string, readonly string[]>> = {
  'choose-distances': ['distance-all'],
};

export function acceptedJourneyOptionIds(stageId: string) {
  return journeyAlternatives[stageId] ?? [];
}
