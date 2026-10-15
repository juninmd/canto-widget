import { readmeLanguages, readmeNavigation, readmePath } from "./readme-languages";

for (const [code] of readmeLanguages) {
  const path = readmePath(code);
  const original = await Bun.file(path).text();
  const navigation = readmeNavigation(code);
  const block = /<sub>[^<]*README\.[^<]*<\/sub>/;
  const updated = block.test(original)
    ? original.replace(block, navigation)
    : original.replace("</div>", `${navigation}\n\n</div>`);
  await Bun.write(path, updated);
}
