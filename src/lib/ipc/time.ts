/// User's local day as YYYY-MM-DD. Lives in the frontend because the Rust
/// process's timezone isn't reliable on multithreaded Linux.
export function todayLocal(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
