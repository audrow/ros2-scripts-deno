import { z } from "https://deno.land/x/zod@v3.20.2/mod.ts";
import { parse as parseYaml } from "https://deno.land/std@0.177.0/encoding/yaml.ts";

const Distro = z.enum([
  "dashing",
  "eloquent",
  "foxy",
  "galactic",
  "humble",
  "rolling",
]);
type Distro = z.infer<typeof Distro>;

const RosDistro = z.object({
  repositories: z.record(
    z.object({
      release: z
        .object({
          version: z.string().optional(),
        })
        .optional(),
    }),
  ),
});
const Ros2Repos = z.object({
  repositories: z.record(
    z.object({
      type: z.string(),
      url: z.string().url(),
      version: z.string(),
    }),
  ),
});

export async function compareRos2ReposAndRosdistroVersions(distro: Distro) {
  const rosDistroUrl =
    `https://raw.githubusercontent.com/ros/rosdistro/master/${distro}/distribution.yaml`;
  const ros2RepoUrl =
    `https://raw.githubusercontent.com/ros2/ros2/${distro}-release/ros2.repos`;

  // get file contents
  const rosDistroFile = await fetch(rosDistroUrl).then((res) => res.text());
  const ros2RepoFile = await fetch(ros2RepoUrl).then((res) => res.text());
  const rosDistro = RosDistro.parse(parseYaml(rosDistroFile));
  const ros2Repos = Ros2Repos.parse(parseYaml(ros2RepoFile));

  console.log(`Comparing versions for ${distro}...`);
  const skippedRepos: string[] = [];
  Object.entries(ros2Repos.repositories).forEach(([name, repo]) => {
    const repoName = name.split("/")[1];

    let ros2ReposVersion = repo.version;
    if (ros2ReposVersion?.startsWith("v")) {
      ros2ReposVersion = ros2ReposVersion.slice(1);
    }
    const rosdistroVersion =
      rosDistro.repositories[repoName]?.release?.version?.split("-")[0];

    if (!rosdistroVersion) {
      skippedRepos.push(repoName);
    } else if (ros2ReposVersion !== rosdistroVersion) {
      console.log(
        ` - ${repoName} has a version mismatch:\n\t${rosdistroVersion} (rosdistro)\t!==\t${ros2ReposVersion} (ros2.repos)`,
      );
    }
  });

  if (skippedRepos.length) {
    console.log(
      "\nThe following repos were skipped - they probably don't have the same key in the ros2.repos file and in the rosdistro file:",
    );
    skippedRepos.forEach((repo) => console.log(` - ${repo}`));
    console.log("\nHere are the URLs to the rosdistro and ros2.repos files:");
    console.log(` - rosdistro:  ${rosDistroUrl}`);
    console.log(` - ros2.repos: ${ros2RepoUrl}`);
  }
}

if (import.meta.main) {
  const args = Deno.args;
  if (args.length < 1 || args.includes("-h") || args.includes("--help")) {
    console.log(`Usage: deno run --allow-net main.ts <rosdistro>`);
    Deno.exit(0);
  }
  const distro = Distro.parse(args[0]);
  compareRos2ReposAndRosdistroVersions(distro);
}
