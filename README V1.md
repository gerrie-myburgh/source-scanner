# Source Code Scanner Version 1

Extracts comments from source code into notes. The plugin works with the Obsidian desktop application.

## Problem That the Plugin Addresses

Developers who use agile methodology face documentation challenges. Agile doesn't mean no documentation, but rather only the necessary documentation. To help developers minimize the work required to demonstrate how business requirements are met and solved, specialized tools are needed.

The simplest solution from a developer's perspective is to document business requirement solutions in the code itself. The ideal place for this is in block and line comments within the source code. What's needed are tools to extract these comments into notes and correlate them with user requirements. User requirements typically take the form of user stories, also stored as notes.

## Use Cases for This Plugin

0. This plugin is restricted to source code having C/C++ comment style.
1. Scan source code files for comments that are written out to notes in the current specified document vault. These comments can include markdown text.
2. Correlate the comments with agile user stories.
3. Create a table of markers along with the notes where the markers appear.

## Comment Types Scanned in Source Code

The following types of comments are extracted from source files by the plugin and written to markdown notes: ```/** ... */``` and ```//b ...```. The goal is to capture only comments that relate to solving business rules. Other comment types, ```/* ... */``` and ```// ...```, are ignored as they typically explain technical implementation details.

An example of a block comment that is captured:

```agsl
  /**
   * ## onload()
   * Load the plugin and set up the commands
   * 1. Add a command to trigger the creation of solution files. Make sure all configurations have been completed before running the command
   * 2. Add a ribbon command to toggle scanning _ON_ or _OFF_. Make sure the scanner has been configured before starting it.
   */
```

This will be rendered as follows in the relevant note in the specified document vault:

# onload()
Load the plugin and set up the commands

1. Add a command to trigger the creation of solution files. Make sure all configurations have been completed before running the command
2. Add a ribbon command to toggle scanning _ON_ or _OFF_. Make sure the scanner has been configured before starting it.

### Comment File Naming Convention

The scanner must be configured to specify where the source code is located in the file system. Once this is done and the scanner is switched on, the note's name will be the fully qualified name of the class being scanned, appended with ".md". Here's an example of a note name:

**crosscut.CrossCuttingConcerns.md**

The file scanned in this case could be:

**crosscut/CrossCuttingConcerns.scala**

## Correlation of Notes with User Stories

It's possible to correlate the generated document notes with user stories by selecting the menu option:

**Create solution file**

This creates mapping notes that link user story notes to document notes.

### User Stories

User stories are given to developers, who can then create sub-stories from these initial stories. By using markers in source comments, you can create cross-cutting concerns related to the solution for each story.

The markers for comments follow this pattern:

```agsl
\s\^[a-zA-Z]+[a-zA-Z0-9]+\-[0-9]+(\-[a-zA-Z]+[a-zA-Z0-9]+\-[0-9]+)*
```

An example would be: ^JIRA1234-001-solution-001-test-001. Once these markers are placed in source comments, the system can create mappings between notes and stories. The solution files will then look like this:

![[stories/update-payment-limits/summary of requirement#^summary]]

![[utils.Lexer.md#^story1-00]]

![[Main.md#^story1-02]]

## Creating a Table of Markers

Once markers have been placed in source files, they can become difficult to track for someone generating solution notes from story notes. To make it easier to see which marker is in which note and in what sequence, functionality is provided to generate a list of all markers along with the note file names they appear in.

This should make it easier to update markers in the source code as needed. An example of such a mapping table is:

| marker    | document                          |
|-----------|-----------------------------------|
| story1-00 | [[utils.Lexer.md#^story1-00]]     |
| story1-02 | [[Main.md#^story1-02]]            |
| story2-00 | [[Main.md#^story2-00]]            |