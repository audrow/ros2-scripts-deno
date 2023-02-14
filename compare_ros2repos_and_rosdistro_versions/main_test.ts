import { compareRos2ReposAndRosdistroVersions } from "./main.ts"

Deno.test("compareRos2ReposAndRosdistroVersions runs", async () => {
  await compareRos2ReposAndRosdistroVersions("humble")
})
