/**
 * Nexus Snowflake ID Generator
 * A distributed unique ID generator that produces 64-bit BigInts.
 * 
 * Bit Layout:
 * 1 bit sign | 41 bits timestamp | 10 bits machine id | 12 bits sequence
 */

export class Snowflake {
  private static readonly EPOCH = BigInt(new Date('2026-01-01T00:00:00Z').getTime());
  private static readonly MACHINE_BITS = 10n;
  private static readonly SEQUENCE_BITS = 12n;
  
  private static readonly MAX_MACHINE_ID = (1n << Snowflake.MACHINE_BITS) - 1n;
  private static readonly MAX_SEQUENCE = (1n << Snowflake.SEQUENCE_BITS) - 1n;
  
  private static readonly MACHINE_SHIFT = Snowflake.SEQUENCE_BITS;
  private static readonly TIMESTAMP_SHIFT = Snowflake.SEQUENCE_BITS + Snowflake.MACHINE_BITS;
  
  private lastTimestamp = -1n;
  private sequence = 0n;
  private machineId: bigint;

  constructor(machineId: number = 0) {
    if (machineId < 0 || BigInt(machineId) > Snowflake.MAX_MACHINE_ID) {
      throw new Error(`Machine ID must be between 0 and ${Snowflake.MAX_MACHINE_ID}`);
    }
    this.machineId = BigInt(machineId);
  }

  public nextId(): bigint {
    let timestamp = BigInt(Date.now());

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate ID.');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & Snowflake.MAX_SEQUENCE;
      if (this.sequence === 0n) {
        // Wait for next millisecond
        while (timestamp <= this.lastTimestamp) {
          timestamp = BigInt(Date.now());
        }
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    return (
      ((timestamp - Snowflake.EPOCH) << Snowflake.TIMESTAMP_SHIFT) |
      (this.machineId << Snowflake.MACHINE_SHIFT) |
      this.sequence
    );
  }
}

// Singleton for easier use in a serverless environment
const globalSnowflake = new Snowflake(parseInt(process.env.MACHINE_ID || '1'));
export default globalSnowflake;
