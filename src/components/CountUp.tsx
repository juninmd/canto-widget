import { CountUp as SonidoCountUp } from "@juninmd/sonido";

/** A number that runs up to its value when it first shows or changes; with less motion it is just the number. */
export default function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  return <SonidoCountUp value={value} format={format} />;
}
