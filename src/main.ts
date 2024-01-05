import { IDLIX } from "./idlix";

(async () => {
  const idlix = new IDLIX();
  const res1 = await idlix.search("longing");
  res1.data.items?.forEach(async (m) => {
    const res2 = await idlix.details(m.id);
    console.log(res2);
  });
})();
