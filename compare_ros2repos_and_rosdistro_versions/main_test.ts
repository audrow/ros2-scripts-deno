import { compareRos2ReposAndRosDistroVersions } from "./main.ts";

Deno.test("compareRos2ReposAndRosDistroVersions runs", async () => {
  await compareRos2ReposAndRosDistroVersions({ distro: "humble" });
});
