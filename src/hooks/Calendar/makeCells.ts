import { useMemo } from "react";


type UseMakeCellsProps = {
  year: number;
  monthIndex: number;
};

export function useMakeCells({ year, monthIndex }: UseMakeCellsProps) {
  const daysInMonth = useMemo(
    () => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate(),
    [year, monthIndex]
  );
  const firstOfMonthUTC = useMemo(
    () => new Date(Date.UTC(year, monthIndex, 1)),
    [year, monthIndex]
  );
  const leadingBlanks = useMemo(() => {
    const sun0 = firstOfMonthUTC.getUTCDay();
    return (sun0 + 6) % 7; // Mon-first
  }, [firstOfMonthUTC]);
  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < leadingBlanks; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [leadingBlanks, daysInMonth]);
  return cells;
}
