# Code Scanner

## Motivation
The previous plugin __Source Scanner__ extracted marked comment blocks and place it in the vault as a file(s).

There are two problem with this approach. The extracted comments went into the vault without a folder structure and the objective was to create a mechanism to document the application worked on.

This version enable the user to define the structure of the documentation. This is best illustrated by an example.

Suppose the document start folder in the value is __docs__ and you want to preserve information about the structure. Then you can say one set of __docs__ can contain more than one EPIC and each EPIC can contain more that one ITEM and each ITEM can contain more that one TEST case. 

The  previous plugin used WASM to do the actual parsing of the text passed to it by java script. This proved computationally expensive due to the difference in character encoding between WASM and java script.

## General
This plugin scans text files and extract blocks of lines that start with a specified pattern. This pattern can be something like `////` or `//#` or even a `. (dot)`.

Once a block of marked lines are extracted it is written into a file that goes in the current vault. Multiple blocks can go into one file. These blocks must then have a unique sequence number that will determine where in the file the block will go. This number must start from 1. For example [1], [2], ...

The extraction of the blocks are done by using rust based executables. The zip file containing the executables is at this [location](https://github.com/gerrie-myburgh/code-scanner-ver2/releases/download/1.0.0/get-comments.zip)  on github.

The source for the rust program can be found at [github](https://github.com/gerrie-myburgh/get-comments). Do not use the distribution in this git repo  to try make it work with obsidian release, it might be a version ahead of what the current obsidian release need. You can however use this executable if you want to run it from the command line. 

Download the zip file and extract the content then place the executable files in the root of the ***code-scanner-ver2*** plugin folder. The names of the executable files are:

 1. `get-comments-linux`
 2. `get-comments-macos`
 3. `get-comments.exe`.

Make sure that the downloaded executables are in fact set to be executable on your system once downloaded and extracted.

## Configuration
The plugin must be configured in the settings tab before usage.

 - Folder - the root folder where the text files are located to be scanned.
 - Working Folder - the name of the folder in the vault where the md files will be created
 - Start - the pattern that starts a block of lines to be extracted.
 - The markdown file path - this is '.' separated names of permitted folders and text files that may be created. An example of this is `EPIC.ITEM.TEST`. This means that the folder depth may at most be 3 deep. First level after the Start starts with EPIC. The Second level starts with ITEM. The third level starts with TEST.
  - Extension - the extension of the files to be scanned. An example of this is `.txt`. This means that only files with the extension .txt will be scanned.
  - Destination file extension - the file extension into which the block of lines will be written into. This extension string is excluding the `.` in front of the extension string.

## Usage
Once the plugin is loaded then the trigger element will be an eye icon with the tooltip 'Scan text files for comment lines'. Once this is clicked the plugin will scan the text files and create destination files in the vault.

The command to trigger the scan from the command menu is "scan-text-files".

The blocks have a specific format that is used to identify the start of a block. The start of a block is identified by the pattern defined in the Start setting. The end of a block is identified by the an absence of a Start pattern or end of file. The first line of the block is the path name (if any) and text file name into which the block will be written.

Note that multiple spaces or tabs in the start of block line is replaced by one space.

Examples of these are:

 1. ////EPIC epic file name - This will create a file named `EPIC epic file name.md` under the Working Folder.
 2. ////EPIC epic folder name.ITEM item file name - This will create a folder named `EPIC epic folder name` under the Working Folder and the file `ITEM item file name.md` under the EPIC folder. 
 3. ////EPIC epic folder name.ITEM item file name [1]- This will insert the text block into the file `ITEM item file name.md` just under the text block created in 2. 

## Disclosure
This plugin uses rust based executables to scan text files outside of the vault to create text files in the vault.
