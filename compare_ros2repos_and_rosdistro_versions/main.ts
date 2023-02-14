import { z } from "https://deno.land/x/zod@v3.20.2/mod.ts"
import { parse as parseYaml } from "https://deno.land/std@0.177.0/encoding/yaml.ts"
import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts"

const ros2ReposToSkip = [
  "system_tests",
]

const ros2ReposToRosDistroKeyMap: { [repoName: string]: string } = {
  "Fast-DDS": "fastrtps",
  "Fast-CDR": "fastcdr",
  "ros_tutorials": "turtlesim",
}

const Distro = z.enum([
  "dashing",
  "eloquent",
  "foxy",
  "galactic",
  "humble",
])
type Distro = z.infer<typeof Distro>

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
})
const Ros2Repos = z.object({
  repositories: z.record(
    z.object({
      type: z.string(),
      url: z.string().url(),
      version: z.string(),
    }),
  ),
})

export async function compareRos2ReposAndRosdistroVersions(
  distro: Distro,
  ros2RepoUrl?: string,
) {
  // Create URLs
  const rosDistroUrl =
    `https://raw.githubusercontent.com/ros/rosdistro/master/${distro}/distribution.yaml`
  ros2RepoUrl = ros2RepoUrl ??
    `https://raw.githubusercontent.com/ros2/ros2/${distro}-release/ros2.repos`

  // Use URLs to fetch files and convert file contents into objects
  const rosDistroFile = await fetch(rosDistroUrl).then((res) => res.text())
  const ros2RepoFile = await fetch(ros2RepoUrl).then((res) => res.text())
  const rosDistro = RosDistro.parse(parseYaml(rosDistroFile), {
    path: [rosDistroUrl],
  })
  const ros2Repos = Ros2Repos.parse(parseYaml(ros2RepoFile), {
    path: [ros2RepoUrl],
  })

  // Printout the comparison results
  console.log(`Comparing versions for ${distro}...`)
  const reposWithNoMatchingKey: string[] = []
  const skippedRepos: string[] = []
  Object.entries(ros2Repos.repositories).forEach(([name, repo]) => {
    const repoName = name.split("/")[1]
    if (ros2ReposToSkip.includes(repoName)) {
      skippedRepos.push(repoName)
      return
    }

    const rosDistroRepoName = ros2ReposToRosDistroKeyMap[repoName] ?? repoName

    let ros2ReposVersion = repo.version
    if (ros2ReposVersion?.startsWith("v")) {
      ros2ReposVersion = ros2ReposVersion.slice(1)
    }
    const rosdistroVersion =
      rosDistro.repositories[rosDistroRepoName]?.release?.version?.split(
        "-",
      )[0]

    if (!rosdistroVersion) {
      reposWithNoMatchingKey.push(repoName)
    } else if (ros2ReposVersion !== rosdistroVersion) {
      console.log(
        ` - ${repoName} has a version mismatch:\n\t${rosdistroVersion} (rosdistro)\t!==\t${ros2ReposVersion} (ros2.repos)`,
      )
    }
  })
  if (skippedRepos.length) {
    console.log(
      `\nSkipped the following repos:`,
    )
    skippedRepos.forEach((repo) => console.log(` - ${repo}`))
  }

  if (reposWithNoMatchingKey.length) {
    console.log(
      "\nKeys for the following repos could not be matched- they probably don't have the same key in the ros2.repos file and in the rosdistro file:",
    )
    reposWithNoMatchingKey.forEach((repo) => console.log(` - ${repo}`))
    console.log("\nHere are the URLs to the rosdistro and ros2.repos files:")
    console.log(` - rosdistro:  ${rosDistroUrl}`)
    console.log(` - ros2.repos: ${ros2RepoUrl}`)
  }
}

if (import.meta.main) {
  new Command()
    .name("compare_ros2repos_and_rosdistro_versions")
    .version("1.0.0")
    .description(
      "Compare the versions of the ros2.repos file and the rosdistro.",
    )
    .option(
      "-r, --ros2-repos-url <ros2ReposUrl:string>",
      "The url to the ros2.repos file.",
    )
    .arguments("<distro:string>")
    .action(({ ros2ReposUrl }, ...args) => {
      const distro = Distro.parse(args[0])
      compareRos2ReposAndRosdistroVersions(distro, ros2ReposUrl)
    })
    .parse()
}
