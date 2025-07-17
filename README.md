# holidays-jp-gen

`holidays-jp-gen` は、日本の祝日データ（内閣府提供のCSV）を元に、  
指定年以降の祝日を抽出し、軽量なTypeScriptモジュールファイルを自動生成するCLIツールです。

## 特長

- 内閣府の公式CSVデータを自動ダウンロード・解析
- 指定年から最新までの祝日だけを含む軽量モジュール生成
- TypeScript対応でフロント/サーバサイドどちらでも利用可能
- 祝日判定ロジックを含むかシンプルな日付配列のみか選択可能

## 使い方

```bash
npx holidays-jp-gen --year 2020
```

上記コマンドで `holidays-jp-from-2020.ts` ファイルが生成されます。

### オプション

- `--year <year>` : 祝日データの開始年を指定（デフォルト: 1955 ※データ上一番古い年）
- `--output <path>` : 出力ファイルパス（デフォルト：`holidays-jp-from-<year>.ts`）

## 生成されるファイル例

```ts
// holidays-jp-from-2020.ts
export const holidays = [
  { date: '2020-01-01', name: '元日' },
  { date: '2020-01-13', name: '成人の日' },
  // ...
];
```

## 生成されたモジュールの利用方法

### `isHoliday(date: Date | string): boolean`

指定された日付が日本の祝日であるかどうかを判定します。

- `date`: 判定する日付 (`Date` オブジェクトまたは `'YYYY-MM-DD'` 形式の文字列)。

**戻り値**: 祝日であれば `true`、そうでなければ `false`。

**例**:

```ts
import { isHoliday } from './holidays-jp-from-2020';

console.log(isHoliday('2025-01-01')); // true (元日)
console.log(isHoliday(new Date('2025-01-02'))); // false
```

### `getHolidayName(date: Date | string): string | null`

指定された日付の祝日名を取得します。

- `date`: 祝日名を取得する日付 (`Date` オブジェクトまたは `'YYYY-MM-DD'` 形式の文字列)。

**戻り値**: 祝日名。祝日でない場合は `null`。

**例**:

```ts
import { getHolidayName } from './holidays-jp-from-2020';

console.log(getHolidayName('2025-01-01')); // "元日"
console.log(getHolidayName(new Date('2025-05-05'))); // "こどもの日"
console.log(getHolidayName('2025-01-02')); // null
```

## 注意事項

このツールは内閣府提供のオープンデータを利用していますが、  
ツール自体は非公式の個人製作ソフトウェアです。

## ライセンス

MIT License

## 開発者

momo-lab (<momotaro.n@gmail.com>)
