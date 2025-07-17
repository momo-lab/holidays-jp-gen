import { getHolidayName, isHoliday } from './holidays-jp.ts';

function test(date: string | Date): void {
  console.log(date, isHoliday(date), getHolidayName(date));
}

test('2024-01-01');
test('2024-01-02');
test(new Date(2024, 0, 1));
test(new Date(2024, 0, 2));
