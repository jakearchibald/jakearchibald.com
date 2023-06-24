import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';

type UsePhasesReturn<Phases extends readonly string[]> = [
  phase: Phases[number],
  lastPhase: Phases[number],
  setTargetPhase: (phase: Phases[number]) => void,
  phaseChangeHandled: () => void,
];

export default function usePhases<Phases extends readonly string[]>(
  phases: Phases,
  initialPhase: Phases[number] = phases[0],
): UsePhasesReturn<Phases> {
  const [phase, setPhase] = useState<Phases[number]>(initialPhase);
  const phaseIndexes = useMemo(
    () => Object.fromEntries(phases.map((val, i) => [val, i])),
    [],
  );

  const renderedPhase = useRef<Phases[number]>(initialPhase);
  const targetPhase = useRef<Phases[number]>(initialPhase);
  const handlingPhaseChange = useRef<boolean>(false);

  useLayoutEffect(() => {
    renderedPhase.current = phase;
  }, [phase]);

  const setTargetPhase = (phase: Phases[number]) => {
    targetPhase.current = phase;
    if (!handlingPhaseChange.current) phaseChangeHandled();
  };

  const phaseChangeHandled = () => {
    if (targetPhase.current === renderedPhase.current) {
      handlingPhaseChange.current = false;
      return;
    }

    handlingPhaseChange.current = true;
    const currentIndex = phaseIndexes[renderedPhase.current];
    const targetIndex = phaseIndexes[targetPhase.current];
    const nextPhase =
      phases[targetIndex > currentIndex ? currentIndex + 1 : currentIndex - 1];

    setPhase(nextPhase);
  };

  return [phase, renderedPhase.current, setTargetPhase, phaseChangeHandled];
}
