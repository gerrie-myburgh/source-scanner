# Source Scanner Version 2.0.0

## Motivation

The previous plugin **Source Scanner Version 1** extracted marked comment blocks and placed them in the vault as markdown file(s).

There were two problems with this approach:
1. The extracted comments went into the vault without a folder structure
2. The objective was to create a mechanism to document the application being worked on

This version enables the user to define the folder structure of the documentation. This is best illustrated by an example:

Suppose the document start folder in the vault is **docs** and you want to preserve information about the structure. You can define that one set of **docs** can contain more than one EPIC, each EPIC can contain more than one ITEM, and each ITEM can contain more than one TEST case.

The previous plugin used WASM for the actual parsing of text passed to it by JavaScript. This proved to be computationally expensive due to character encoding differences between WASM and JavaScript.

## Differences from Version 1

Version 1 of Source Scanner was specifically designed for C/C++/Rust/Java style comments in the source code and focused on extracting documentation comments (`/** ... */` and `//b ...`) to support agile methodology workflows. It created notes based on fully qualified class names and provided features for correlating extracted comments with user stories through marker systems. The primary goal was to help developers document business requirements directly in code comments and map them to agile user stories.

Version 2 represents an evolution with several key improvements. It generalizes the approach to work with any text files (not just source code) and introduces a flexible, user-defined folder hierarchy system (for example: EPIC.ITEM.TEST structure). Instead of WASM-based parsing that had performance issues due to character encoding differences, Version 2 uses Rust executables for more efficient text processing. The configuration is more comprehensive, allowing users to define start patterns, file extensions, and destination structures, making it a more versatile tool for organizing documentation from various source formats.

## Installation

The extraction of blocks is done using Rust-based executables. The zip file containing the executables is available at this [location](https://github.com/gerrie-myburgh/source-scanner/releases) on GitHub.

The source for the Rust program can be found on [GitHub](https://github.com/gerrie-myburgh/get-comments). Do not use the distribution in this git repository to try to make it work with the Obsidian release, as it might be a version ahead of what the current Obsidian release needs. However, you can use this executable if you want to run it only from the command line.

Download the zip file, extract its contents, and place the executable files in the ***source_scanner*** plugin vault configDir (this is typically `.obsidian` but can be different). The executable files are:

1. `get-comments-linux`
2. `get-comments-macos`
3. `get-comments.exe`

Make sure the downloaded executables are set as executable on your system after downloading and extracting them.

## General

Version 2 of the plugin scans text files and extracts blocks of lines that start with a specified pattern. This pattern can be something like `////`, `//\#`, or even a `.` (dot).

Once a block of marked lines is extracted, it is written to a file that is placed in the current vault. Multiple blocks can be placed in one file. These blocks must have a unique sequence number that determines their position in the file. This number must start from 1. For example: `[1]`, `[2]`, ...

## Configuration

The plugin allows the user to select whether to work with Version 1 or Version 2 of the code. This is done by presenting a dialog on startup that makes it possible to select the source scanner to use.

Refer to 'README V1.md' for Version 1 setup. The following describes Version 2 setup configuration.

The plugin must be configured in the settings tab before use:

- **Folder** - the root folder containing the text files to be scanned
- **Working Folder** - the folder in the vault where markdown files will be created
- **Start** - the pattern that starts a block of lines to be extracted
- **The markdown file path** - These are '.'-separated names of permitted folders and text files that may be created. An example is `EPIC.ITEM.TEST`. This means the folder depth may be at most 3 levels:
  - The first level after the Start begins with EPIC
  - The second level begins with ITEM
  - The third level begins with TEST
- **Extension** - the file extension to scan. For example, `.txt` means only files with the `.txt` extension will be scanned
- **Destination file extension** - the file extension for the output files (excluding the leading `.`)

## Usage

Once the plugin is loaded, an eye icon will appear as the trigger element with the tooltip "Scan text files for comment lines". Clicking it will scan the text files and create destination files in the vault.

The command to trigger the scan from the command menu is "scan-text-files".

Blocks follow a specific format to identify their start:
- The start of a block is identified by the pattern defined in the Start setting
- The end of a block is identified by the absence of a Start pattern or the end of the file
- The first line of the block contains the path (if any) and filename where the block will be written

Note: Multiple spaces or tabs at the beginning of a block line are replaced by a single space.

### Examples:

1. `////EPIC epic file name` - This will create a file named `EPIC epic file name.md` under the Working Folder.

2. `////EPIC epic folder name.ITEM item file name` - This will create a folder named `EPIC epic folder name` under the Working Folder and the file `ITEM item file name.md` under the EPIC folder.

3. `////EPIC epic folder name.ITEM item file name [1]` - This will insert the text block into the file `ITEM item file name.md` just under the text block created in example 2.

## Disclosure

This plugin uses Rust-based executables to scan text files outside of the vault to create text files in the vault.