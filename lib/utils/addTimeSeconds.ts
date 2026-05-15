import type { AddTimeButtonValue } from "@/lib/utils/timerHelpers";

const ADD_TIME_MAP: Record<AddTimeButtonValue, number> = {
  "5s": 5,
  "10s": 10,
  "30s": 30,
  "1m": 60,
};

export function addTimeButtonToSeconds(value: AddTimeButtonValue): number {
  return ADD_TIME_MAP[value];
}
