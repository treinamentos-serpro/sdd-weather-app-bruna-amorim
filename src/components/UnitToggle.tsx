import type { KeyboardEvent } from 'react';
import { useRef } from 'react';

import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Array<{ label: string; value: Unit }> = [
  { label: '°C', value: 'celsius' },
  { label: '°F', value: 'fahrenheit' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectUnit(value: Unit, position: number) {
    onChange(value);
    buttonRefs.current[position]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const activeIndex = Math.max(
      units.findIndex((item) => item.value === unit),
      0,
    );
    const nextIndex = (activeIndex + 1) % units.length;
    const previousIndex = (activeIndex - 1 + units.length) % units.length;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectUnit(units[nextIndex].value, nextIndex);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectUnit(units[previousIndex].value, previousIndex);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      selectUnit(units[0].value, 0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      selectUnit(units[units.length - 1].value, units.length - 1);
    }
  }

  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
      role="group"
    >
      {units.map((item, position) => {
        const isActive = item.value === unit;

        return (
          <button
            aria-pressed={isActive}
            className={`min-h-11 min-w-14 rounded-xl px-4 py-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 ${
              isActive
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            key={item.value}
            onClick={() => selectUnit(item.value, position)}
            onKeyDown={handleKeyDown}
            ref={(element) => {
              buttonRefs.current[position] = element;
            }}
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
