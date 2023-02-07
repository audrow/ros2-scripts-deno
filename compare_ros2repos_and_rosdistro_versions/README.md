# README

This package compares the versions of packages in a rosdistro with the versions
of packages in a ros2.repos file.

## Setup

You'll need to
[install Deno](https://deno.land/manual@v1.30.3/getting_started/installation).

## Usage

You can run this program with the following command:

```bash
deno run --allow-net --lock ./deno.lock main.ts <distro> # where distro is humble, foxy, etc.
```

The lock file tells Deno to use the exact versions of the dependencies that were
used when this program was last run. You may be able to run the program without
the lock file, but it's not guaranteed to work.

`--allow-net` is required because this program makes HTTP requests to GitHub to
download the latest ROS 2 repos file and Rosdistro file.
