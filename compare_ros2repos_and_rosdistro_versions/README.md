# README

This package compares the versions of packages in a rosdistro with the versions
of packages in a ros2.repos file.

## Setup

You can clone this repository or run this script from a
[Github Codespace](https://github.com/features/codespaces) (Audrow's preferred
way). In either case, you'll need to
[install Deno](https://deno.land/manual@v1.30.3/getting_started/installation).

## Usage

You can run this program with the following command:

```bash
# cd into this directory
deno run --allow-net --lock ./deno.lock main.ts <distro> # where distro is humble, foxy, etc.
```

Note that you can also run this program without cloning the repository by
pointing Deno to the URL of the file:

```bash
deno run --allow-net https://raw.githubusercontent.com/audrow/ros2-scripts-deno/main/compare_ros2repos_and_rosdistro_versions/main.ts <distro>
```

Running this program should output something like the following:

```text
Comparing versions for humble...
 - Fast-DDS has a version mismatch:
        2.6.4 (rosdistro)       !==     2.6.2 (ros2.repos)
 - osrf_pycommon has a version mismatch:
        2.0.2 (rosdistro)       !==     2.1.1 (ros2.repos)

Skipped the following repos:
 - system_tests
```

The lock file tells Deno to use the exact versions of the dependencies that were
used when this program was last run. You may be able to run the program without
the lock file, but it's not guaranteed to work.

`--allow-net` is required because this program makes HTTP requests to GitHub to
download the latest ROS 2 repos file and Rosdistro file.
