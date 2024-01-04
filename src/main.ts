import {IDLIX} from "./idlix";

(async () => {
    const idlix = new IDLIX();
    const res = await idlix.search('oppenheimer');
    console.log(res.data);
})();