/**
 * Minimal ZIP writer using the store method (no compression).
 * Enough for exporting a handful of UTF-8 text files from the browser.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
    table[i] = crc >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]!) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { time: number; day: number } {
  const year = Math.max(1980, date.getFullYear());
  const time =
    ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((date.getSeconds() / 2) & 0x1f);
  const day =
    (((year - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f);
  return { time, day };
}

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

export type ZipEntry = {
  path: string;
  content: string;
};

/**
 * Build an uncompressed ZIP as a Blob. Paths must be relative and use `/`.
 */
export function buildStoreZip(entries: ZipEntry[], modifiedAt: Date = new Date()): Blob {
  const encoder = new TextEncoder();
  const { time, day } = dosDateTime(modifiedAt);
  const prepared = entries.map((entry) => {
    const nameBytes = encoder.encode(entry.path.replace(/\\/g, "/"));
    const data = encoder.encode(entry.content);
    return { nameBytes, data, crc: crc32(data) };
  });

  let localSize = 0;
  let centralSize = 0;
  for (const file of prepared) {
    localSize += 30 + file.nameBytes.length + file.data.length;
    centralSize += 46 + file.nameBytes.length;
  }
  const total = localSize + centralSize + 22;
  const buffer = new ArrayBuffer(total);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;
  const localOffsets: number[] = [];

  for (const file of prepared) {
    localOffsets.push(offset);
    writeUint32(view, offset, 0x04034b50);
    writeUint16(view, offset + 4, 20);
    writeUint16(view, offset + 6, 0);
    writeUint16(view, offset + 8, 0);
    writeUint16(view, offset + 10, time);
    writeUint16(view, offset + 12, day);
    writeUint32(view, offset + 14, file.crc);
    writeUint32(view, offset + 18, file.data.length);
    writeUint32(view, offset + 22, file.data.length);
    writeUint16(view, offset + 26, file.nameBytes.length);
    writeUint16(view, offset + 28, 0);
    bytes.set(file.nameBytes, offset + 30);
    bytes.set(file.data, offset + 30 + file.nameBytes.length);
    offset += 30 + file.nameBytes.length + file.data.length;
  }

  const centralStart = offset;
  for (let i = 0; i < prepared.length; i += 1) {
    const file = prepared[i]!;
    writeUint32(view, offset, 0x02014b50);
    writeUint16(view, offset + 4, 20);
    writeUint16(view, offset + 6, 20);
    writeUint16(view, offset + 8, 0);
    writeUint16(view, offset + 10, 0);
    writeUint16(view, offset + 12, time);
    writeUint16(view, offset + 14, day);
    writeUint32(view, offset + 16, file.crc);
    writeUint32(view, offset + 20, file.data.length);
    writeUint32(view, offset + 24, file.data.length);
    writeUint16(view, offset + 28, file.nameBytes.length);
    writeUint16(view, offset + 30, 0);
    writeUint16(view, offset + 32, 0);
    writeUint16(view, offset + 34, 0);
    writeUint16(view, offset + 36, 0);
    writeUint32(view, offset + 38, 0);
    writeUint32(view, offset + 42, localOffsets[i]!);
    bytes.set(file.nameBytes, offset + 46);
    offset += 46 + file.nameBytes.length;
  }

  writeUint32(view, offset, 0x06054b50);
  writeUint16(view, offset + 4, 0);
  writeUint16(view, offset + 6, 0);
  writeUint16(view, offset + 8, prepared.length);
  writeUint16(view, offset + 10, prepared.length);
  writeUint32(view, offset + 12, centralSize);
  writeUint32(view, offset + 16, centralStart);
  writeUint16(view, offset + 20, 0);

  return new Blob([buffer], { type: "application/zip" });
}
