...
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __toBinary = /* @__PURE__ */ (() => {
  var table = new Uint8Array(128);
  for (var i = 0; i < 64; i++)
    table[i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i * 4 - 205] = i;
  return (base64) => {
    var n = base64.length, bytes = new Uint8Array((n - (base64[n - 1] == "=") - (base64[n - 2] == "=")) * 3 / 4 | 0);
    for (var i2 = 0, j = 0; i2 < n; ) {
      var c0 = table[base64.charCodeAt(i2++)], c1 = table[base64.charCodeAt(i2++)];
      var c2 = table[base64.charCodeAt(i2++)], c3 = table[base64.charCodeAt(i2++)];
      bytes[j++] = c0 << 2 | c1 >> 4;
      bytes[j++] = c1 << 4 | c2 >> 2;
      bytes[j++] = c2 << 6 | c3;
    }
    return bytes;
  };
})();

// main.ts
var main_exports = {};
__export(main_exports, {
  VersionSelectionModal: () => VersionSelectionModal,
  default: () => SourceScanner
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// ts/SettingsTab.ts
var import_obsidian = require("obsidian");
var electron = require("electron").remote;
var dialog = electron.dialog;
var ScannerSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app2, plugin, version) {
    super(app2, plugin);
    this.plugin = plugin;
    this.version = version;
  }
  display() {
    if (this.version == "version1") {
      this.sourceScanner();
    } else {
      this.textScanner();
    }
  }
  sourceScanner() {
    const { containerEl } = this;
    containerEl.empty();
    if (this.plugin.intervalHandle) {
      new import_obsidian.Setting(containerEl).setName("Scanner is running").setDesc("Please shutdown the scanner before updating the settings");
    } else {
      var appPathSetting = new import_obsidian.Setting(containerEl);
      appPathSetting.setName("Application Path").setDesc(`Application workspace: ${this.plugin.settings.applicationPath}`).addButton((button) => button.setButtonText("SELECT APPLICATION PATH").onClick((cb) => {
        dialog.showOpenDialog({ properties: ["openDirectory"] }).then(async (result) => {
          console.log(result.canceled);
          console.log(result.filePaths);
          this.plugin.settings.applicationPath = result.filePaths[0];
          appPathSetting.setDesc(`Application workspace: ${this.plugin.settings.applicationPath}`);
          await this.plugin.saveSettings();
        }).catch((err) => {
          console.log(err);
        });
      }));
      var testPathSetting = new import_obsidian.Setting(containerEl);
      testPathSetting.setName("Test Path").setDesc(`Test workspace: ${this.plugin.settings.unitTestPath}`).addButton((button) => button.setButtonText("SELECT UNIT TEST PATH").onClick((cb) => {
        dialog.showOpenDialog({ properties: ["openDirectory"] }).then(async (result) => {
          console.log(result.canceled);
          console.log(result.filePaths);
          this.plugin.settings.unitTestPath = result.filePaths[0];
          testPathSetting.setDesc(`Test workspace: ${this.plugin.settings.unitTestPath}`);
          await this.plugin.saveSettings();
        }).catch((err) => {
          console.log(err);
        });
      }));
      const documentPath = new import_obsidian.Setting(containerEl).setName("Documentation Path").setDesc("Path to document workspace relative from vault").addText((text) => text.setPlaceholder("Enter the documentation path").setValue(this.plugin.settings.documentPath).onChange(async (value) => {
        this.plugin.settings.documentPath = value;
        await this.plugin.saveSettings();
      }));
      const applicationType = new import_obsidian.Setting(containerEl).setName("Application type").setDesc("Type of application").addDropdown((dropDown) => dropDown.addOption(".java", "java").addOption(".rs", "rust").addOption(".c", "c").addOption(".c++", "c++").addOption(".cpp", "cpp").addOption(".cxx", "cxx").addOption(".ts", "typescript").setValue(this.plugin.settings.applicationExtension).onChange(async (value) => {
        this.plugin.settings.applicationExtension = value;
        await this.plugin.saveSettings();
      }));
      const activationInterval = new import_obsidian.Setting(containerEl).setName("Activation interval").setDesc("Activation interval in ms").addText((text) => text.setPlaceholder("Enter the activation interval").setValue(this.plugin.settings.sleepLength.toString()).onChange(async (value) => {
        this.plugin.settings.sleepLength = parseInt(value);
        await this.plugin.saveSettings();
      }));
      const numberOfSrcFiles = new import_obsidian.Setting(containerEl).setName("Number of source files to process").setDesc("Number of source files to process at a time").addText((text) => text.setPlaceholder("Enter the source file processing count").setValue(this.plugin.settings.groupBySize.toString()).onChange(async (value) => {
        this.plugin.settings.groupBySize = parseInt(value);
        await this.plugin.saveSettings();
      }));
    }
  }
  textScanner() {
    const { containerEl } = this;
    containerEl.empty();
    const folder = new import_obsidian.Setting(containerEl).setName("Folder").setDesc("Location of text file to scan").addText((text) => text.setPlaceholder("Enter your text file start folder").setValue(this.plugin.settings.dir).onChange(async (value) => {
      this.plugin.settings.dir = value;
      await this.plugin.saveSettings();
    }));
    const workingFolder = new import_obsidian.Setting(containerEl).setName("Working folder").setDesc("Location of md files").addText((text) => text.setPlaceholder("Enter your working folder name").setValue(this.plugin.settings.work).onChange(async (value) => {
      this.plugin.settings.work = value;
      await this.plugin.saveSettings();
    }));
    const startLine = new import_obsidian.Setting(containerEl).setName("Start").setDesc("The start of line to extract to md file").addText((text) => text.setPlaceholder("Enter your start string").setValue(this.plugin.settings.start).onChange(async (value) => {
      this.plugin.settings.start = value;
      await this.plugin.saveSettings();
    }));
    const folderStructure = new import_obsidian.Setting(containerEl).setName("Folder structure").setDesc("The folder structure definition").addText((text) => text.setPlaceholder("Enter your dot separated folder structure definition").setValue(this.plugin.settings.path).onChange(async (value) => {
      this.plugin.settings.path = value;
      await this.plugin.saveSettings();
    }));
    const extension = new import_obsidian.Setting(containerEl).setName("Extension").setDesc("Extension of the source text files to scan").addText((text) => text.setPlaceholder("Enter your text file extension").setValue(this.plugin.settings.extension).onChange(async (value) => {
      this.plugin.settings.extension = value;
      await this.plugin.saveSettings();
    }));
    const destinationExtension = new import_obsidian.Setting(containerEl).setName("Destination file extension").setDesc("Extension of the destination files into which extracted text goes").addText((text) => text.setPlaceholder("Enter your destination file extension").setValue(this.plugin.settings.destExtension).onChange(async (value) => {
      this.plugin.settings.destExtension = value;
      await this.plugin.saveSettings();
    }));
  }
};

// ts/ScanSource.ts
var import_fs2 = require("fs");

// ts/Utils.ts
var import_fs = require("fs");

// ts/DocFolders.ts
var DocFolders = class {
  constructor(storyFolder, solutionFolder, markerMapping, commentMapping, testCommentMapping, settingsUnitTestMapping) {
    this.settingsStoryFolder = storyFolder;
    this.settingsSolutionFolder = solutionFolder;
    this.settingsMarkerFolder = markerMapping;
    this.settingsCommentFolder = commentMapping;
    this.settingsTestCommentFolder = testCommentMapping;
    this.settingsUnitTestFolder = settingsUnitTestMapping;
  }
};

// ts/Utils.ts
var path = require("path").remote;
var Utils = class {
  constructor(app2) {
    this.separator = "/";
    this.markerRegExp = /\s\^[a-zA-Z]+[a-zA-Z0-9]+\-[0-9]+(\-[a-zA-Z]+[a-zA-Z0-9]+\-[0-9]+)*/g;
    this.app = app2;
    this.fsa = this.app.vault.adapter;
  }
  toVaultTypeSeperator() {
    if (this.separator == "\\") {
      return "/";
    } else {
      return "/";
    }
  }
  walkInFolderFromDir(dir, files) {
    const fileList = (0, import_fs.readdirSync)(dir);
    for (const file of fileList) {
      var name = `${dir}${this.separator}${file}`;
      if ((0, import_fs.statSync)(name).isDirectory()) {
        this.walkInFolderFromDir(name, files);
      } else {
        files.push(name);
      }
    }
    return files;
  }
  filterFileNamesByExtension(extension, files) {
    var result = new Array();
    result = files.filter((fileName) => {
      return fileName.endsWith(extension);
    });
    return result;
  }
  listMDFilesInVault(folder) {
    const commentBasePath = `${this.fsa.getBasePath()}${this.separator}${folder}`;
    return this.filterFileNamesByExtension(".md", this.walkInFolderFromDir(commentBasePath, [])).map((value) => {
      var fileName = value.replace(`${this.fsa.getBasePath()}`, "");
      while (fileName.contains(`\\`)) {
        fileName = fileName.replace(`${this.separator}`, "/");
      }
      return fileName;
    });
  }
  makeDirInVault(filePathAndName) {
    var filePath = filePathAndName.split(this.toVaultTypeSeperator());
    filePath = filePath.slice(0, filePath.length - 1).slice(1);
    filePath[0] = `/${filePath[0]}`;
    var constructedPath = [];
    while (filePath.length > 0) {
      constructedPath.push(filePath[0]);
      this.fsa.mkdir(constructedPath.join("/"));
      filePath = filePath.slice(1);
    }
  }
  sortSetOfString(set) {
    const sortedArray = Array.from(set).sort();
    return new Set(sortedArray);
  }
  createFolders(docPath) {
    const settingsBase1 = `${this.fsa.getBasePath()}${this.separator}${docPath}${this.separator}`;
    const settingsStoryFolder1 = settingsBase1 + "stories";
    const settingsSolutionFolder1 = settingsBase1 + "solutions";
    const settingsMarkerMapping1 = settingsBase1 + "marker";
    const settingsCommentsMapping1 = settingsBase1 + "comments";
    const settingsTestCommentsMapping1 = settingsBase1 + "test comments";
    const settingsUnitTestMapping1 = settingsBase1 + "unit tests";
    (0, import_fs.mkdirSync)(settingsStoryFolder1, { recursive: true });
    (0, import_fs.mkdirSync)(settingsSolutionFolder1, { recursive: true });
    (0, import_fs.mkdirSync)(settingsMarkerMapping1, { recursive: true });
    (0, import_fs.mkdirSync)(settingsCommentsMapping1, { recursive: true });
    (0, import_fs.mkdirSync)(settingsTestCommentsMapping1, { recursive: true });
    (0, import_fs.mkdirSync)(settingsUnitTestMapping1, { recursive: true });
    const settingsBase = `${docPath}${this.separator}`;
    const settingsStoryFolder = settingsBase + "stories";
    const settingsSolutionFolder = settingsBase + "solutions";
    const settingsMarkerMapping = settingsBase + "marker";
    const settingsCommentsMapping = settingsBase + "comments";
    const settingsTestCommentsMapping = settingsBase + "test comments";
    const settingsUnitTestMapping = settingsBase + "unit tests";
    return new DocFolders(settingsStoryFolder, settingsSolutionFolder, settingsMarkerMapping, settingsCommentsMapping, settingsTestCommentsMapping, settingsUnitTestMapping);
  }
};

// ts/ScanSource.ts
var ScanSource = class {
  constructor() {
    this.phaseCount = 0;
    this.sourceAndDocumentLink = /* @__PURE__ */ new Set();
  }
  init(app2, plugin, scanner) {
    this.codeScanner = scanner;
    this.applicationPath = plugin.settings.applicationPath;
    this.codeExtension = plugin.settings.applicationExtension;
    this.documentPath = plugin.settings.documentPath;
    this.testPath = plugin.settings.unitTestPath;
    this.groupBySize = plugin.settings.groupBySize;
    this.sleepLength = plugin.settings.sleepLength;
    this.utils = new Utils(app2);
    this.fsa = app2.vault.adapter;
    return setInterval(() => this.run(), this.sleepLength);
  }
  run() {
    this.docFolders = this.utils.createFolders(this.documentPath);
    if (this.phaseCount == 1) {
      const impFiles = this.utils.filterFileNamesByExtension(this.codeExtension, this.utils.walkInFolderFromDir(this.applicationPath, []));
      this.applicationFileListWithExtension = [];
      for (let i = 0; i < impFiles.length; i += this.groupBySize) {
        const chunk = impFiles.slice(i, i + this.groupBySize);
        this.applicationFileListWithExtension.push(chunk);
      }
      const testFiles = this.utils.filterFileNamesByExtension(this.codeExtension, this.utils.walkInFolderFromDir(this.testPath, []));
      this.testFileListWithExtension = [];
      for (let i = 0; i < testFiles.length; i += this.groupBySize) {
        const chunk = testFiles.slice(i, i + this.groupBySize);
        this.testFileListWithExtension.push(chunk);
      }
    }
    if (this.phaseCount == 2) {
      const files = this.utils.filterFileNamesByExtension(".md", this.utils.walkInFolderFromDir(this.fsa.getBasePath() + this.utils.separator + this.docFolders.settingsCommentFolder, []));
      this.documentFileListWithExtension = files.map((fileName) => {
        return fileName.replace(this.fsa.getBasePath() + this.utils.separator, "");
      });
    }
    if (this.phaseCount == 3 && this.applicationFileListWithExtension.length > 0) {
      const filesToCheck = this.applicationFileListWithExtension.pop();
      if (filesToCheck != void 0) {
        filesToCheck.forEach((srcFile) => {
          const documentName = this.createDocNameFromSourceName(srcFile, this.applicationPath);
          const documentNameAndPath = `${this.documentPath}${this.utils.separator}comments${this.utils.separator}${documentName}`;
          const docFullPathname = `${this.fsa.getBasePath()}${this.utils.separator}${documentNameAndPath}`;
          this.sourceAndDocumentLink.add(documentNameAndPath);
          this.doActualScanning(documentNameAndPath, srcFile, docFullPathname);
        });
        this.phaseCount = 2;
      }
    }
    if (this.phaseCount == 4 && this.testFileListWithExtension.length > 0) {
      const filesToCheck = this.testFileListWithExtension.pop();
      if (filesToCheck != void 0) {
        filesToCheck.forEach((srcFile) => {
          const testDocumentName = this.createDocNameFromSourceName(srcFile, this.testPath);
          const testDocumentNameAndPath = `${this.documentPath}${this.utils.separator}test comments${this.utils.separator}${testDocumentName}`;
          const docFullPathname = `${this.fsa.getBasePath()}${this.utils.separator}${testDocumentNameAndPath}`;
          this.doActualScanning(testDocumentNameAndPath, srcFile, docFullPathname);
        });
        this.phaseCount = 4;
      }
    }
    if (this.phaseCount == 5) {
      this.documentFileListWithExtension.forEach((fileName) => {
        if (!this.sourceAndDocumentLink.has(fileName)) {
          this.utils.fsa.remove(fileName);
        }
      });
      this.sourceAndDocumentLink.clear();
      this.phaseCount = -1;
    }
    this.phaseCount += 1;
  }
  doActualScanning(documentNameAndPath, srcFile, docFullPathname) {
    this.sourceAndDocumentLink.add(documentNameAndPath);
    const srcFileExists = (0, import_fs2.existsSync)(srcFile);
    if (!srcFileExists) {
      console.info("Test source file gone " + srcFile);
    } else {
      const srcStat = (0, import_fs2.statSync)(srcFile);
      var createdFile = false;
      const docFileExists = (0, import_fs2.existsSync)(docFullPathname);
      var docStat;
      var createdFile = false;
      if (docFileExists) {
        docStat = (0, import_fs2.statSync)(docFullPathname);
      } else {
        (0, import_fs2.writeFileSync)(docFullPathname, "");
        createdFile = true;
      }
      docStat = (0, import_fs2.statSync)(docFullPathname);
      if (createdFile || docStat.mtimeMs < srcStat.mtimeMs) {
        const srcLines = (0, import_fs2.readFileSync)(srcFile, { encoding: "utf8", flag: "r" });
        var allComments;
        var comments = "NONE";
        try {
          comments = this.codeScanner(srcLines);
          if (comments != void 0) {
            allComments = comments.replaceAll(/\n\s+\*/g, "\n");
          }
        } catch (exception) {
          console.log("Error in scan for file " + srcFile);
          const headerComment2 = `[Source](file://${srcFile})

---
`;
          this.fsa.write(documentNameAndPath, headerComment2 + comments);
        }
        if (allComments == "unpaired surrogates") {
          console.log("Error in scan for file " + srcFile);
        }
        const headerComment = `[Source](file://${srcFile})

---
`;
        this.fsa.write(documentNameAndPath, headerComment + allComments);
      }
    }
  }
  createDocNameFromSourceName(sourceFile, applicationPath) {
    var fileName = sourceFile.replace(applicationPath + this.utils.separator, "").replace(this.codeExtension, ".md");
    while (fileName.contains(this.utils.separator)) {
      fileName = fileName.replace(this.utils.separator, ".");
    }
    return fileName;
  }
  createRelativePath(sourceFile, documentPart) {
    var sourceFileParts = sourceFile.split(this.utils.separator);
    var documentAndPathParts = `${this.utils.fsa.getBasePath()}/${documentPart}`.split("/");
    while (sourceFileParts[0] == documentAndPathParts[0]) {
      sourceFileParts = sourceFileParts.slice(1);
      documentAndPathParts = documentAndPathParts.slice(1);
    }
    return documentAndPathParts.filter((value) => {
      return !value.endsWith(".md");
    }).map((value) => "..").concat(sourceFileParts).join("/");
  }
};

// ts/CrossCuttingConcerns.ts
var CrossCuttingConcerns = class {
  constructor(app2, docFolders) {
    this.utils = new Utils(app2);
    this.fsa = this.utils.fsa;
    this.docFolders = docFolders;
  }
  generateCrossCuttingConcerns() {
    const documentToMarkerMap = /* @__PURE__ */ new Map();
    const testDocumentToMarkerMap = /* @__PURE__ */ new Map();
    const storyToMarkerMap = /* @__PURE__ */ new Map();
    const testStoryToMarkerMap = /* @__PURE__ */ new Map();
    const markerToStoryMap = /* @__PURE__ */ new Map();
    const markerToTestStoryMap = /* @__PURE__ */ new Map();
    const markerToDocumentMap = /* @__PURE__ */ new Map();
    const markerToTestDocumentMap = /* @__PURE__ */ new Map();
    const promise = new Array();
    const solutionFileToDelete = this.utils.listMDFilesInVault(this.docFolders.settingsSolutionFolder);
    solutionFileToDelete.forEach((file) => {
      promise.push(this.fsa.remove(file));
    });
    Promise.allSettled(promise).then((value) => {
      this.fsa.rmdir(this.docFolders.settingsSolutionFolder, true);
      this.fsa.mkdir(this.docFolders.settingsSolutionFolder);
      const commentMDFiles = this.utils.listMDFilesInVault(this.docFolders.settingsCommentFolder);
      const testCommentMDFiles = this.utils.listMDFilesInVault(this.docFolders.settingsTestCommentFolder);
      const storyMDFiles = this.utils.listMDFilesInVault(this.docFolders.settingsStoryFolder);
      const testStoryMDFiles = this.utils.listMDFilesInVault(this.docFolders.settingsUnitTestFolder);
      const allPromises = new Array();
      commentMDFiles.forEach((commentFile) => {
        allPromises.push(this.fsa.read(commentFile).then((value2) => {
          var markerSet = /* @__PURE__ */ new Set();
          const markersMatch = value2.matchAll(this.utils.markerRegExp);
          Array.from(markersMatch).forEach((marker) => {
            markerSet.add(marker[0].trim());
          });
          markerSet = this.utils.sortSetOfString(markerSet);
          const documentName = commentFile.split("/").last();
          markerSet.forEach((marker) => {
            markerToDocumentMap.set(marker.trim(), documentName);
          });
          if (documentName != void 0) {
            documentToMarkerMap.set(documentName, markerSet);
          }
        }));
      });
      testCommentMDFiles.forEach((commentFile) => {
        allPromises.push(this.fsa.read(commentFile).then((value2) => {
          var markerSet = /* @__PURE__ */ new Set();
          const markersMatch = value2.matchAll(this.utils.markerRegExp);
          Array.from(markersMatch).forEach((marker) => {
            markerSet.add(marker[0].trim());
          });
          markerSet = this.utils.sortSetOfString(markerSet);
          const documentName = commentFile.split("/").last();
          markerSet.forEach((marker) => {
            markerToTestDocumentMap.set(marker.trim(), documentName);
          });
          if (documentName != void 0) {
            testDocumentToMarkerMap.set(documentName, markerSet);
          }
        }));
      });
      storyMDFiles.forEach((storyFile) => {
        allPromises.push(this.fsa.read(storyFile).then((value2) => {
          var markerSet = /* @__PURE__ */ new Set();
          const markersMatch = value2.matchAll(this.utils.markerRegExp);
          Array.from(markersMatch).forEach((marker) => {
            markerSet.add(marker[0].trim());
          });
          markerSet = this.utils.sortSetOfString(markerSet);
          const documentName = storyFile.split("/").last();
          markerSet.forEach((marker) => {
            markerToStoryMap.set(marker.trim(), storyFile);
          });
          if (documentName != void 0) {
            storyToMarkerMap.set(documentName, markerSet);
          }
        }));
      });
      testStoryMDFiles.forEach((storyFile) => {
        allPromises.push(this.fsa.read(storyFile).then((value2) => {
          var markerSet = /* @__PURE__ */ new Set();
          const markersMatch = value2.matchAll(this.utils.markerRegExp);
          Array.from(markersMatch).forEach((marker) => {
            markerSet.add(marker[0].trim());
          });
          markerSet = this.utils.sortSetOfString(markerSet);
          const documentName = storyFile.split("/").last();
          markerSet.forEach((marker) => {
            markerToTestStoryMap.set(this.dropRightAndMkString(marker.trim().split("-"), 4, "-"), storyFile);
          });
          if (documentName != void 0) {
            testStoryToMarkerMap.set(documentName, markerSet);
          }
        }));
      });
      Promise.allSettled(allPromises).then((value2) => {
        var listOfMarkers = [];
        var unitTestMarkers = [];
        Array.from(documentToMarkerMap.values()).forEach((setOfMarkers) => {
          const loalListOfMarkers = Array.from(setOfMarkers);
          listOfMarkers = listOfMarkers.concat(loalListOfMarkers);
        });
        Array.from(testDocumentToMarkerMap.values()).forEach((setOfMarkers) => {
          const loalListOfMarkers = Array.from(setOfMarkers);
          unitTestMarkers = unitTestMarkers.concat(loalListOfMarkers);
        });
        listOfMarkers.sort((a, b) => a.localeCompare(b));
        unitTestMarkers.sort((a, b) => a.localeCompare(b));
        var allMarkers = this.groupedMap(listOfMarkers, (i) => this.solutionDocNameFromMarker(i));
        var allUnitTestMarkers = this.groupedUnitTestMap(unitTestMarkers);
        Array.from(allMarkers).forEach(([solName, markers]) => {
          var mdString = `# ${this.dropRightAndMkString(solName.split("/"), 1, " ").toUpperCase()}
`;
          var markerToStory = new Map(Array.from(markerToStoryMap.entries()).filter(([key]) => {
            const splitMarker = key.split("-");
            return markers[0].startsWith(this.dropRightAndMkString(splitMarker, 1, "-"));
          }));
          mdString = mdString + "## Functional Requirement\n";
          markerToStory.forEach((story, marker) => {
            if (markerToStoryMap.get(marker) != void 0) {
              mdString = mdString + `![[${markerToStoryMap.get(marker)}#${marker.trim()}]]
`;
            }
          });
          const uniqueMakers = Array.from(new Set(markers));
          uniqueMakers.forEach((marker, story) => {
            mdString = mdString + "## Implimentation Solution\n";
            if (markerToDocumentMap.get(marker) != void 0) {
              const document2 = markerToDocumentMap.get(marker);
              mdString = mdString + `![[${document2}#${marker.trim()}]]
`;
              if (allUnitTestMarkers.get(marker) != void 0) {
                mdString = mdString + "### Unit Test Implementation\n";
                allUnitTestMarkers.get(marker).forEach((marker2) => {
                  if (this.isTestMarker(marker2)) {
                    mdString = mdString + `![[${markerToTestDocumentMap.get(marker2)}#${marker2.trim()}]]
`;
                  }
                });
              }
            }
          });
          this.utils.makeDirInVault(solName);
          this.fsa.write(solName, mdString);
        });
      });
    });
  }
  dropRightAndMkString(values, n, delimiter) {
    return values.slice(0, values.length - n).join(delimiter);
  }
  dropLeftAndMkString(values, n, delimiter) {
    return values.slice(n, values.length - n).join(delimiter);
  }
  getSolutionFileName(solName) {
    const fileNameParts = solName.split("-");
    var fileName = [];
    var i = 0;
    for (i = 0; i < fileNameParts.length; i++) {
      if (i % 2 == 0) {
        if (i == fileNameParts.length - 2) {
          fileName.push(fileNameParts[i]);
        } else {
          fileName.push(fileNameParts[i] + "-" + fileNameParts[i + 1]);
        }
      }
    }
    return `/${fileName.join("/")}`;
  }
  solutionDocNameFromMarker(marker) {
    const docName = this.getSolutionFileName(marker.replace("^", ""));
    const solutionName = `${docName}.md`;
    return `/${this.docFolders.settingsSolutionFolder}${solutionName}`;
  }
  groupedMap(array, getKey) {
    return array.reduce((map, currentValue) => {
      const key = getKey(currentValue);
      if (!map.has(key)) {
        map.set(key, []);
      }
      if (map.get(key) != void 0) {
        map?.get(key)?.push(currentValue);
      }
      return map;
    }, /* @__PURE__ */ new Map());
  }
  groupedUnitTestMap(array) {
    return array.reduce((map, currentValue) => {
      const key = currentValue.split("-");
      const keyValue = this.dropRightAndMkString(key, 2, "-");
      if (!map.has(keyValue)) {
        map.set(keyValue, []);
      }
      if (map.get(keyValue) != void 0) {
        map?.get(keyValue)?.push(currentValue);
      }
      return map;
    }, /* @__PURE__ */ new Map());
  }
  isTestMarker(marker) {
    return marker.split("-").length == 8;
  }
};

// ts/MarkerGroupList.ts
var MarkerGroupList = class {
  constructor(app2, docFolders) {
    this.markerFileWithPath = `${docFolders.settingsMarkerFolder}/marker-table.md`;
    this.utils = new Utils(app2);
    this.docFolders = docFolders;
  }
  generateMakerGroupList() {
    const markerToDocumentMap = /* @__PURE__ */ new Map();
    const markerToTestDocumentMap = /* @__PURE__ */ new Map();
    const commentFiles = this.utils.listMDFilesInVault(this.docFolders.settingsCommentFolder);
    const testCommentFiles = this.utils.listMDFilesInVault(this.docFolders.settingsTestCommentFolder);
    const promise = new Array();
    commentFiles.forEach((commentFile) => {
      promise.push(this.utils.fsa.read(commentFile).then((value) => {
        var markerSet = /* @__PURE__ */ new Set();
        const markersMatch = value.matchAll(this.utils.markerRegExp);
        Array.from(markersMatch).forEach((marker) => {
          markerSet.add(marker[0].trim());
        });
        markerSet = this.utils.sortSetOfString(markerSet);
        markerSet.forEach((marker) => {
          if (!markerToDocumentMap.has(marker.trim())) {
            markerToDocumentMap.set(marker, /* @__PURE__ */ new Set());
          }
          markerToDocumentMap.get(marker.trim())?.add(commentFile);
        });
      }));
    });
    testCommentFiles.forEach((commentFile) => {
      promise.push(this.utils.fsa.read(commentFile).then((value) => {
        var markerSet = /* @__PURE__ */ new Set();
        const markersMatch = value.matchAll(this.utils.markerRegExp);
        Array.from(markersMatch).forEach((marker) => {
          markerSet.add(marker[0].trim());
        });
        markerSet = this.utils.sortSetOfString(markerSet);
        markerSet.forEach((marker) => {
          if (!markerToTestDocumentMap.has(marker.trim())) {
            markerToTestDocumentMap.set(marker, /* @__PURE__ */ new Set());
          }
          markerToTestDocumentMap.get(marker.trim())?.add(commentFile);
        });
      }));
    });
    Promise.allSettled(promise).then((value) => {
      const allMarkers = Array.from(markerToDocumentMap.keys()).sort();
      var mdString = "Code and Code Story links\n\n";
      mdString = mdString + `|marker|document|
`;
      mdString = mdString + `|------|--------|
`;
      allMarkers.forEach((marker) => {
        const docNameSet = markerToDocumentMap.get(marker);
        docNameSet?.forEach((docName) => {
          mdString = mdString + `|${marker.substring(1)}|[[${docName}#${marker}]]
`;
        });
      });
      const allTestMarkers = Array.from(markerToTestDocumentMap.keys()).sort();
      mdString = mdString + "\nTest and Test Story links\n\n";
      mdString = mdString + `|marker|document|
`;
      mdString = mdString + `|------|--------|
`;
      allTestMarkers.forEach((marker) => {
        const docNameSet = markerToTestDocumentMap.get(marker);
        docNameSet?.forEach((docName) => {
          mdString = mdString + `|${marker.substring(1)}|[[${docName}#${marker}]]
`;
        });
      });
      this.utils.fsa.write(this.markerFileWithPath, mdString);
    });
  }
};

// main.ts
var import_child_process = require("child_process");
var import_fs3 = require("fs");

// pkg/obsidian_rust_plugin.js
var import_meta = {};
var wasm;
var heap = new Array(128).fill(void 0);
heap.push(void 0, null, true, false);
function getObject(idx) {
  return heap[idx];
}
var WASM_VECTOR_LEN = 0;
var cachedUint8Memory0 = null;
function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}
var cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : { encode: () => {
  throw Error("TextEncoder not available");
} };
var encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function(arg, view) {
  const buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8Memory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8Memory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127)
      break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function isLikeNone(x) {
  return x === void 0 || x === null;
}
var cachedInt32Memory0 = null;
function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}
var heap_next = heap.length;
function dropObject(idx) {
  if (idx < 132)
    return;
  heap[idx] = heap_next;
  heap_next = idx;
}
function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}
var cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: () => {
  throw Error("TextDecoder not available");
} };
if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode();
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
function addHeapObject(obj) {
  if (heap_next === heap.length)
    heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}
function scan_for_comments(str) {
  const ret = wasm.scan_for_comments(addHeapObject(str));
  return takeObject(ret);
}
async function __wbg_load(module2, imports) {
  if (typeof Response === "function" && module2 instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module2, imports);
      } catch (e) {
        if (module2.headers.get("Content-Type") != "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module2.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module2, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module: module2 };
    } else {
      return instance;
    }
  }
}
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "string" ? obj : void 0;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  return imports;
}
function __wbg_init_memory(imports, maybe_memory) {
}
function __wbg_finalize_init(instance, module2) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module2;
  cachedInt32Memory0 = null;
  cachedUint8Memory0 = null;
  return wasm;
}
async function __wbg_init(input) {
  if (wasm !== void 0)
    return wasm;
  if (typeof input === "undefined") {
    input = new URL("obsidian_rust_plugin_bg.wasm", import_meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof input === "string" || typeof Request === "function" && input instanceof Request || typeof URL === "function" && input instanceof URL) {
    input = fetch(input);
  }
  __wbg_init_memory(imports);
  const { instance, module: module2 } = await __wbg_load(await input, imports);
  return __wbg_finalize_init(instance, module2);
}
var obsidian_rust_plugin_default = __wbg_init;

// wasm-binary:/media/gerrie/Media/Workspace/plugin/source-scanner/pkg/obsidian_rust_plugin_bg.wasm
var obsidian_rust_plugin_bg_default = __toBinary("AGFzbQEAAAABlQEVYAJ/fwBgAn9/AX9gA39/fwF/YAF/AGADf39/AGAFf39/f38AYAR/f39/AX9gAX8Bf2AGf39/f39/AGAFf39/f38Bf2AAAGAEf39/fwBgB39/f39/f38AYAJ/fwF+YAZ/f39/f38Bf2AFf399f38AYAR/fX9/AGAFf39+f38AYAR/fn9/AGAFf398f38AYAR/fH9/AAJxBAN3YmcVX193YmluZGdlbl9zdHJpbmdfZ2V0AAADd2JnGl9fd2JpbmRnZW5fb2JqZWN0X2Ryb3BfcmVmAAMDd2JnFV9fd2JpbmRnZW5fc3RyaW5nX25ldwABA3diZxBfX3diaW5kZ2VuX3Rocm93AAADQ0IHBwwIAAUEAwQHBg0AAQAAAQAFCAUICQQAAwICAQMABAEBBgYOCQUPERMDCwIKAwAAAAQCBgEAAQACAwoBCgAAAAAEBQFwAR8fBQMBABEGCQF/AUGAgMAACwdHBAZtZW1vcnkCABFzY2FuX2Zvcl9jb21tZW50cwAEEV9fd2JpbmRnZW5fbWFsbG9jACQSX193YmluZGdlbl9yZWFsbG9jACcJJAEAQQELHikZKioqLy0sKykoMEQyHhQ9OSI6Qi4lFRxFMzQgOwwBBAqC9gFCsi0CLH8CfiMAQYACayICJAAgAkG4AWogABAAAkAgAigCuAEiEQRAIAIoArwBIQ8gAkGsh8AANgI4IAJBADYCNCACQoKAgIDAADcCLCACQeOHwAA2AiggAkEDNgIkIAJB4IfAADYCICACQayHwAA2AlQgAkEANgJQIAJCgYCAgMAANwJIIAJB6IfAADYCRCACQQM2AkAgAkHlh8AANgI8IAJBrIfAADYCcCACQQA2AmwgAkKBgICAwAA3AmQgAkHoh8AANgJgIAJBAzYCXCACQemHwAA2AlggAkHvh8AANgKMASACQQA2AogBIAJCg4CAgMAANwKAASACQeyHwAA2AnwgAkEDNgJ4IAJB7IfAADYCdCACQe+HwAA2AqgBIAJBATYCpAEgAkH0h8AANgKgASACQQE2ApwBIAJB8IfAADYCmAEgAkEBNgKUASACQfCHwAA2ApABIAIgAkGQAWo2AhwgAiACQfQAajYCGCACIAJB2ABqNgIUIAIgAkE8ajYCECACIAJBIGo2AgwgAkEANgK0ASACQoCAgIDAADcCrAFBkJfAAC0AAEEBRwRAIwBBEGsiASQAIwBBEGsiAyQAIANBADoAD0EBQQEQQCIHRQRAQQFBARBDAAsgASADQQ9qrTcDACABIAetNwMIIAdBARA8IANBEGokACABKQMAIS0gASkDCCEuQZCXwAAtAABBAkYEQEGQicAAQf0AQdCJwAAQIwALQZCXwABBAToAAEGIl8AAIC43AwBBgJfAACAtNwMAIAFBEGokAAsgAkHIAWpBqIjAACkDADcDAEGAl8AAQYCXwAApAwAiLUIBfDcDACACIAJBIGo2ArwBIAJBoIjAACkDADcDwAEgAkGIl8AAKQMANwPYASACIC03A9ABIAIgAkEMajYCuAEgAkHwAWohByMAQUBqIgEkAAJAAkACQCACQbgBaiIDEA0iBgRAQRBBBBBAIgVFDQIgBSAGNgIAIAFBATYCFCABIAU2AhAgAUEENgIMIAFBOGogA0EgaikDADcDACABQTBqIANBGGopAwA3AwAgAUEoaiADQRBqKQMANwMAIAFBIGogA0EIaikDADcDACABIAMpAwA3AxggAUEYahANIggEQEEEIQZBASEDA0AgASgCDCADRgRAIAFBDGogA0EBQQFBAiABKAIsGyABKAIcIAEoAhhGG0EEQQQQGCABKAIQIQULIAUgBmogCDYCACABIANBAWoiAzYCFCAGQQRqIQYgAUEYahANIggNAAsLAkAgASgCJCIDRQ0AIAMgA0EDdCIFakERaiIDRQ0AIAEoAiAgBWtBCGsgAxA8CyAHIAEpAgw3AgAgB0EIaiABQRRqKAIANgIADAELIAdBADYCCCAHQoCAgIDAADcCACADKAIMIgdFDQAgByAHQQN0IgVqQRFqIgdFDQAgAygCCCAFa0EIayAHEDwLIAFBQGskAAwBC0EEQRAQNQALIAIoAvgBIQEgAigC9AEhCyACIAJB/wFqNgLkAQJAAkACQAJAIAFBAk8EQCABQRVJDQEgAkHkAWohB0EAIQUjAEGAIGsiBiQAAkACQAJAQYCJ+gAgASABQYCJ+gBPGyIIIAEgAUEBdmsiAyADIAhJGyIIQYEITwRAIANB/////wNLIAhBAnQiA0H8////B0tyDQJBBCEFIANBBBBAIg1FDQIgCyABIA0gCCABQcEASSAHEAcgDSADEDwMAQsgCyABIAZBgAggAUHBAEkgBxAH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KAIEEA4LOAACQCACQYCAxABGDQAgACACIAEoAhARAQBFDQBBAQ8LIANFBEBBAA8LIAAgA0EAIAEoAgwRAgALLQACQCADaUEBRyABQYCAgIB4IANrS3INACAAIAEgAyACEDgiAEUNACAADwsACx0AIABFBEAQQQALIAAgAiADIAQgBSABKAIQEQkACxsAIABFBEAQQQALIAAgAiADIAQgASgCEBEGAAsbACAARQRAEEEACyAAIAIgAyAEIAEoAhARCwALGwAgAEUEQBBBAAsgACACIAMgBCABKAIQERAACxsAIABFBEAQQQALIAAgAiADIAQgASgCEBESAAsbACAARQRAEEEACyAAIAIgAyAEIAEoAhARFAALJQEBfyAAKAIAIgFBgICAgHhyQYCAgIB4RwRAIAAoAgQgARA8CwsZACAARQRAEEEACyAAIAIgAyABKAIQEQQACxcAIABFBEAQQQALIAAgAiABKAIQEQEACxEAQeSPwABBOUGAkMAAECMACxcBAX8gACgCACIBBEAgACgCBCABEDwLCx8AIABBCGpB3I3AACkCADcCACAAQdSNwAApAgA3AgALHwAgAEEIakHsjcAAKQIANwIAIABB5I3AACkCADcCAAsdACAABEAgACABEEMAC0GQkMAAQSNBpJDAABAjAAsRACAAIAFBAXRBAXIgAhAjAAsWACAAKAIAIAEgAiAAKAIEKAIMEQIAC+cGAQV/An8CQAJAAkACQAJAAkACQCAAQQRrIgcoAgAiCEF4cSIEQQRBCCAIQQNxIgUbIAFqTwRAIAVBACABQSdqIgYgBEkbDQECQCACQQlPBEAgAiADEBEiAg0BQQAMCgtBACECIANBzP97Sw0IQRAgA0ELakF4cSADQQtJGyEBIABBCGshBiAFRQRAIAZFIAFBgAJJciAEIAFrQYCACEsgASAET3JyDQcgAAwKCyAEIAZqIQUCQCABIARLBEAgBUHklsAAKAIARg0BQeCWwAAoAgAgBUcEQCAFKAIEIghBAnENCSAIQXhxIgggBGoiBCABSQ0JIAUgCBASIAQgAWsiBUEQTwRAIAcgASAHKAIAQQFxckECcjYCACABIAZqIgEgBUEDcjYCBCAEIAZqIgQgBCgCBEEBcjYCBCABIAUQEAwJCyAHIAQgBygCAEEBcXJBAnI2AgAgBCAGaiIBIAEoAgRB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Yy9zbGljZS9zb3J0L3N0YWJsZS9xdWlja3NvcnQucnMAL2hvbWUvZ2VycmllLy5ydXN0dXAvdG9vbGNoYWlucy9zdGFibGUteDg2XzY0LXVua25vd24tbGludXgtZ251L2xpYi9ydXN0bGliL3NyYy9ydXN0L2xpYnJhcnkvc3RkL3NyYy9zeXMvdGhyZWFkX2xvY2FsL25vX3RocmVhZHMucnMAL2hvbWUvZ2VycmllLy5ydXN0dXAvdG9vbGNoYWlucy9zdGFibGUteDg2XzY0LXVua25vd24tbGludXgtZ251L2xpYi9ydXN0bGliL3NyYy9ydXN0L2xpYnJhcnkvYWxsb2Mvc3JjL3N0ci5ycwAvcnVzdGMvNGE0ZWY0OTNlM2ExNDg4YzZlMzIxNTcwMjM4MDg0YjM4OTQ4ZjZkYi9saWJyYXJ5L2NvcmUvc3JjL2ZtdC9udW0ucnMAL3J1c3QvZGVwcy9oYXNoYnJvd24tMC4xNi4xL3NyYy9yYXcvbW9kLnJzAC9ydXN0Yy80YTRlZjQ5M2UzYTE0ODhjNmUzMjE1NzAyMzgwODRiMzg5NDhmNmRiL2xpYnJhcnkvYWxsb2Mvc3JjL3Jhd192ZWMvbW9kLnJzAC9ydXN0L2RlcHMvZGxtYWxsb2MtMC4yLjExL3NyYy9kbG1hbGxvYy5ycwBzcmMvbGliLnJzAAAAADgBEACEAAAASgAAAB8AAAA4ARAAhAAAAEQAAAAXAAAAogMQAAoAAABSAQAAHwAAAC8qKiovLy8vCi8vYiIiIgEiXCIA8QMQAAIAAADwAxAAAQAAAKIDEAAKAAAAtQAAAE4AAAAAAAAA//////////8YBBAAQbCIwAALsAKiAxAACgAAAOMAAABKAAAAogMQAAoAAADvAAAARwAAAKIDEAAKAAAAFAEAADcAAACiAxAACgAAADEBAAA0AAAAogMQAAoAAAAiAQAAPwAAAKIDEAAKAAAA/QAAAEkAAABBdHRlbXB0ZWQgdG8gaW5pdGlhbGl6ZSB0aHJlYWQtbG9jYWwgd2hpbGUgaXQgaXMgYmVpbmcgZHJvcHBlZAAAvQEQAIMAAABrAAAADQAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAEGii8AACzMCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAwMDAwMDAwMDAwMDAwMDBAQEBAQAQeCLwAALswdtaWQgPiBsZW4AAABBAhAAbQAAALEAAAAWAAAAYXR0ZW1wdCB0byBqb2luIGludG8gY29sbGVjdGlvbiB3aXRoIGxlbiA+IHVzaXplOjpNQVgAAABBAhAAbQAAAJoAAAAKAAAAogMQAAoAAADeAAAAMQAAAGNsb3N1cmUgaW52b2tlZCByZWN1cnNpdmVseSBvciBhZnRlciBiZWluZyBkcm9wcGVkQXR0ZW1wdGVkIHRvIGluaXRpYWxpemUgdGhyZWFkLWxvY2FsIHdoaWxlIGl0IGlzIGJlaW5nIGRyb3BwZWS9ARAAgwAAAGsAAAANAAAAbV3L1ixQ62N4QaZXcRuLuSPKO0qmd3yTQmNJr5dvsoQOAAAADAAAAAQAAAAPAAAAEAAAABEAAAAAAAAACAAAAAQAAAASAAAAEwAAABQAAAAVAAAAFgAAABAAAAAEAAAAFwAAABgAAAAZAAAAGgAAAAAAAAAIAAAABAAAABsAAABhc3NlcnRpb24gZmFpbGVkOiBwc2l6ZSA+PSBzaXplICsgbWluX292ZXJoZWFkAAB3AxAAKgAAALEEAAAJAAAAYXNzZXJ0aW9uIGZhaWxlZDogcHNpemUgPD0gc2l6ZSArIG1heF9vdmVyaGVhZAAAdwMQACoAAAC3BAAADQAAAA4AAAAMAAAABAAAABwAAABIYXNoIHRhYmxlIGNhcGFjaXR5IG92ZXJmbG93+wIQACoAAAAlAAAAKAAAAGNhcGFjaXR5IG92ZXJmbG93AAAAJgMQAFAAAAAcAAAABQAAADAwMDEwMjAzMDQwNTA2MDcwODA5MTAxMTEyMTMxNDE1MTYxNzE4MTkyMDIxMjIyMzI0MjUyNjI3MjgyOTMwMzEzMjMzMzQzNTM2MzczODM5NDA0MTQyNDM0NDQ1NDY0NzQ4NDk1MDUxNTI1MzU0NTU1NjU3NTg1OTYwNjE2MjYzNjQ2NTY2Njc2ODY5NzA3MTcyNzM3NDc1NzY3Nzc4Nzk4MDgxODI4Mzg0ODU4Njg3ODg4OTkwOTE5MjkzOTQ5NTk2OTc5ODk5rwIQAEsAAABXAgAABQAAAHVzZXItcHJvdmlkZWQgY29tcGFyaXNvbiBmdW5jdGlvbiBkb2VzIG5vdCBjb3JyZWN0bHkgaW1wbGVtZW50IGEgdG90YWwgb3JkZXLYABAAXwAAAFwDAAAFAAAAY2FsbGVkIGBPcHRpb246OnVud3JhcCgpYCBvbiBhIGBOb25lYCB2YWx1ZQB7CXByb2R1Y2VycwIIbGFuZ3VhZ2UBBFJ1c3QADHByb2Nlc3NlZC1ieQMFcnVzdGMdMS45NC4wICg0YTRlZjQ5M2UgMjAyNi0wMy0wMikGd2FscnVzBjAuMjAuMwx3YXNtLWJpbmRnZW4SMC4yLjkyICgyYTRhNDkzNjIpAGsPdGFyZ2V0X2ZlYXR1cmVzBisPbXV0YWJsZS1nbG9iYWxzKxNub250cmFwcGluZy1mcHRvaW50KwtidWxrLW1lbW9yeSsIc2lnbi1leHQrD3JlZmVyZW5jZS10eXBlcysKbXVsdGl2YWx1ZQ==");

// main.ts
var DEFAULT_SETTINGS = {
  documentPath: "UNKNOWN",
  applicationExtension: ".java",
  unitTestPath: "UNKNOWN",
  sleepLength: 0,
  applicationPath: "UNKNOWN",
  groupBySize: 0,
  dir: "UNKNOWN",
  work: "UNKNOWN",
  start: "UNKNOWN",
  path: "UNKNOWN",
  extension: "UNKNOWN",
  destExtension: "UNKNOWN"
};
var VERSION = "1.0.1";
var _VersionSelectionModal = class extends import_obsidian2.Modal {
  constructor(app2) {
    super(app2);
    this.resolvePromise = null;
    this.rejectPromise = null;
    this.selectedVersion = "version1";
  }
  static async selectVersion(app2) {
    if (_VersionSelectionModal.currentModal) {
      _VersionSelectionModal.currentModal.close();
    }
    const modal = new _VersionSelectionModal(app2);
    _VersionSelectionModal.currentModal = modal;
    return new Promise((resolve, reject) => {
      modal.resolvePromise = resolve;
      modal.rejectPromise = reject;
      modal.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Select Version" });
    const radioContainer = contentEl.createDiv();
    radioContainer.style.marginBottom = "20px";
    const version1Container = radioContainer.createDiv();
    version1Container.style.marginBottom = "10px";
    const version1Radio = version1Container.createEl("input", {
      type: "radio",
      value: "version1",
      attr: { id: "version1" }
    });
    version1Container.createEl("label", { text: " Version1", attr: { for: "version1" } });
    const version2Container = radioContainer.createDiv();
    version2Container.style.marginBottom = "10px";
    const version2Radio = version2Container.createEl("input", {
      type: "radio",
      value: "version2",
      attr: { id: "version2" }
    });
    version2Container.createEl("label", { text: " Version2", attr: { for: "version2" } });
    version1Radio.checked = true;
    version1Radio.addEventListener("change", () => {
      if (version1Radio.checked)
        this.selectedVersion = "version1";
    });
    version2Radio.addEventListener("change", () => {
      if (version2Radio.checked)
        this.selectedVersion = "version2";
    });
    const buttonContainer = contentEl.createDiv();
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "10px";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.marginTop = "20px";
    const cancelBtn = buttonContainer.createEl("button", { text: "Cancel" });
    cancelBtn.addEventListener("click", () => {
      this.close();
      if (this.rejectPromise)
        this.rejectPromise();
    });
    const submitBtn = buttonContainer.createEl("button", {
      text: "Submit",
      cls: "mod-cta"
    });
    submitBtn.addEventListener("click", () => {
      this.close();
      if (this.resolvePromise)
        this.resolvePromise(this.selectedVersion);
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    _VersionSelectionModal.currentModal = null;
  }
};
var VersionSelectionModal = _VersionSelectionModal;
VersionSelectionModal.currentModal = null;
var SourceScanner = class extends import_obsidian2.Plugin {
  constructor(app2, manifest) {
    super(app2, manifest);
    this.intervalHandle = void 0;
    this.scanSource = new ScanSource();
    this.app = app2;
    this.utils = new Utils(app2);
  }
  checkExecutableExists(executablePath) {
    return (0, import_fs3.existsSync)(executablePath);
  }
  getPlatformPathAndName() {
    const platform = process.platform;
    const adapter = this.app.vault.adapter;
    let executablePath = "";
    let workFolder = "";
    if (adapter instanceof import_obsidian2.FileSystemAdapter) {
      if (platform === "win32") {
        const basePath = adapter.getBasePath() + "\\" + this.app.vault.configDir + "\\plugins\\source-scanner";
        executablePath = basePath + "\\get-comments.exe";
        if (this.settings.work.startsWith("\\")) {
          workFolder = this.settings.work;
        } else {
          workFolder = "\\" + this.settings.work;
        }
      } else if (platform === "darwin") {
        const basePath = adapter.getBasePath() + "/" + this.app.vault.configDir + "/plugins/source-scanner";
        executablePath = basePath + "/get-comments-macos";
        if (this.settings.work.startsWith("/")) {
          workFolder = this.settings.work;
        } else {
          workFolder = "/" + this.settings.work;
        }
      } else if (platform === "linux") {
        const basePath = adapter.getBasePath() + "/" + this.app.vault.configDir + "/plugins/source-scanner";
        executablePath = basePath + "/get-comments-linux";
        if (this.settings.work.startsWith("/")) {
          workFolder = this.settings.work;
        } else {
          workFolder = "/" + this.settings.work;
        }
      } else {
        new InfoModal(this.app, "Unsupported Platform", `Unsupported platform: ${platform}`).open();
        return [false];
      }
      return [true, executablePath, workFolder];
    }
    return [false];
  }
  async checkCLIVersion() {
    const parameters = ["-ver"];
    const path2 = this.getPlatformPathAndName();
    if (path2[0]) {
      const executablePath = path2[1];
      if (!this.checkExecutableExists(executablePath)) {
        new InfoModal(this.app, "Executable Not Found", `Executable not found: ${executablePath}`).open();
        console.error(`Executable not found: ${executablePath}`);
      }
      const result = (0, import_child_process.spawnSync)(executablePath, parameters);
      const version = String(result.stdout).trim();
      if (version != VERSION) {
        const modal = new InfoModal(this.app, "CLI Version mismatch - plugin version is [" + VERSION + "]", `CLI Version: ` + version);
        modal.open();
        await modal.getResult();
        throw new Error("Version mismatch");
      }
    }
  }
  async triggerScan() {
    if (this.settings.dir == "UNKNOWN") {
      new InfoModal(this.app, "Configuration Required", "Please configure plugin before using").open();
      return;
    }
    const adapter = this.app.vault.adapter;
    const parameters = [
      "-dir",
      this.settings.dir,
      "-start",
      this.settings.start,
      "-path",
      this.settings.path,
      "-ext",
      this.settings.extension,
      "-dest",
      this.settings.destExtension
    ];
    await this.checkCLIVersion().then((data) => {
      const path2 = this.getPlatformPathAndName();
      if (path2[0]) {
        const executablePath = path2[1];
        const workFolder = path2[2];
        if (!this.checkExecutableExists(executablePath)) {
          new InfoModal(this.app, "Executable Not Found", `Executable not found: ${executablePath}`).open();
          console.error(`Executable not found: ${executablePath}`);
          return;
        }
        if (adapter instanceof import_obsidian2.FileSystemAdapter) {
          const workPath = adapter.getBasePath() + workFolder;
          const child = (0, import_child_process.spawn)(executablePath, parameters.concat(["-work", workPath]));
          child.stdout.on("data", (data2) => {
            new InfoModal(this.app, "Process Error", `Error: ${data2}`).open();
          });
          child.stderr.on("data", (data2) => {
            console.error(`stderr: ${data2}`);
            new InfoModal(this.app, "Process Error", `Error: ${data2}`).open();
          });
          child.on("error", (error) => {
            console.error(`Failed to start process: ${error}`);
            new InfoModal(this.app, "Process Failed", `Failed to start process: ${error.message}`).open();
          });
          child.on("close", (code) => {
            if (code === 0) {
              new InfoModal(this.app, "Scan Complete", "Scan completed successfully").open();
            } else {
              new InfoModal(this.app, "Scan Failed", `Scan failed with exit code ${code}`).open();
            }
          });
        }
      }
    }).catch((err) => console.warn("scan code"));
  }
  async handleVersionSelection() {
    try {
      const selectedVersion = await VersionSelectionModal.selectVersion(app);
      console.log("Selected:", selectedVersion);
      return selectedVersion;
    } catch (error) {
      console.log("User cancelled");
    }
    return "cancel";
  }
  async onload() {
    await this.loadSettings();
    const path2 = this.getPlatformPathAndName();
    var version = "";
    if (path2[0]) {
      const executablePath = path2[1];
      if (!this.checkExecutableExists(executablePath)) {
        version = "version1";
      }
    }
    if (version === "") {
      version = await this.handleVersionSelection();
    }
    if (version === "cancel") {
      version = "version1";
    }
    this.version = version;
    if (version === "version1") {
      var sbItem = this.addStatusBarItem();
      sbItem.setText("Comment scanner OFF");
      const ribbonIconEl = this.addRibbonIcon("view", "Comment Scanner TS", (evt) => {
        if (this.intervalHandle == void 0) {
          sbItem.setText("Comment scanner ON");
          this.intervalHandle = this.scanSource.init(this.app, this, scan_for_comments);
        } else {
          sbItem.setText("Comment scanner OFF");
          clearInterval(this.intervalHandle);
          this.intervalHandle = void 0;
        }
      });
      ribbonIconEl.addClass("my-plugin-ribbon-class");
      const statusBarItemEl = this.addStatusBarItem();
      statusBarItemEl.setText("Status Bar Text");
      this.addCommand({
        id: "source-scanner-solution-files",
        name: "Create solution files",
        callback: () => {
          if (this.settings.documentPath == "UNKNOWN") {
            const notice = new import_obsidian2.Notice("Please configure solution scanner portion before using it.", 0);
          } else {
            const docFolders = this.utils.createFolders(this.settings.documentPath);
            const crossCuttingConcerns = new CrossCuttingConcerns(this.app, docFolders);
            crossCuttingConcerns.generateCrossCuttingConcerns();
          }
        }
      });
      this.addCommand({
        id: "source-scanner-marker-table",
        name: "Create marker table",
        callback: () => {
          const docFolders = this.utils.createFolders(this.settings.documentPath);
          const markerGroupList = new MarkerGroupList(this.app, docFolders);
          markerGroupList.generateMakerGroupList();
        }
      });
      this.addCommand({
        id: "sample-editor-command",
        name: "Sample editor command",
        editorCallback: (editor, view) => {
          console.log(editor.getSelection());
          editor.replaceSelection("Sample Editor Command");
        }
      });
      this.registerDomEvent(document, "click", (evt) => {
        console.log("click", evt);
      });
      this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1e3));
      await obsidian_rust_plugin_default(Promise.resolve(obsidian_rust_plugin_bg_default));
      this.addSettingTab(new ScannerSettingsTab(this.app, this, "version1"));
    } else {
      await this.loadSettings();
      this.addRibbonIcon("eye", "Scan text files for comment lines", async (_evt) => {
        await this.triggerScan();
      });
      this.addCommand({
        id: "scan-text-files",
        name: "Scan text files for comment lines",
        callback: async () => {
          await this.triggerScan();
        }
      });
      this.addSettingTab(new ScannerSettingsTab(this.app, this, "version2"));
    }
  }
  onunload() {
    if (this.intervalHandle != void 0) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = void 0;
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var InfoModal = class extends import_obsidian2.Modal {
  constructor(app2, title, message) {
    super(app2);
    this.title = title;
    this.message = message;
    this.promise = new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: this.title });
    contentEl.createEl("p", { text: this.message });
    const buttonContainer = contentEl.createDiv({
      cls: "modal-button-container"
    });
    const okButton = buttonContainer.createEl("button", { text: "OK" });
    okButton.addEventListener("click", () => {
      this.close();
    });
    this.scope.register([], "Enter", () => {
      this.close();
      return false;
    });
  }
  getResult() {
    return this.promise;
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJ0cy9TZXR0aW5nc1RhYi50cyIsICJ0cy9TY2FuU291cmNlLnRzIiwgInRzL1V0aWxzLnRzIiwgInRzL0RvY0ZvbGRlcnMudHMiLCAidHMvQ3Jvc3NDdXR0aW5nQ29uY2VybnMudHMiLCAidHMvTWFya2VyR3JvdXBMaXN0LnRzIiwgInBrZy9vYnNpZGlhbl9ydXN0X3BsdWdpbi5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcblx0QXBwLFxuXHRFZGl0b3IsXG5cdEZpbGVTeXN0ZW1BZGFwdGVyLFxuXHRNYXJrZG93blZpZXcsXG5cdE1vZGFsLFxuXHRQbHVnaW5NYW5pZmVzdCxcblx0UGx1Z2luLFxuXHRQbHVnaW5TZXR0aW5nVGFiLFxuXHROb3RpY2Vcbn0gZnJvbSAnb2JzaWRpYW4nO1xuXG5pbXBvcnQgeyBTY2FubmVyU2V0dGluZ3NUYWIgfSBmcm9tIFwiLi90cy9TZXR0aW5nc1RhYlwiO1xuaW1wb3J0IHsgU2NhblNvdXJjZSB9IGZyb20gJy4vdHMvU2NhblNvdXJjZSdcbmltcG9ydCB7IENyb3NzQ3V0dGluZ0NvbmNlcm5zIH0gZnJvbSAnLi90cy9Dcm9zc0N1dHRpbmdDb25jZXJucyc7XG5pbXBvcnQgeyBNYXJrZXJHcm91cExpc3QgfSBmcm9tICcuL3RzL01hcmtlckdyb3VwTGlzdCc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJy4vdHMvVXRpbHMnXG5pbXBvcnQgeyBzcGF3biwgc3Bhd25TeW5jIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwiZnNcIjtcblxuaW1wb3J0ICogYXMgbGV4ZXJfcGx1Z2luIGZyb20gXCIuL3BrZy9vYnNpZGlhbl9ydXN0X3BsdWdpbi5qc1wiO1xuaW1wb3J0ICogYXMgbGV4ZXJfd2FzbSBmcm9tICcuL3BrZy9vYnNpZGlhbl9ydXN0X3BsdWdpbl9iZy53YXNtJztcblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnXG5cbmludGVyZmFjZSBNeVBsdWdpblNldHRpbmdzIHtcblx0ZG9jdW1lbnRQYXRoOiBzdHJpbmc7XG5cdGFwcGxpY2F0aW9uRXh0ZW5zaW9uOiBzdHJpbmc7XG5cdHNsZWVwTGVuZ3RoOiBudW1iZXI7XG5cdGFwcGxpY2F0aW9uUGF0aDogc3RyaW5nO1xuXHR1bml0VGVzdFBhdGg6IHN0cmluZztcblx0Z3JvdXBCeVNpemU6IG51bWJlcjtcblxuXHRkaXI6IHN0cmluZztcblx0d29yazogc3RyaW5nO1xuXHRzdGFydDogc3RyaW5nO1xuXHRwYXRoOiBzdHJpbmc7XG5cdGV4dGVuc2lvbjogc3RyaW5nO1xuXHRkZXN0RXh0ZW5zaW9uOiBzdHJpbmc7XG5cbn1cblxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogTXlQbHVnaW5TZXR0aW5ncyA9IHtcblx0ZG9jdW1lbnRQYXRoOiAnVU5LTk9XTicsXG5cdGFwcGxpY2F0aW9uRXh0ZW5zaW9uOiAnLmphdmEnLFxuXHR1bml0VGVzdFBhdGg6IFwiVU5LTk9XTlwiLFxuXHRzbGVlcExlbmd0aDogMC4wLFxuXHRhcHBsaWNhdGlvblBhdGg6ICdVTktOT1dOJyxcblx0Z3JvdXBCeVNpemU6IDAuMCxcblxuXHRkaXI6IFwiVU5LTk9XTlwiLFxuXHR3b3JrOiBcIlVOS05PV05cIixcblx0c3RhcnQ6IFwiVU5LTk9XTlwiLFxuXHRwYXRoOiBcIlVOS05PV05cIixcblx0ZXh0ZW5zaW9uOiBcIlVOS05PV05cIixcblx0ZGVzdEV4dGVuc2lvbjogXCJVTktOT1dOXCIsXG59XG5cbmNvbnN0IFZFUlNJT04gPSBcIjEuMC4xXCI7XG5cbi8qKlxuICogQSBtb2RhbCBkaWFsb2cgdGhhdCBhbGxvd3MgdXNlcnMgdG8gc2VsZWN0IGJldHdlZW4gdHdvIHZlcnNpb25zIG9mIHRoZSBwbHVnaW4uXG4gKiBQcmVzZW50cyByYWRpbyBidXR0b25zIGZvciB2ZXJzaW9uMSBhbmQgdmVyc2lvbjIgd2l0aCBPSy9DYW5jZWwgYnV0dG9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZlcnNpb25TZWxlY3Rpb25Nb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cHJpdmF0ZSBzdGF0aWMgY3VycmVudE1vZGFsOiBWZXJzaW9uU2VsZWN0aW9uTW9kYWwgfCBudWxsID0gbnVsbDtcblx0cHJpdmF0ZSByZXNvbHZlUHJvbWlzZTogKCh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuXHRwcml2YXRlIHJlamVjdFByb21pc2U6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuXHRwcml2YXRlIHNlbGVjdGVkVmVyc2lvbjogc3RyaW5nID0gJ3ZlcnNpb24xJztcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBWZXJzaW9uU2VsZWN0aW9uTW9kYWwgaW5zdGFuY2UuXG5cdCAqIEBwYXJhbSBhcHAgVGhlIE9ic2lkaWFuIGFwcCBpbnN0YW5jZVxuXHQgKi9cblx0cHJpdmF0ZSBjb25zdHJ1Y3RvcihhcHA6IEFwcCkge1xuXHRcdHN1cGVyKGFwcCk7XG5cdH1cblxuXHQvKipcblx0ICogU3RhdGljIG1ldGhvZCB0byBvcGVuIGEgdmVyc2lvbiBzZWxlY3Rpb24gbW9kYWwgYW5kIGF3YWl0IHVzZXIgc2VsZWN0aW9uLlxuXHQgKiBFbnN1cmVzIG9ubHkgb25lIGluc3RhbmNlIG9mIHRoZSBtb2RhbCBpcyBvcGVuIGF0IGEgdGltZS5cblx0ICogQHBhcmFtIGFwcCBUaGUgT2JzaWRpYW4gYXBwIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBzZWxlY3RlZCB2ZXJzaW9uIChcInZlcnNpb24xXCIgb3IgXCJ2ZXJzaW9uMlwiKVxuXHQgKiAgICAgICAgICBvciByZWplY3RzIGlmIHRoZSB1c2VyIGNhbmNlbHMgdGhlIHNlbGVjdGlvblxuXHQgKi9cblx0c3RhdGljIGFzeW5jIHNlbGVjdFZlcnNpb24oYXBwOiBBcHApOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdC8vIENsb3NlIGFueSBleGlzdGluZyBtb2RhbFxuXHRcdGlmIChWZXJzaW9uU2VsZWN0aW9uTW9kYWwuY3VycmVudE1vZGFsKSB7XG5cdFx0XHRWZXJzaW9uU2VsZWN0aW9uTW9kYWwuY3VycmVudE1vZGFsLmNsb3NlKCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbW9kYWwgPSBuZXcgVmVyc2lvblNlbGVjdGlvbk1vZGFsKGFwcCk7XG5cdFx0VmVyc2lvblNlbGVjdGlvbk1vZGFsLmN1cnJlbnRNb2RhbCA9IG1vZGFsO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdG1vZGFsLnJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcblx0XHRcdG1vZGFsLnJlamVjdFByb21pc2UgPSByZWplY3Q7XG5cdFx0XHRtb2RhbC5vcGVuKCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gdGhlIG1vZGFsIGlzIG9wZW5lZC5cblx0ICogU2V0cyB1cCB0aGUgbW9kYWwgVUkgd2l0aCB2ZXJzaW9uIHNlbGVjdGlvbiByYWRpbyBidXR0b25zIGFuZCBhY3Rpb24gYnV0dG9ucy5cblx0ICovXG5cdG9uT3BlbigpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblxuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdTZWxlY3QgVmVyc2lvbicgfSk7XG5cblx0XHQvLyBDcmVhdGUgY29udGFpbmVyIGZvciByYWRpbyBidXR0b25zXG5cdFx0Y29uc3QgcmFkaW9Db250YWluZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KCk7XG5cdFx0cmFkaW9Db250YWluZXIuc3R5bGUubWFyZ2luQm90dG9tID0gJzIwcHgnO1xuXG5cdFx0Ly8gVmVyc2lvbiAxIHJhZGlvXG5cdFx0Y29uc3QgdmVyc2lvbjFDb250YWluZXIgPSByYWRpb0NvbnRhaW5lci5jcmVhdGVEaXYoKTtcblx0XHR2ZXJzaW9uMUNvbnRhaW5lci5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnMTBweCc7XG5cblx0XHRjb25zdCB2ZXJzaW9uMVJhZGlvID0gdmVyc2lvbjFDb250YWluZXIuY3JlYXRlRWwoJ2lucHV0Jywge1xuXHRcdFx0dHlwZTogJ3JhZGlvJyxcblx0XHRcdHZhbHVlOiAndmVyc2lvbjEnLFxuXHRcdFx0YXR0cjogeyBpZDogJ3ZlcnNpb24xJyB9XG5cdFx0fSk7XG5cdFx0dmVyc2lvbjFDb250YWluZXIuY3JlYXRlRWwoJ2xhYmVsJywgeyB0ZXh0OiAnIFZlcnNpb24xJywgYXR0cjogeyBmb3I6ICd2ZXJzaW9uMScgfSB9KTtcblxuXHRcdC8vIFZlcnNpb24gMiByYWRpb1xuXHRcdGNvbnN0IHZlcnNpb24yQ29udGFpbmVyID0gcmFkaW9Db250YWluZXIuY3JlYXRlRGl2KCk7XG5cdFx0dmVyc2lvbjJDb250YWluZXIuc3R5bGUubWFyZ2luQm90dG9tID0gJzEwcHgnO1xuXG5cdFx0Y29uc3QgdmVyc2lvbjJSYWRpbyA9IHZlcnNpb24yQ29udGFpbmVyLmNyZWF0ZUVsKCdpbnB1dCcsIHtcblx0XHRcdHR5cGU6ICdyYWRpbycsXG5cdFx0XHR2YWx1ZTogJ3ZlcnNpb24yJyxcblx0XHRcdGF0dHI6IHsgaWQ6ICd2ZXJzaW9uMicgfVxuXHRcdH0pO1xuXHRcdHZlcnNpb24yQ29udGFpbmVyLmNyZWF0ZUVsKCdsYWJlbCcsIHsgdGV4dDogJyBWZXJzaW9uMicsIGF0dHI6IHsgZm9yOiAndmVyc2lvbjInIH0gfSk7XG5cblx0XHQvLyBTZXQgZGVmYXVsdCBzZWxlY3Rpb25cblx0XHR2ZXJzaW9uMVJhZGlvLmNoZWNrZWQgPSB0cnVlO1xuXG5cdFx0Ly8gQWRkIGV2ZW50IGxpc3RlbmVyc1xuXHRcdHZlcnNpb24xUmFkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuXHRcdFx0aWYgKHZlcnNpb24xUmFkaW8uY2hlY2tlZCkgdGhpcy5zZWxlY3RlZFZlcnNpb24gPSAndmVyc2lvbjEnO1xuXHRcdH0pO1xuXG5cdFx0dmVyc2lvbjJSYWRpby5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG5cdFx0XHRpZiAodmVyc2lvbjJSYWRpby5jaGVja2VkKSB0aGlzLnNlbGVjdGVkVmVyc2lvbiA9ICd2ZXJzaW9uMic7XG5cdFx0fSk7XG5cblx0XHQvLyBCdXR0b24gY29udGFpbmVyXG5cdFx0Y29uc3QgYnV0dG9uQ29udGFpbmVyID0gY29udGVudEVsLmNyZWF0ZURpdigpO1xuXHRcdGJ1dHRvbkNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuXHRcdGJ1dHRvbkNvbnRhaW5lci5zdHlsZS5nYXAgPSAnMTBweCc7XG5cdFx0YnV0dG9uQ29udGFpbmVyLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtZW5kJztcblx0XHRidXR0b25Db250YWluZXIuc3R5bGUubWFyZ2luVG9wID0gJzIwcHgnO1xuXG5cdFx0Ly8gQ2FuY2VsIGJ1dHRvblxuXHRcdGNvbnN0IGNhbmNlbEJ0biA9IGJ1dHRvbkNvbnRhaW5lci5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnQ2FuY2VsJyB9KTtcblx0XHRjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRpZiAodGhpcy5yZWplY3RQcm9taXNlKSB0aGlzLnJlamVjdFByb21pc2UoKTtcblx0XHR9KTtcblxuXHRcdC8vIFN1Ym1pdCBidXR0b25cblx0XHRjb25zdCBzdWJtaXRCdG4gPSBidXR0b25Db250YWluZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcblx0XHRcdHRleHQ6ICdTdWJtaXQnLFxuXHRcdFx0Y2xzOiAnbW9kLWN0YSdcblx0XHR9KTtcblx0XHRzdWJtaXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRpZiAodGhpcy5yZXNvbHZlUHJvbWlzZSkgdGhpcy5yZXNvbHZlUHJvbWlzZSh0aGlzLnNlbGVjdGVkVmVyc2lvbik7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gdGhlIG1vZGFsIGlzIGNsb3NlZC5cblx0ICogQ2xlYW5zIHVwIHRoZSBtb2RhbCBVSSBhbmQgcmVzZXRzIHRoZSBzdGF0aWMgY3VycmVudE1vZGFsIHJlZmVyZW5jZS5cblx0ICovXG5cdG9uQ2xvc2UoKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0VmVyc2lvblNlbGVjdGlvbk1vZGFsLmN1cnJlbnRNb2RhbCA9IG51bGw7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU291cmNlU2Nhbm5lciBleHRlbmRzIFBsdWdpbiB7XG5cdGFwcDogQXBwO1xuXHRzZXR0aW5nczogTXlQbHVnaW5TZXR0aW5ncztcblx0aW50ZXJ2YWxIYW5kbGU6IGFueSA9IHVuZGVmaW5lZDtcblx0c2NhblNvdXJjZSA9IG5ldyBTY2FuU291cmNlKCk7XG5cdHV0aWxzOiBVdGlscztcblx0dmVyc2lvbjogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBTb3VyY2VTY2FubmVyIHBsdWdpbi5cblx0ICogQHBhcmFtIGFwcCBUaGUgT2JzaWRpYW4gYXBwIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBtYW5pZmVzdCBUaGUgcGx1Z2luIG1hbmlmZXN0XG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgbWFuaWZlc3Q6IFBsdWdpbk1hbmlmZXN0KSB7XG5cdFx0c3VwZXIoYXBwLCBtYW5pZmVzdCk7XG5cdFx0dGhpcy5hcHAgPSBhcHA7XG5cdFx0dGhpcy51dGlscyA9IG5ldyBVdGlscyhhcHApO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhbiBleGVjdXRhYmxlIGV4aXN0cyBhdCB0aGUgZ2l2ZW4gcGF0aC5cblx0ICogQHBhcmFtIGV4ZWN1dGFibGVQYXRoIFRoZSBwYXRoIHRvIHRoZSBleGVjdXRhYmxlIHRvIGNoZWNrXG5cdCAqIEByZXR1cm5zIHRydWUgaWYgdGhlIGV4ZWN1dGFibGUgZXhpc3RzLCBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdHByaXZhdGUgY2hlY2tFeGVjdXRhYmxlRXhpc3RzKGV4ZWN1dGFibGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gZXhpc3RzU3luYyhleGVjdXRhYmxlUGF0aCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgcGxhdGZvcm0tc3BlY2lmaWMgZXhlY3V0YWJsZSBwYXRoIGFuZCB3b3JrIGZvbGRlci5cblx0ICogRGV0ZXJtaW5lcyB0aGUgY29ycmVjdCBleGVjdXRhYmxlIHBhdGggYmFzZWQgb24gdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbVxuXHQgKiBhbmQgY29uc3RydWN0cyB0aGUgd29yayBmb2xkZXIgcGF0aC5cblx0ICogQHJldHVybnMgQSB0dXBsZSBjb250YWluaW5nOlxuXHQgKiAgIC0gYm9vbGVhbjogdHJ1ZSBpZiBwbGF0Zm9ybSBpcyBzdXBwb3J0ZWQgYW5kIGFkYXB0ZXIgaXMgRmlsZVN5c3RlbUFkYXB0ZXJcblx0ICogICAtIHN0cmluZz86IFRoZSBleGVjdXRhYmxlIHBhdGggKGlmIHBsYXRmb3JtIHN1cHBvcnRlZClcblx0ICogICAtIHN0cmluZz86IFRoZSB3b3JrIGZvbGRlciBwYXRoIChpZiBwbGF0Zm9ybSBzdXBwb3J0ZWQpXG5cdCAqL1xuXHRwcml2YXRlIGdldFBsYXRmb3JtUGF0aEFuZE5hbWUoKTogW2Jvb2xlYW4sIHN0cmluZz8sIHN0cmluZz9dIHtcblx0XHRjb25zdCBwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm07IC8vIGUuZy4sICdkYXJ3aW4nLCAnd2luMzInLCAnbGludXgnXG5cdFx0Y29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7XG5cblx0XHRsZXQgZXhlY3V0YWJsZVBhdGggPSBcIlwiO1xuXHRcdGxldCB3b3JrRm9sZGVyID0gXCJcIjtcblx0XHRpZiAoYWRhcHRlciBpbnN0YW5jZW9mIEZpbGVTeXN0ZW1BZGFwdGVyKSB7XG5cdFx0XHRpZiAocGxhdGZvcm0gPT09IFwid2luMzJcIikge1xuXHRcdFx0XHRjb25zdCBiYXNlUGF0aCA9XG5cdFx0XHRcdFx0YWRhcHRlci5nZXRCYXNlUGF0aCgpICtcblx0XHRcdFx0XHRcIlxcXFxcIiArXG5cdFx0XHRcdFx0dGhpcy5hcHAudmF1bHQuY29uZmlnRGlyICtcblx0XHRcdFx0XHRcIlxcXFxwbHVnaW5zXFxcXHNvdXJjZS1zY2FubmVyXCI7XG5cdFx0XHRcdGV4ZWN1dGFibGVQYXRoID0gYmFzZVBhdGggKyBcIlxcXFxnZXQtY29tbWVudHMuZXhlXCI7XG5cdFx0XHRcdGlmICh0aGlzLnNldHRpbmdzLndvcmsuc3RhcnRzV2l0aChcIlxcXFxcIikpIHtcblx0XHRcdFx0XHR3b3JrRm9sZGVyID0gdGhpcy5zZXR0aW5ncy53b3JrO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdvcmtGb2xkZXIgPSBcIlxcXFxcIiArIHRoaXMuc2V0dGluZ3Mud29yaztcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChwbGF0Zm9ybSA9PT0gXCJkYXJ3aW5cIikge1xuXHRcdFx0XHRjb25zdCBiYXNlUGF0aCA9XG5cdFx0XHRcdFx0YWRhcHRlci5nZXRCYXNlUGF0aCgpICtcblx0XHRcdFx0XHRcIi9cIiArXG5cdFx0XHRcdFx0dGhpcy5hcHAudmF1bHQuY29uZmlnRGlyICtcblx0XHRcdFx0XHRcIi9wbHVnaW5zL3NvdXJjZS1zY2FubmVyXCI7XG5cdFx0XHRcdGV4ZWN1dGFibGVQYXRoID0gYmFzZVBhdGggKyBcIi9nZXQtY29tbWVudHMtbWFjb3NcIjtcblx0XHRcdFx0aWYgKHRoaXMuc2V0dGluZ3Mud29yay5zdGFydHNXaXRoKFwiL1wiKSkge1xuXHRcdFx0XHRcdHdvcmtGb2xkZXIgPSB0aGlzLnNldHRpbmdzLndvcms7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d29ya0ZvbGRlciA9IFwiL1wiICsgdGhpcy5zZXR0aW5ncy53b3JrO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHBsYXRmb3JtID09PSBcImxpbnV4XCIpIHtcblx0XHRcdFx0Y29uc3QgYmFzZVBhdGggPVxuXHRcdFx0XHRcdGFkYXB0ZXIuZ2V0QmFzZVBhdGgoKSArXG5cdFx0XHRcdFx0XCIvXCIgK1xuXHRcdFx0XHRcdHRoaXMuYXBwLnZhdWx0LmNvbmZpZ0RpciArXG5cdFx0XHRcdFx0XCIvcGx1Z2lucy9zb3VyY2Utc2Nhbm5lclwiO1xuXHRcdFx0XHRleGVjdXRhYmxlUGF0aCA9IGJhc2VQYXRoICsgXCIvZ2V0LWNvbW1lbnRzLWxpbnV4XCI7XG5cdFx0XHRcdGlmICh0aGlzLnNldHRpbmdzLndvcmsuc3RhcnRzV2l0aChcIi9cIikpIHtcblx0XHRcdFx0XHR3b3JrRm9sZGVyID0gdGhpcy5zZXR0aW5ncy53b3JrO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdvcmtGb2xkZXIgPSBcIi9cIiArIHRoaXMuc2V0dGluZ3Mud29yaztcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bmV3IEluZm9Nb2RhbChcblx0XHRcdFx0XHR0aGlzLmFwcCxcblx0XHRcdFx0XHRcIlVuc3VwcG9ydGVkIFBsYXRmb3JtXCIsXG5cdFx0XHRcdFx0YFVuc3VwcG9ydGVkIHBsYXRmb3JtOiAke3BsYXRmb3JtfWAsXG5cdFx0XHRcdCkub3BlbigpO1xuXHRcdFx0XHRyZXR1cm4gW2ZhbHNlXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBbdHJ1ZSwgZXhlY3V0YWJsZVBhdGgsIHdvcmtGb2xkZXJdO1xuXHRcdH1cblx0XHRyZXR1cm4gW2ZhbHNlXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgdGhlIHZlcnNpb24gb2YgdGhlIENMSSBleGVjdXRhYmxlLlxuXHQgKiBWZXJpZmllcyB0aGF0IHRoZSBDTEkgZXhlY3V0YWJsZSBleGlzdHMgYW5kIHRoYXQgaXRzIHZlcnNpb24gbWF0Y2hlc1xuXHQgKiB0aGUgZXhwZWN0ZWQgcGx1Z2luIHZlcnNpb24uIFNob3dzIGVycm9yIG1vZGFscyBpZiBpc3N1ZXMgYXJlIGZvdW5kLlxuXHQgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIENMSSB2ZXJzaW9uIGRvZXNuJ3QgbWF0Y2ggdGhlIHBsdWdpbiB2ZXJzaW9uXG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIGNoZWNrQ0xJVmVyc2lvbigpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBwYXJhbWV0ZXJzID0gW1wiLXZlclwiXTtcblx0XHRjb25zdCBwYXRoID0gdGhpcy5nZXRQbGF0Zm9ybVBhdGhBbmROYW1lKCk7XG5cblx0XHRpZiAocGF0aFswXSkge1xuXHRcdFx0Y29uc3QgZXhlY3V0YWJsZVBhdGggPSBwYXRoWzFdIGFzIHN0cmluZztcblx0XHRcdC8vIENoZWNrIGlmIGV4ZWN1dGFibGUgZXhpc3RzXG5cdFx0XHRpZiAoIXRoaXMuY2hlY2tFeGVjdXRhYmxlRXhpc3RzKGV4ZWN1dGFibGVQYXRoKSkge1xuXHRcdFx0XHRuZXcgSW5mb01vZGFsKFxuXHRcdFx0XHRcdHRoaXMuYXBwLFxuXHRcdFx0XHRcdFwiRXhlY3V0YWJsZSBOb3QgRm91bmRcIixcblx0XHRcdFx0XHRgRXhlY3V0YWJsZSBub3QgZm91bmQ6ICR7ZXhlY3V0YWJsZVBhdGh9YCxcblx0XHRcdFx0KS5vcGVuKCk7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoYEV4ZWN1dGFibGUgbm90IGZvdW5kOiAke2V4ZWN1dGFibGVQYXRofWApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBOb3cgc3Bhd24gdGhlIHByb2Nlc3Ncblx0XHRcdGNvbnN0IHJlc3VsdCA9IHNwYXduU3luYyhleGVjdXRhYmxlUGF0aCwgcGFyYW1ldGVycyk7XG5cblx0XHRcdGNvbnN0IHZlcnNpb24gPSBTdHJpbmcocmVzdWx0LnN0ZG91dCkudHJpbSgpO1xuXHRcdFx0aWYgKHZlcnNpb24gIT0gVkVSU0lPTikge1xuXHRcdFx0XHRjb25zdCBtb2RhbCA9IG5ldyBJbmZvTW9kYWwoXG5cdFx0XHRcdFx0dGhpcy5hcHAsXG5cdFx0XHRcdFx0XCJDTEkgVmVyc2lvbiBtaXNtYXRjaCAtIHBsdWdpbiB2ZXJzaW9uIGlzIFtcIiArXG5cdFx0XHRcdFx0VkVSU0lPTiArXG5cdFx0XHRcdFx0XCJdXCIsXG5cdFx0XHRcdFx0YENMSSBWZXJzaW9uOiBgICsgdmVyc2lvbixcblx0XHRcdFx0KTtcblx0XHRcdFx0bW9kYWwub3BlbigpO1xuXHRcdFx0XHRhd2FpdCBtb2RhbC5nZXRSZXN1bHQoKTtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVmVyc2lvbiBtaXNtYXRjaFwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgYSBzY2FuIG9mIHRleHQgZmlsZXMgZm9yIGNvbW1lbnQgbGluZXMuXG5cdCAqIEV4ZWN1dGVzIHRoZSBDTEkgdG9vbCB0byBzY2FuIGRpcmVjdG9yaWVzIGZvciBjb21tZW50cyBiYXNlZCBvbiBjb25maWd1cmVkIHNldHRpbmdzLlxuXHQgKiBTaG93cyBhcHByb3ByaWF0ZSBtb2RhbHMgZm9yIGVycm9ycywgcHJvY2VzcyBvdXRwdXQsIGFuZCBjb21wbGV0aW9uIHN0YXR1cy5cblx0ICovXG5cdHByaXZhdGUgYXN5bmMgdHJpZ2dlclNjYW4oKSB7XG5cdFx0aWYgKHRoaXMuc2V0dGluZ3MuZGlyID09IFwiVU5LTk9XTlwiKSB7XG5cdFx0XHRuZXcgSW5mb01vZGFsKFxuXHRcdFx0XHR0aGlzLmFwcCxcblx0XHRcdFx0XCJDb25maWd1cmF0aW9uIFJlcXVpcmVkXCIsXG5cdFx0XHRcdFwiUGxlYXNlIGNvbmZpZ3VyZSBwbHVnaW4gYmVmb3JlIHVzaW5nXCIsXG5cdFx0XHQpLm9wZW4oKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgYWRhcHRlciA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXI7XG5cdFx0Y29uc3QgcGFyYW1ldGVycyA9IFtcblx0XHRcdFwiLWRpclwiLFxuXHRcdFx0dGhpcy5zZXR0aW5ncy5kaXIsXG5cdFx0XHRcIi1zdGFydFwiLFxuXHRcdFx0dGhpcy5zZXR0aW5ncy5zdGFydCxcblx0XHRcdFwiLXBhdGhcIixcblx0XHRcdHRoaXMuc2V0dGluZ3MucGF0aCxcblx0XHRcdFwiLWV4dFwiLFxuXHRcdFx0dGhpcy5zZXR0aW5ncy5leHRlbnNpb24sXG5cdFx0XHRcIi1kZXN0XCIsXG5cdFx0XHR0aGlzLnNldHRpbmdzLmRlc3RFeHRlbnNpb24sXG5cdFx0XTtcblxuXHRcdGF3YWl0IHRoaXMuY2hlY2tDTElWZXJzaW9uKClcblx0XHRcdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHBhdGggPSB0aGlzLmdldFBsYXRmb3JtUGF0aEFuZE5hbWUoKTtcblxuXHRcdFx0XHRpZiAocGF0aFswXSkge1xuXHRcdFx0XHRcdGNvbnN0IGV4ZWN1dGFibGVQYXRoID0gcGF0aFsxXSBhcyBzdHJpbmc7XG5cdFx0XHRcdFx0Y29uc3Qgd29ya0ZvbGRlciA9IHBhdGhbMl0gYXMgc3RyaW5nO1xuXHRcdFx0XHRcdC8vIENoZWNrIGlmIGV4ZWN1dGFibGUgZXhpc3RzXG5cdFx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrRXhlY3V0YWJsZUV4aXN0cyhleGVjdXRhYmxlUGF0aCkpIHtcblx0XHRcdFx0XHRcdG5ldyBJbmZvTW9kYWwoXG5cdFx0XHRcdFx0XHRcdHRoaXMuYXBwLFxuXHRcdFx0XHRcdFx0XHRcIkV4ZWN1dGFibGUgTm90IEZvdW5kXCIsXG5cdFx0XHRcdFx0XHRcdGBFeGVjdXRhYmxlIG5vdCBmb3VuZDogJHtleGVjdXRhYmxlUGF0aH1gLFxuXHRcdFx0XHRcdFx0KS5vcGVuKCk7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKFxuXHRcdFx0XHRcdFx0XHRgRXhlY3V0YWJsZSBub3QgZm91bmQ6ICR7ZXhlY3V0YWJsZVBhdGh9YCxcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGFkYXB0ZXIgaW5zdGFuY2VvZiBGaWxlU3lzdGVtQWRhcHRlcikge1xuXHRcdFx0XHRcdFx0Ly8gTm93IHNwYXduIHRoZSBwcm9jZXNzXG5cdFx0XHRcdFx0XHRjb25zdCB3b3JrUGF0aCA9IGFkYXB0ZXIuZ2V0QmFzZVBhdGgoKSArIHdvcmtGb2xkZXI7XG5cdFx0XHRcdFx0XHRjb25zdCBjaGlsZCA9IHNwYXduKFxuXHRcdFx0XHRcdFx0XHRleGVjdXRhYmxlUGF0aCxcblx0XHRcdFx0XHRcdFx0cGFyYW1ldGVycy5jb25jYXQoW1wiLXdvcmtcIiwgd29ya1BhdGhdKSxcblx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdGNoaWxkLnN0ZG91dC5vbihcImRhdGFcIiwgKGRhdGEpID0+IHtcblx0XHRcdFx0XHRcdFx0bmV3IEluZm9Nb2RhbChcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmFwcCxcblx0XHRcdFx0XHRcdFx0XHRcIlByb2Nlc3MgRXJyb3JcIixcblx0XHRcdFx0XHRcdFx0XHRgRXJyb3I6ICR7ZGF0YX1gLFxuXHRcdFx0XHRcdFx0XHQpLm9wZW4oKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRjaGlsZC5zdGRlcnIub24oXCJkYXRhXCIsIChkYXRhKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYHN0ZGVycjogJHtkYXRhfWApO1xuXHRcdFx0XHRcdFx0XHRuZXcgSW5mb01vZGFsKFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuYXBwLFxuXHRcdFx0XHRcdFx0XHRcdFwiUHJvY2VzcyBFcnJvclwiLFxuXHRcdFx0XHRcdFx0XHRcdGBFcnJvcjogJHtkYXRhfWAsXG5cdFx0XHRcdFx0XHRcdCkub3BlbigpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGNoaWxkLm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBzdGFydCBwcm9jZXNzOiAke2Vycm9yfWApO1xuXHRcdFx0XHRcdFx0XHRuZXcgSW5mb01vZGFsKFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuYXBwLFxuXHRcdFx0XHRcdFx0XHRcdFwiUHJvY2VzcyBGYWlsZWRcIixcblx0XHRcdFx0XHRcdFx0XHRgRmFpbGVkIHRvIHN0YXJ0IHByb2Nlc3M6ICR7ZXJyb3IubWVzc2FnZX1gLFxuXHRcdFx0XHRcdFx0XHQpLm9wZW4oKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRjaGlsZC5vbihcImNsb3NlXCIsIChjb2RlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChjb2RlID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0bmV3IEluZm9Nb2RhbChcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuYXBwLFxuXHRcdFx0XHRcdFx0XHRcdFx0XCJTY2FuIENvbXBsZXRlXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcIlNjYW4gY29tcGxldGVkIHN1Y2Nlc3NmdWxseVwiLFxuXHRcdFx0XHRcdFx0XHRcdCkub3BlbigpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdG5ldyBJbmZvTW9kYWwoXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmFwcCxcblx0XHRcdFx0XHRcdFx0XHRcdFwiU2NhbiBGYWlsZWRcIixcblx0XHRcdFx0XHRcdFx0XHRcdGBTY2FuIGZhaWxlZCB3aXRoIGV4aXQgY29kZSAke2NvZGV9YCxcblx0XHRcdFx0XHRcdFx0XHQpLm9wZW4oKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKChlcnIpID0+IGNvbnNvbGUud2FybihcInNjYW4gY29kZVwiKSk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyB2ZXJzaW9uIHNlbGVjdGlvbiBmb3IgdGhlIHBsdWdpbi5cblx0ICogUHJlc2VudHMgYSBtb2RhbCB0byB0aGUgdXNlciB0byBjaG9vc2UgYmV0d2VlbiB2ZXJzaW9uMSBhbmQgdmVyc2lvbjIuXG5cdCAqIEByZXR1cm5zIFRoZSBzZWxlY3RlZCB2ZXJzaW9uIGFzIGEgc3RyaW5nIChcInZlcnNpb24xXCIsIFwidmVyc2lvbjJcIiwgb3IgXCJjYW5jZWxcIilcblx0ICovXG5cdGFzeW5jIGhhbmRsZVZlcnNpb25TZWxlY3Rpb24oKTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0ZWRWZXJzaW9uID0gYXdhaXQgVmVyc2lvblNlbGVjdGlvbk1vZGFsLnNlbGVjdFZlcnNpb24oYXBwKTtcblx0XHRcdGNvbnNvbGUubG9nKCdTZWxlY3RlZDonLCBzZWxlY3RlZFZlcnNpb24pO1xuXHRcdFx0cmV0dXJuIHNlbGVjdGVkVmVyc2lvbjtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0Y29uc29sZS5sb2coJ1VzZXIgY2FuY2VsbGVkJyk7XG5cdFx0fVxuXHRcdHJldHVybiBcImNhbmNlbFwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBwbHVnaW4gaXMgbG9hZGVkLlxuXHQgKiBJbml0aWFsaXplcyB0aGUgcGx1Z2luLCBsb2FkcyBzZXR0aW5ncywgZGV0ZXJtaW5lcyB3aGljaCB2ZXJzaW9uIHRvIHVzZSxcblx0ICogYW5kIHNldHMgdXAgdGhlIGFwcHJvcHJpYXRlIFVJIGNvbXBvbmVudHMgYW5kIGNvbW1hbmRzIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCB2ZXJzaW9uLlxuXHQgKi9cblx0YXN5bmMgb25sb2FkKCkge1xuXHRcdGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cblx0XHRjb25zdCBwYXRoID0gdGhpcy5nZXRQbGF0Zm9ybVBhdGhBbmROYW1lKCk7XG5cdFx0dmFyIHZlcnNpb24gPSBcIlwiO1xuXHRcdGlmIChwYXRoWzBdKSB7XG5cdFx0XHRjb25zdCBleGVjdXRhYmxlUGF0aCA9IHBhdGhbMV0gYXMgc3RyaW5nO1xuXHRcdFx0Ly8gQ2hlY2sgaWYgZXhlY3V0YWJsZSBleGlzdHNcblx0XHRcdGlmICghdGhpcy5jaGVja0V4ZWN1dGFibGVFeGlzdHMoZXhlY3V0YWJsZVBhdGgpKSB7XG5cdFx0XHRcdHZlcnNpb24gPSBcInZlcnNpb24xXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh2ZXJzaW9uID09PSBcIlwiKSB7XG5cdFx0XHR2ZXJzaW9uID0gYXdhaXQgdGhpcy5oYW5kbGVWZXJzaW9uU2VsZWN0aW9uKCk7XG5cdFx0fVxuXHRcdGlmICh2ZXJzaW9uID09PSBcImNhbmNlbFwiKSB7XG5cdFx0XHR2ZXJzaW9uID0gXCJ2ZXJzaW9uMVwiXG5cdFx0fVxuXHRcdHRoaXMudmVyc2lvbiA9IHZlcnNpb247XG5cblx0XHRpZiAodmVyc2lvbiA9PT0gXCJ2ZXJzaW9uMVwiKSB7XG5cdFx0XHQvLyBUaGlzIGFkZHMgYSBzZXR0aW5ncyB0YWIgc28gdGhlIHVzZXIgY2FuIGNvbmZpZ3VyZSB2YXJpb3VzIGFzcGVjdHMgb2YgdGhlIHBsdWdpblxuXHRcdFx0Ly8gSW4geW91ciBtYWluIHBsdWdpbiBmaWxlIG9yIGNvbW1hbmQgY2FsbGJhY2tcblxuXHRcdFx0dmFyIHNiSXRlbSA9IHRoaXMuYWRkU3RhdHVzQmFySXRlbSgpXG5cdFx0XHRzYkl0ZW0uc2V0VGV4dChcIkNvbW1lbnQgc2Nhbm5lciBPRkZcIilcblxuXHRcdFx0Ly8gVGhpcyBjcmVhdGVzIGFuIGljb24gaW4gdGhlIGxlZnQgcmliYm9uLlxuXHRcdFx0Y29uc3QgcmliYm9uSWNvbkVsID0gdGhpcy5hZGRSaWJib25JY29uKFxuXHRcdFx0XHQndmlldycsXG5cdFx0XHRcdCdDb21tZW50IFNjYW5uZXIgVFMnLCAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0Ly8gQ2FsbGVkIHdoZW4gdGhlIHVzZXIgY2xpY2tzIHRoZSBpY29uLlxuXHRcdFx0XHRcdGlmICh0aGlzLmludGVydmFsSGFuZGxlID09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0c2JJdGVtLnNldFRleHQoJ0NvbW1lbnQgc2Nhbm5lciBPTicpXG5cdFx0XHRcdFx0XHR0aGlzLmludGVydmFsSGFuZGxlID0gdGhpcy5zY2FuU291cmNlLmluaXQodGhpcy5hcHAsIHRoaXMsIGxleGVyX3BsdWdpbi5zY2FuX2Zvcl9jb21tZW50cyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNiSXRlbS5zZXRUZXh0KCdDb21tZW50IHNjYW5uZXIgT0ZGJylcblx0XHRcdFx0XHRcdGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbEhhbmRsZSk7XG5cdFx0XHRcdFx0XHR0aGlzLmludGVydmFsSGFuZGxlID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHQvLyBQZXJmb3JtIGFkZGl0aW9uYWwgdGhpbmdzIHdpdGggdGhlIHJpYmJvblxuXHRcdFx0cmliYm9uSWNvbkVsLmFkZENsYXNzKCdteS1wbHVnaW4tcmliYm9uLWNsYXNzJyk7XG5cblx0XHRcdC8vIFRoaXMgYWRkcyBhIHN0YXR1cyBiYXIgaXRlbSB0byB0aGUgYm90dG9tIG9mIHRoZSBhcHAuIERvZXMgbm90IHdvcmsgb24gbW9iaWxlIGFwcHMuXG5cdFx0XHRjb25zdCBzdGF0dXNCYXJJdGVtRWwgPSB0aGlzLmFkZFN0YXR1c0Jhckl0ZW0oKTtcblx0XHRcdHN0YXR1c0Jhckl0ZW1FbC5zZXRUZXh0KCdTdGF0dXMgQmFyIFRleHQnKTtcblxuXHRcdFx0Ly8gXG5cdFx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0XHRpZDogJ3NvdXJjZS1zY2FubmVyLXNvbHV0aW9uLWZpbGVzJyxcblx0XHRcdFx0bmFtZTogJ0NyZWF0ZSBzb2x1dGlvbiBmaWxlcycsXG5cdFx0XHRcdGNhbGxiYWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuc2V0dGluZ3MuZG9jdW1lbnRQYXRoID09ICdVTktOT1dOJykge1xuXHRcdFx0XHRcdFx0Y29uc3Qgbm90aWNlID0gbmV3IE5vdGljZSgnUGxlYXNlIGNvbmZpZ3VyZSBzb2x1dGlvbiBzY2FubmVyIHBvcnRpb24gYmVmb3JlIHVzaW5nIGl0LicsIDAuMCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGRvY0ZvbGRlcnMgPSB0aGlzLnV0aWxzLmNyZWF0ZUZvbGRlcnModGhpcy5zZXR0aW5ncy5kb2N1bWVudFBhdGgpO1xuXHRcdFx0XHRcdFx0Y29uc3QgY3Jvc3NDdXR0aW5nQ29uY2VybnMgPSBuZXcgQ3Jvc3NDdXR0aW5nQ29uY2VybnModGhpcy5hcHAsIGRvY0ZvbGRlcnMpO1xuXHRcdFx0XHRcdFx0Y3Jvc3NDdXR0aW5nQ29uY2VybnMuZ2VuZXJhdGVDcm9zc0N1dHRpbmdDb25jZXJucygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFxuXHRcdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdFx0aWQ6ICdzb3VyY2Utc2Nhbm5lci1tYXJrZXItdGFibGUnLFxuXHRcdFx0XHRuYW1lOiAnQ3JlYXRlIG1hcmtlciB0YWJsZScsXG5cdFx0XHRcdGNhbGxiYWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgZG9jRm9sZGVycyA9IHRoaXMudXRpbHMuY3JlYXRlRm9sZGVycyh0aGlzLnNldHRpbmdzLmRvY3VtZW50UGF0aCk7XG5cdFx0XHRcdFx0Y29uc3QgbWFya2VyR3JvdXBMaXN0ID0gbmV3IE1hcmtlckdyb3VwTGlzdCh0aGlzLmFwcCwgZG9jRm9sZGVycyk7XG5cdFx0XHRcdFx0bWFya2VyR3JvdXBMaXN0LmdlbmVyYXRlTWFrZXJHcm91cExpc3QoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFRoaXMgYWRkcyBhbiBlZGl0b3IgY29tbWFuZCB0aGF0IGNhbiBwZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG9uIHRoZSBjdXJyZW50IGVkaXRvciBpbnN0YW5jZVxuXHRcdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdFx0aWQ6ICdzYW1wbGUtZWRpdG9yLWNvbW1hbmQnLFxuXHRcdFx0XHRuYW1lOiAnU2FtcGxlIGVkaXRvciBjb21tYW5kJyxcblx0XHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZWRpdG9yLmdldFNlbGVjdGlvbigpKTtcblx0XHRcdFx0XHRlZGl0b3IucmVwbGFjZVNlbGVjdGlvbignU2FtcGxlIEVkaXRvciBDb21tYW5kJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBJZiB0aGUgcGx1Z2luIGhvb2tzIHVwIGFueSBnbG9iYWwgRE9NIGV2ZW50cyAob24gcGFydHMgb2YgdGhlIGFwcCB0aGF0IGRvZXNuJ3QgYmVsb25nIHRvIHRoaXMgcGx1Z2luKVxuXHRcdFx0Ly8gVXNpbmcgdGhpcyBmdW5jdGlvbiB3aWxsIGF1dG9tYXRpY2FsbHkgcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lciB3aGVuIHRoaXMgcGx1Z2luIGlzIGRpc2FibGVkLlxuXHRcdFx0dGhpcy5yZWdpc3RlckRvbUV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdjbGljaycsIGV2dCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gV2hlbiByZWdpc3RlcmluZyBpbnRlcnZhbHMsIHRoaXMgZnVuY3Rpb24gd2lsbCBhdXRvbWF0aWNhbGx5IGNsZWFyIHRoZSBpbnRlcnZhbCB3aGVuIHRoZSBwbHVnaW4gaXMgZGlzYWJsZWQuXG5cdFx0XHR0aGlzLnJlZ2lzdGVySW50ZXJ2YWwod2luZG93LnNldEludGVydmFsKCgpID0+IGNvbnNvbGUubG9nKCdzZXRJbnRlcnZhbCcpLCA1ICogNjAgKiAxMDAwKSk7XG5cblx0XHRcdGF3YWl0IGxleGVyX3BsdWdpbi5kZWZhdWx0KFByb21pc2UucmVzb2x2ZShsZXhlcl93YXNtLmRlZmF1bHQpKTtcblxuXHRcdFx0Ly8gVGhpcyBhZGRzIGEgc2V0dGluZ3MgdGFiIHNvIHRoZSB1c2VyIGNhbiBjb25maWd1cmUgdmFyaW91cyBhc3BlY3RzIG9mIHRoZSBwbHVnaW5cblx0XHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgU2Nhbm5lclNldHRpbmdzVGFiKHRoaXMuYXBwLCB0aGlzLCBcInZlcnNpb24xXCIpKTtcdFx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gbWFrZSBzdXJlIHRoYXQgdGhlIGNsaSBleGlzdCBpbiB0aGUgY29ycmVjdCBwbGFjZSBhbmQgdGhlIHZlcnNpb25zIG1hdGNoXG5cdFx0XHRhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXHRcdFx0Ly8gVGhpcyBjcmVhdGVzIGFuIGljb24gaW4gdGhlIGxlZnQgcmliYm9uLlxuXHRcdFx0dGhpcy5hZGRSaWJib25JY29uKFxuXHRcdFx0XHRcImV5ZVwiLFxuXHRcdFx0XHRcIlNjYW4gdGV4dCBmaWxlcyBmb3IgY29tbWVudCBsaW5lc1wiLFxuXHRcdFx0XHRhc3luYyAoX2V2dDogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMudHJpZ2dlclNjYW4oKTtcblx0XHRcdFx0fSxcblx0XHRcdCk7XG5cblx0XHRcdC8vIEFkZCBhIGNvbW1hbmQgdG8gdHJpZ2dlciB0aGUgc2NhbiBmcm9tIGtleWJvYXJkXG5cdFx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0XHRpZDogXCJzY2FuLXRleHQtZmlsZXNcIixcblx0XHRcdFx0bmFtZTogXCJTY2FuIHRleHQgZmlsZXMgZm9yIGNvbW1lbnQgbGluZXNcIixcblx0XHRcdFx0Y2FsbGJhY2s6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnRyaWdnZXJTY2FuKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gVGhpcyBhZGRzIGEgc2V0dGluZ3MgdGFiIHNvIHRoZSB1c2VyIGNhbiBjb25maWd1cmUgdmFyaW91cyBhc3BlY3RzIG9mIHRoZSBwbHVnaW5cblx0XHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgU2Nhbm5lclNldHRpbmdzVGFiKHRoaXMuYXBwLCB0aGlzLCBcInZlcnNpb24yXCIpKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gdGhlIHBsdWdpbiBpcyB1bmxvYWRlZC5cblx0ICogQ2xlYW5zIHVwIGFueSByZXNvdXJjZXMsIGludGVydmFscywgb3IgZXZlbnQgbGlzdGVuZXJzIGNyZWF0ZWQgYnkgdGhlIHBsdWdpbi5cblx0ICovXG5cdG9udW5sb2FkKCkge1xuXHRcdGlmICh0aGlzLmludGVydmFsSGFuZGxlICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSGFuZGxlKTtcblx0XHRcdHRoaXMuaW50ZXJ2YWxIYW5kbGUgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIHRoZSBwbHVnaW4gc2V0dGluZ3MgZnJvbSBwZXJzaXN0ZW50IHN0b3JhZ2UuXG5cdCAqIE1lcmdlcyBzYXZlZCBzZXR0aW5ncyB3aXRoIGRlZmF1bHQgc2V0dGluZ3MuXG5cdCAqL1xuXHRhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZXMgdGhlIHBsdWdpbiBzZXR0aW5ncyB0byBwZXJzaXN0ZW50IHN0b3JhZ2UuXG5cdCAqL1xuXHRhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG5cdFx0YXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcblx0fVxufVxuXG4vKipcbiAqIEEgc2ltcGxlIGluZm9ybWF0aW9uYWwgbW9kYWwgZGlhbG9nIHRoYXQgZGlzcGxheXMgYSB0aXRsZSBhbmQgbWVzc2FnZS5cbiAqIEluY2x1ZGVzIGFuIE9LIGJ1dHRvbiBhbmQgcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBtb2RhbCBpcyBjbG9zZWQuXG4gKi9cbmNsYXNzIEluZm9Nb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cHJpdmF0ZSByZXNvbHZlUHJvbWlzZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkO1xuXHRwcml2YXRlIHByb21pc2U6IFByb21pc2U8c3RyaW5nIHwgbnVsbD47XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgSW5mb01vZGFsIGluc3RhbmNlLlxuXHQgKiBAcGFyYW0gYXBwIFRoZSBPYnNpZGlhbiBhcHAgaW5zdGFuY2Vcblx0ICogQHBhcmFtIHRpdGxlIFRoZSB0aXRsZSB0byBkaXNwbGF5IGluIHRoZSBtb2RhbCBoZWFkZXJcblx0ICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gZGlzcGxheSBpbiB0aGUgbW9kYWwgYm9keVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0YXBwOiBBcHAsXG5cdFx0cHVibGljIHRpdGxlOiBzdHJpbmcsXG5cdFx0cHVibGljIG1lc3NhZ2U6IHN0cmluZyxcblx0KSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0XHQvLyBDcmVhdGUgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBtb2RhbCBjbG9zZXNcblx0XHR0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0dGhpcy5yZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gdGhlIG1vZGFsIGlzIG9wZW5lZC5cblx0ICogU2V0cyB1cCB0aGUgbW9kYWwgVUkgd2l0aCB0aXRsZSwgbWVzc2FnZSwgYW5kIE9LIGJ1dHRvbi5cblx0ICogQWxzbyByZWdpc3RlcnMgRW50ZXIga2V5IHRvIGNsb3NlIHRoZSBtb2RhbC5cblx0ICovXG5cdG9uT3BlbigpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblxuXHRcdC8vIEFkZCB0aXRsZVxuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogdGhpcy50aXRsZSB9KTtcblxuXHRcdC8vIEFkZCBtZXNzYWdlXG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IHRoaXMubWVzc2FnZSB9KTtcblxuXHRcdC8vIEFkZCBPSyBidXR0b25cblx0XHRjb25zdCBidXR0b25Db250YWluZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHtcblx0XHRcdGNsczogXCJtb2RhbC1idXR0b24tY29udGFpbmVyXCIsXG5cdFx0fSk7XG5cdFx0Y29uc3Qgb2tCdXR0b24gPSBidXR0b25Db250YWluZXIuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIk9LXCIgfSk7XG5cdFx0b2tCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9KTtcblxuXHRcdC8vIENsb3NlIG9uIEVudGVyIGtleVxuXHRcdHRoaXMuc2NvcGUucmVnaXN0ZXIoW10sIFwiRW50ZXJcIiwgKCkgPT4ge1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgbW9kYWwgaXMgY2xvc2VkLlxuXHQgKiBUaGlzIGFsbG93cyBjYWxsZXJzIHRvIGF3YWl0IHVzZXIgaW50ZXJhY3Rpb24gd2l0aCB0aGUgbW9kYWwuXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgc3RyaW5nIG9yIG51bGwgd2hlbiB0aGUgbW9kYWwgaXMgY2xvc2VkXG5cdCAqL1xuXHRnZXRSZXN1bHQoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG5cdFx0cmV0dXJuIHRoaXMucHJvbWlzZTtcblx0fVxuXG59XG4iLCAiaW1wb3J0IHsgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgU291cmNlU2Nhbm5lciBmcm9tIFwiLi4vbWFpblwiO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tIFwiLi9VdGlsc1wiO1xuY29uc3QgZWxlY3Ryb24gPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZSBcbmNvbnN0IGRpYWxvZyA9IGVsZWN0cm9uLmRpYWxvZ1xuXG5leHBvcnQgY2xhc3MgU2Nhbm5lclNldHRpbmdzVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG5cdHBsdWdpbjogU291cmNlU2Nhbm5lcjtcbiAgICB2ZXJzaW9uOiBTdHJpbmc7XG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFNvdXJjZVNjYW5uZXIsIHZlcnNpb246IFN0cmluZykge1xuXHRcdHN1cGVyKGFwcCwgcGx1Z2luKTtcblx0XHR0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvbjtcblx0fVxuXG5cdGRpc3BsYXkoKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMudmVyc2lvbiA9PSBcInZlcnNpb24xXCIpIHtcbiAgICAgICAgICAgIHRoaXMuc291cmNlU2Nhbm5lcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50ZXh0U2Nhbm5lcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc291cmNlU2Nhbm5lcigpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qge2NvbnRhaW5lckVsfSA9IHRoaXM7XG5cblx0XHRjb250YWluZXJFbC5lbXB0eSgpO1xuICAgICAgICAvL1xuICAgICAgICAvL2J1cyBNYWtlIHN1cmUgdGhhdCB0aGUgc2Nhbm5lciBpcyBzd2l0Y2hlZCBvZmYgYmVmb3JlIGFsbG93aW5nIFxuICAgICAgICAvL2J1cyB1c2VyIHRvIHVwZGF0ZSB0aGUgc2V0dGluZ3MuIF5zZXR0aW5ncy0wMVxuICAgICAgICAvL1xuICAgICAgICBpZiAodGhpcy5wbHVnaW4uaW50ZXJ2YWxIYW5kbGUpIHtcbiAgICAgICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgICAgIC5zZXROYW1lKFwiU2Nhbm5lciBpcyBydW5uaW5nXCIpXG4gICAgICAgICAgICAgICAgLnNldERlc2MoXCJQbGVhc2Ugc2h1dGRvd24gdGhlIHNjYW5uZXIgYmVmb3JlIHVwZGF0aW5nIHRoZSBzZXR0aW5nc1wiKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdmFyIGFwcFBhdGhTZXR0aW5nID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpO1xuXG4gICAgICAgICAgICBhcHBQYXRoU2V0dGluZ1xuICAgICAgICAgICAgICAgIC5zZXROYW1lKFwiQXBwbGljYXRpb24gUGF0aFwiKVxuICAgICAgICAgICAgICAgIC5zZXREZXNjKGBBcHBsaWNhdGlvbiB3b3Jrc3BhY2U6ICR7dGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBwbGljYXRpb25QYXRofWApXG4gICAgICAgICAgICAgICAgLmFkZEJ1dHRvbihidXR0b24gPT5cbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIlNFTEVDVCBBUFBMSUNBVElPTiBQQVRIXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAub25DbGljaygoY2IgOiBNb3VzZUV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlhbG9nLnNob3dPcGVuRGlhbG9nKHtwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknXSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihhc3luYyAocmVzdWx0OiB7IGNhbmNlbGVkOiBhbnk7IGZpbGVQYXRoczogc3RyaW5nW107IH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdC5jYW5jZWxlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdC5maWxlUGF0aHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcHBsaWNhdGlvblBhdGggPSByZXN1bHQuZmlsZVBhdGhzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwUGF0aFNldHRpbmcuc2V0RGVzYyhgQXBwbGljYXRpb24gd29ya3NwYWNlOiAke3RoaXMucGx1Z2luLnNldHRpbmdzLmFwcGxpY2F0aW9uUGF0aH1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgIHZhciB0ZXN0UGF0aFNldHRpbmcgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbCk7XG5cbiAgICAgICAgICAgIHRlc3RQYXRoU2V0dGluZ1xuICAgICAgICAgICAgICAgIC5zZXROYW1lKFwiVGVzdCBQYXRoXCIpXG4gICAgICAgICAgICAgICAgLnNldERlc2MoYFRlc3Qgd29ya3NwYWNlOiAke3RoaXMucGx1Z2luLnNldHRpbmdzLnVuaXRUZXN0UGF0aH1gKVxuICAgICAgICAgICAgICAgIC5hZGRCdXR0b24oYnV0dG9uID0+XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgLnNldEJ1dHRvblRleHQoXCJTRUxFQ1QgVU5JVCBURVNUIFBBVEhcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbkNsaWNrKChjYiA6IE1vdXNlRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFsb2cuc2hvd09wZW5EaWFsb2coe3Byb3BlcnRpZXM6IFsnb3BlbkRpcmVjdG9yeSddIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXN1bHQ6IHsgY2FuY2VsZWQ6IGFueTsgZmlsZVBhdGhzOiBzdHJpbmdbXTsgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0LmNhbmNlbGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0LmZpbGVQYXRocylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnVuaXRUZXN0UGF0aCA9IHJlc3VsdC5maWxlUGF0aHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0UGF0aFNldHRpbmcuc2V0RGVzYyhgVGVzdCB3b3Jrc3BhY2U6ICR7dGhpcy5wbHVnaW4uc2V0dGluZ3MudW5pdFRlc3RQYXRofWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBjb25zdCBkb2N1bWVudFBhdGggPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgICAgICAuc2V0TmFtZShcIkRvY3VtZW50YXRpb24gUGF0aFwiKVxuICAgICAgICAgICAgICAgIC5zZXREZXNjKFwiUGF0aCB0byBkb2N1bWVudCB3b3Jrc3BhY2UgcmVsYXRpdmUgZnJvbSB2YXVsdFwiKVxuICAgICAgICAgICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgdGhlIGRvY3VtZW50YXRpb24gcGF0aFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRvY3VtZW50UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyB2YWx1ZSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZG9jdW1lbnRQYXRoID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBhcHBsaWNhdGlvblR5cGUgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgICAgICAuc2V0TmFtZShcIkFwcGxpY2F0aW9uIHR5cGVcIilcbiAgICAgICAgICAgICAgICAuc2V0RGVzYyhcIlR5cGUgb2YgYXBwbGljYXRpb25cIilcbiAgICAgICAgICAgICAgICAuYWRkRHJvcGRvd24oZHJvcERvd24gPT4gXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wRG93blxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRPcHRpb24oJy5qYXZhJywgJ2phdmEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRPcHRpb24oJy5ycycsICdydXN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkT3B0aW9uKCcuYycsICdjJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkT3B0aW9uKCcuYysrJywgJ2MrKycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZE9wdGlvbignLmNwcCcsICdjcHAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRPcHRpb24oJy5jeHgnLCAnY3h4JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkT3B0aW9uKCcudHMnLCAndHlwZXNjcmlwdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFwcGxpY2F0aW9uRXh0ZW5zaW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+XHR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFwcGxpY2F0aW9uRXh0ZW5zaW9uID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGl2YXRpb25JbnRlcnZhbCA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgICAgIC5zZXROYW1lKFwiQWN0aXZhdGlvbiBpbnRlcnZhbFwiKVxuICAgICAgICAgICAgICAgIC5zZXREZXNjKFwiQWN0aXZhdGlvbiBpbnRlcnZhbCBpbiBtc1wiKVxuICAgICAgICAgICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgdGhlIGFjdGl2YXRpb24gaW50ZXJ2YWxcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zbGVlcExlbmd0aC50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jIHZhbHVlID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zbGVlcExlbmd0aCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBudW1iZXJPZlNyY0ZpbGVzID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAgICAgLnNldE5hbWUoXCJOdW1iZXIgb2Ygc291cmNlIGZpbGVzIHRvIHByb2Nlc3NcIilcbiAgICAgICAgICAgICAgICAuc2V0RGVzYyhcIk51bWJlciBvZiBzb3VyY2UgZmlsZXMgdG8gcHJvY2VzcyBhdCBhIHRpbWVcIilcbiAgICAgICAgICAgICAgICAuYWRkVGV4dCh0ZXh0ID0+IHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHRoZSBzb3VyY2UgZmlsZSBwcm9jZXNzaW5nIGNvdW50XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZ3JvdXBCeVNpemUudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyB2YWx1ZSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZ3JvdXBCeVNpemUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICB9XG5cbiAgICB0ZXh0U2Nhbm5lcigpOiB2b2lkIHtcblx0XHRjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuXG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcblxuXHRcdGNvbnN0IGZvbGRlciA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoXCJGb2xkZXJcIilcblx0XHRcdC5zZXREZXNjKFwiTG9jYXRpb24gb2YgdGV4dCBmaWxlIHRvIHNjYW5cIilcblx0XHRcdC5hZGRUZXh0KCh0ZXh0KSA9PlxuXHRcdFx0XHR0ZXh0XG5cdFx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgeW91ciB0ZXh0IGZpbGUgc3RhcnQgZm9sZGVyXCIpXG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRpcilcblx0XHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5kaXIgPSB2YWx1ZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdH0pLFxuXHRcdFx0KTtcblx0XHRjb25zdCB3b3JraW5nRm9sZGVyID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZShcIldvcmtpbmcgZm9sZGVyXCIpXG5cdFx0XHQuc2V0RGVzYyhcIkxvY2F0aW9uIG9mIG1kIGZpbGVzXCIpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHRcdFx0dGV4dFxuXHRcdFx0XHRcdC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHlvdXIgd29ya2luZyBmb2xkZXIgbmFtZVwiKVxuXHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy53b3JrKVxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLndvcmsgPSB2YWx1ZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdH0pLFxuXHRcdFx0KTtcblx0XHRjb25zdCBzdGFydExpbmUgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiU3RhcnRcIilcblx0XHRcdC5zZXREZXNjKFwiVGhlIHN0YXJ0IG9mIGxpbmUgdG8gZXh0cmFjdCB0byBtZCBmaWxlXCIpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHRcdFx0dGV4dFxuXHRcdFx0XHRcdC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHlvdXIgc3RhcnQgc3RyaW5nXCIpXG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN0YXJ0KVxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnN0YXJ0ID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR9KSxcblx0XHRcdCk7XG5cdFx0Y29uc3QgZm9sZGVyU3RydWN0dXJlID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZShcIkZvbGRlciBzdHJ1Y3R1cmVcIilcblx0XHRcdC5zZXREZXNjKFwiVGhlIGZvbGRlciBzdHJ1Y3R1cmUgZGVmaW5pdGlvblwiKVxuXHRcdFx0LmFkZFRleHQoKHRleHQpID0+XG5cdFx0XHRcdHRleHRcblx0XHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoXG5cdFx0XHRcdFx0XHRcIkVudGVyIHlvdXIgZG90IHNlcGFyYXRlZCBmb2xkZXIgc3RydWN0dXJlIGRlZmluaXRpb25cIixcblx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnBhdGgpXG5cdFx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MucGF0aCA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHQpO1xuXHRcdGNvbnN0IGV4dGVuc2lvbiA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoXCJFeHRlbnNpb25cIilcblx0XHRcdC5zZXREZXNjKFwiRXh0ZW5zaW9uIG9mIHRoZSBzb3VyY2UgdGV4dCBmaWxlcyB0byBzY2FuXCIpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHRcdFx0dGV4dFxuXHRcdFx0XHRcdC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHlvdXIgdGV4dCBmaWxlIGV4dGVuc2lvblwiKVxuXHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5leHRlbnNpb24pXG5cdFx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuZXh0ZW5zaW9uID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR9KSxcblx0XHRcdCk7XG5cdFx0Y29uc3QgZGVzdGluYXRpb25FeHRlbnNpb24gPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiRGVzdGluYXRpb24gZmlsZSBleHRlbnNpb25cIilcblx0XHRcdC5zZXREZXNjKFxuXHRcdFx0XHRcIkV4dGVuc2lvbiBvZiB0aGUgZGVzdGluYXRpb24gZmlsZXMgaW50byB3aGljaCBleHRyYWN0ZWQgdGV4dCBnb2VzXCIsXG5cdFx0XHQpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHRcdFx0dGV4dFxuXHRcdFx0XHRcdC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHlvdXIgZGVzdGluYXRpb24gZmlsZSBleHRlbnNpb25cIilcblx0XHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdEV4dGVuc2lvbilcblx0XHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0RXh0ZW5zaW9uID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR9KSxcblx0XHRcdCk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCBTb3VyY2VTY2FubmVyIGZyb20gJy4uL21haW4nO1xuaW1wb3J0IHsgc3RhdFN5bmMsIHJlYWRGaWxlU3luYywgZXhpc3RzU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJ1xuaW1wb3J0IHsgRmlsZVN5c3RlbUFkYXB0ZXIgfSBmcm9tICdvYnNpZGlhbidcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnLi9VdGlscydcbmltcG9ydCB7IERvY0ZvbGRlcnMgfSBmcm9tICcuL0RvY0ZvbGRlcnMnO1xuXG5leHBvcnQgY2xhc3MgU2NhblNvdXJjZSB7XG5cbiAgICBjb2RlU2Nhbm5lcjogKGFyZzA6IHN0cmluZykgPT4gc3RyaW5nO1xuXG4gICAgYXBwbGljYXRpb25QYXRoOiBzdHJpbmc7ICAgICAgICAgIC8vIGFwcGxpY2F0aW9uIHBhdGhcbiAgICBjb2RlRXh0ZW5zaW9uOiBzdHJpbmc7ICAgICAgICAgICAgLy8gdGhlIHNvdXJjZSBmaWxlIG5hbWUgZXh0ZW5zaW9uXG4gICAgZG9jdW1lbnRQYXRoOiBzdHJpbmc7ICAgICAgICAgICAgIC8vIGRvY3VtZW50IHBhdGggYWJzIHBhdGhcbiAgICB0ZXN0UGF0aDogc3RyaW5nOyAgICAgICAgICAgICAgICAgLy8gdW5pdCB0ZXN0IGNvZGUgcGF0aCBcbiAgICByZWxhdGl2ZURvY3VtZW50UGF0aDogc3RyaW5nOyAgICAgLy8gZG9jdW1lbnQgcGF0aCBhYnMgcmVsIGZyb20gdmF1bHQgcm9vdFxuICAgIGdyb3VwQnlTaXplOiBudW1iZXI7ICAgICAgICAgICAgICAvLyBudW1iZXIgb2YgZG9jdW1lbnRzIHRvIHByb2Nlc3MgYXQgYSB0aW1lIFxuICAgIHNsZWVwTGVuZ3RoOiBudW1iZXI7ICAgICAgICAgICAgICAvLyBudW1iZXIgb2Ygc2Vjb25kcyB0byBzbGVlcFxuICAgIHBoYXNlQ291bnQ6IG51bWJlciA9IDA7ICAgICAgICAgICAvLyBjdXJyZW50IHByb2Nlc3NzaW5nIHBoYXNlIFxuXG4gICAgYXBwbGljYXRpb25GaWxlTGlzdFdpdGhFeHRlbnNpb246IEFycmF5PEFycmF5PHN0cmluZz4+OyAvLyBhbGwgYXBwbGljYXRpb24gc291cmNlIGZpbGVzXG4gICAgdGVzdEZpbGVMaXN0V2l0aEV4dGVuc2lvbjogQXJyYXk8QXJyYXk8c3RyaW5nPj47ICAgICAgICAvLyBhbGwgdGVzdCBzb3VyY2UgZmlsZXNcbiAgICBkb2N1bWVudEZpbGVMaXN0V2l0aEV4dGVuc2lvbjogQXJyYXk8c3RyaW5nPjsgICAgICAgICAgIC8vIGFsbCBkb2N1bWVudHNcbiAgICBzb3VyY2VBbmREb2N1bWVudExpbmsgPSBuZXcgU2V0PHN0cmluZz47XG5cbiAgICBmc2E6IEZpbGVTeXN0ZW1BZGFwdGVyO1xuICAgIHV0aWxzOiBVdGlscztcblxuICAgIGRvY0ZvbGRlcnM6IERvY0ZvbGRlcnM7ICAgICAgICAgICAgLy8gZG9jdW1lbnQgZm9sZGVyc1xuXG4gICAgaW5pdChhcHA6IEFwcCwgcGx1Z2luOiBTb3VyY2VTY2FubmVyLCBzY2FubmVyOiAoYXJnMDogc3RyaW5nKSA9PiBzdHJpbmcpIHtcblxuICAgICAgICB0aGlzLmNvZGVTY2FubmVyID0gc2Nhbm5lcjtcbiAgICAgICAgdGhpcy5hcHBsaWNhdGlvblBhdGggPSBwbHVnaW4uc2V0dGluZ3MuYXBwbGljYXRpb25QYXRoO1xuICAgICAgICB0aGlzLmNvZGVFeHRlbnNpb24gPSBwbHVnaW4uc2V0dGluZ3MuYXBwbGljYXRpb25FeHRlbnNpb247XG4gICAgICAgIHRoaXMuZG9jdW1lbnRQYXRoID0gcGx1Z2luLnNldHRpbmdzLmRvY3VtZW50UGF0aDtcbiAgICAgICAgdGhpcy50ZXN0UGF0aCA9IHBsdWdpbi5zZXR0aW5ncy51bml0VGVzdFBhdGg7XG4gICAgICAgIHRoaXMuZ3JvdXBCeVNpemUgPSBwbHVnaW4uc2V0dGluZ3MuZ3JvdXBCeVNpemU7XG4gICAgICAgIHRoaXMuc2xlZXBMZW5ndGggPSBwbHVnaW4uc2V0dGluZ3Muc2xlZXBMZW5ndGg7XG4gICAgICAgIHRoaXMudXRpbHMgPSBuZXcgVXRpbHMoYXBwKTtcbiAgICAgICAgdGhpcy5mc2EgPSBhcHAudmF1bHQuYWRhcHRlciBhcyBGaWxlU3lzdGVtQWRhcHRlcjtcblxuICAgICAgICByZXR1cm4gc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5ydW4oKSwgdGhpcy5zbGVlcExlbmd0aCk7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICAvL1xuICAgICAgICAvLyB0aGUgZm9sZGVycyBtaWdodCBoYXZlIGJlZW4gZGVsZXRlZCBvciB0aGlzIGlzIHRoZSBmaXJzdCBzdGFydCBvZiB0aGUgYXBwXG4gICAgICAgIC8vIHNvIGNyZWF0ZSB0aGUgZm9sZGVycyBpZmYgdGhleSBkbyBub3QgZXhpc3RcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kb2NGb2xkZXJzID0gdGhpcy51dGlscy5jcmVhdGVGb2xkZXJzKHRoaXMuZG9jdW1lbnRQYXRoKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gZG8gd29yayBpbiBwaGFzZXNcbiAgICAgICAgLy8gZ2V0IGFsbCB0aGUgaW1wbGVtZW50YXRpb24gYW5kIHRlc3QgZmlsZXMgaW50byBhIGxpc3Qgb2YgY2h1bmtzIGF0IG1vc3QgZ3JvdXBCeVNpemVcbiAgICAgICAgLy9cbiAgICAgICAgaWYgKHRoaXMucGhhc2VDb3VudCA9PSAxLjApIHtcbiAgICAgICAgICAgIGNvbnN0IGltcEZpbGVzID0gdGhpcy51dGlscy5maWx0ZXJGaWxlTmFtZXNCeUV4dGVuc2lvbihcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGVFeHRlbnNpb24sXG4gICAgICAgICAgICAgICAgdGhpcy51dGlscy53YWxrSW5Gb2xkZXJGcm9tRGlyKHRoaXMuYXBwbGljYXRpb25QYXRoLCBbXSkpO1xuXG4gICAgICAgICAgICB0aGlzLmFwcGxpY2F0aW9uRmlsZUxpc3RXaXRoRXh0ZW5zaW9uID0gW107XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1wRmlsZXMubGVuZ3RoOyBpICs9IHRoaXMuZ3JvdXBCeVNpemUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGltcEZpbGVzLnNsaWNlKGksIGkgKyB0aGlzLmdyb3VwQnlTaXplKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGxpY2F0aW9uRmlsZUxpc3RXaXRoRXh0ZW5zaW9uLnB1c2goY2h1bmspO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0ZXN0RmlsZXMgPSB0aGlzLnV0aWxzLmZpbHRlckZpbGVOYW1lc0J5RXh0ZW5zaW9uKFxuICAgICAgICAgICAgICAgIHRoaXMuY29kZUV4dGVuc2lvbixcbiAgICAgICAgICAgICAgICB0aGlzLnV0aWxzLndhbGtJbkZvbGRlckZyb21EaXIodGhpcy50ZXN0UGF0aCwgW10pKTtcblxuICAgICAgICAgICAgdGhpcy50ZXN0RmlsZUxpc3RXaXRoRXh0ZW5zaW9uID0gW107XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGVzdEZpbGVzLmxlbmd0aDsgaSArPSB0aGlzLmdyb3VwQnlTaXplKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSB0ZXN0RmlsZXMuc2xpY2UoaSwgaSArIHRoaXMuZ3JvdXBCeVNpemUpO1xuICAgICAgICAgICAgICAgIHRoaXMudGVzdEZpbGVMaXN0V2l0aEV4dGVuc2lvbi5wdXNoKGNodW5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyBnZXQgbGlzdCBvZiBkb2N1bWVudCBmaWxlc1xuICAgICAgICAvLyAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLnBoYXNlQ291bnQgPT0gMi4wKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IHRoaXMudXRpbHMuZmlsdGVyRmlsZU5hbWVzQnlFeHRlbnNpb24oXG4gICAgICAgICAgICAgICAgJy5tZCcsXG4gICAgICAgICAgICAgICAgdGhpcy51dGlscy53YWxrSW5Gb2xkZXJGcm9tRGlyKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZzYS5nZXRCYXNlUGF0aCgpICsgdGhpcy51dGlscy5zZXBhcmF0b3IgKyB0aGlzLmRvY0ZvbGRlcnMuc2V0dGluZ3NDb21tZW50Rm9sZGVyLCBbXVxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgdGhpcy5kb2N1bWVudEZpbGVMaXN0V2l0aEV4dGVuc2lvbiA9IGZpbGVzXG4gICAgICAgICAgICAgICAgLm1hcChmaWxlTmFtZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlTmFtZS5yZXBsYWNlKHRoaXMuZnNhLmdldEJhc2VQYXRoKCkgKyB0aGlzLnV0aWxzLnNlcGFyYXRvciwgXCJcIik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyBpZiB0aGUgc291cmNlIGlmIHlvdW5nZXIgdGhlbiB0aGUgZG9jdW1lbnQgZmlsZSBPUiBkb2N1bWVudCBmaWxlIGhhZCB0byBiZSBjcmVhdGVkIHRoZW5cbiAgICAgICAgLy8gICAgbG9hZCB0aGUgbGluZXMgZnJvbSB0aGUgc291cmNlIGZpbGUgYW5kIHNjYW4gZm9yIGNvbW1lbnRzLlxuICAgICAgICAvLyAgICB3cml0ZSBjb21tZW50cyBvdXQgdG8gZG9jdW1lbnQgZmlsZVxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGZpbGVzIGV4aXN0IGJlZm9yZSBnZXR0aW5nIHRoZWlyIHN0YXQgaW5mb3JtYXRpb25cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKHRoaXMucGhhc2VDb3VudCA9PSAzLjAgJiYgdGhpcy5hcHBsaWNhdGlvbkZpbGVMaXN0V2l0aEV4dGVuc2lvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlc1RvQ2hlY2sgPSB0aGlzLmFwcGxpY2F0aW9uRmlsZUxpc3RXaXRoRXh0ZW5zaW9uLnBvcCgpO1xuICAgICAgICAgICAgaWYgKGZpbGVzVG9DaGVjayAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBmaWxlc1RvQ2hlY2suZm9yRWFjaChzcmNGaWxlID0+IHtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkb2N1bWVudE5hbWUgPSB0aGlzLmNyZWF0ZURvY05hbWVGcm9tU291cmNlTmFtZShzcmNGaWxlLCB0aGlzLmFwcGxpY2F0aW9uUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50TmFtZUFuZFBhdGggPVxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGhpcy5kb2N1bWVudFBhdGh9JHt0aGlzLnV0aWxzLnNlcGFyYXRvcn1jb21tZW50cyR7dGhpcy51dGlscy5zZXBhcmF0b3J9JHtkb2N1bWVudE5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jRnVsbFBhdGhuYW1lID0gYCR7dGhpcy5mc2EuZ2V0QmFzZVBhdGgoKX0ke3RoaXMudXRpbHMuc2VwYXJhdG9yfSR7ZG9jdW1lbnROYW1lQW5kUGF0aH1gO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc291cmNlQW5kRG9jdW1lbnRMaW5rLmFkZChkb2N1bWVudE5hbWVBbmRQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvQWN0dWFsU2Nhbm5pbmcoZG9jdW1lbnROYW1lQW5kUGF0aCwgc3JjRmlsZSwgZG9jRnVsbFBhdGhuYW1lKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHRoaXMucGhhc2VDb3VudCA9IDIuMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBoYXNlQ291bnQgPT0gNC4wICYmIHRoaXMudGVzdEZpbGVMaXN0V2l0aEV4dGVuc2lvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlc1RvQ2hlY2sgPSB0aGlzLnRlc3RGaWxlTGlzdFdpdGhFeHRlbnNpb24ucG9wKCk7XG4gICAgICAgICAgICBpZiAoZmlsZXNUb0NoZWNrICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGZpbGVzVG9DaGVjay5mb3JFYWNoKHNyY0ZpbGUgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlc3REb2N1bWVudE5hbWUgPSB0aGlzLmNyZWF0ZURvY05hbWVGcm9tU291cmNlTmFtZShzcmNGaWxlLCB0aGlzLnRlc3RQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVzdERvY3VtZW50TmFtZUFuZFBhdGggPVxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGhpcy5kb2N1bWVudFBhdGh9JHt0aGlzLnV0aWxzLnNlcGFyYXRvcn10ZXN0IGNvbW1lbnRzJHt0aGlzLnV0aWxzLnNlcGFyYXRvcn0ke3Rlc3REb2N1bWVudE5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jRnVsbFBhdGhuYW1lID0gYCR7dGhpcy5mc2EuZ2V0QmFzZVBhdGgoKX0ke3RoaXMudXRpbHMuc2VwYXJhdG9yfSR7dGVzdERvY3VtZW50TmFtZUFuZFBhdGh9YDtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvQWN0dWFsU2Nhbm5pbmcodGVzdERvY3VtZW50TmFtZUFuZFBhdGgsIHNyY0ZpbGUsIGRvY0Z1bGxQYXRobmFtZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB0aGlzLnBoYXNlQ291bnQgPSA0LjA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5waGFzZUNvdW50ID09IDUuMCkge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGV2ZXJ5IG1kIGRvY3VtZW50IHRoYXQgZG9lcyBub3QgaGF2ZSBhIHNvdXJjZSBmaWxlIG11c3QgYmUgcmVtb3ZlZFxuICAgICAgICAgICAgLy8gdGhlIHNvdXJjZSBhbmQgZG9jdW1lbnQgbGluayBpcyB0aGUgc291cmNlIGZpbGUgdGhhdCBzaG91bGQgYmUgaW4gdGhlIFxuICAgICAgICAgICAgLy8gZG9jdW1lbnQgZmlsZSBsaXN0LiBcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50RmlsZUxpc3RXaXRoRXh0ZW5zaW9uLmZvckVhY2goZmlsZU5hbWUgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zb3VyY2VBbmREb2N1bWVudExpbmsuaGFzKGZpbGVOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnV0aWxzLmZzYS5yZW1vdmUoZmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgdGhpcy5zb3VyY2VBbmREb2N1bWVudExpbmsuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMucGhhc2VDb3VudCA9IC0xLjA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBoYXNlQ291bnQgKz0gMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiB0aGUgZmlsZSBzeXN0ZW0gZnVsbCBkb2MgbmFtZSBhbmQgcGF0aCBzY2FuIHRoZSBzb3VyY2UgZmlsZSBhbmQgcGxhY2UgZG9jdW1lbnQgXG4gICAgICogaW4gdGhlIGRvY3VtZW50IG5hbWUgYW5kIHBhdGggbG9jYXRpb25cbiAgICAgKiBAcGFyYW0gZG9jdW1lbnROYW1lQW5kUGF0aCB2YXVsdCBwYXRoIG9mIHRoZSBtZCBkb2N1bWVudFxuICAgICAqIEBwYXJhbSBzcmNGaWxlIHRvIHNjYW4gc291cmNlIGZpbGUgdG8gc2NhblxuICAgICAqIEBwYXJhbSBkb2NGdWxsUGF0aG5hbWUgZmlsYSBkb2N1bWVudCBuYW1lIGFuZCBwYXRoIGZyb20gdGhlIHJvb3Qgb2YgdGhlIGZpbGUgc3lzdGVtXG4gICAgICovXG4gICAgcHJpdmF0ZSBkb0FjdHVhbFNjYW5uaW5nKGRvY3VtZW50TmFtZUFuZFBhdGg6IHN0cmluZywgc3JjRmlsZTogc3RyaW5nLCBkb2NGdWxsUGF0aG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNvdXJjZUFuZERvY3VtZW50TGluay5hZGQoZG9jdW1lbnROYW1lQW5kUGF0aCk7XG5cbiAgICAgICAgY29uc3Qgc3JjRmlsZUV4aXN0cyA9IGV4aXN0c1N5bmMoc3JjRmlsZSk7XG4gICAgICAgIGlmICghc3JjRmlsZUV4aXN0cykge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdUZXN0IHNvdXJjZSBmaWxlIGdvbmUgJyArIHNyY0ZpbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3JjU3RhdCA9IHN0YXRTeW5jKHNyY0ZpbGUpO1xuXG4gICAgICAgICAgICB2YXIgY3JlYXRlZEZpbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IGRvY0ZpbGVFeGlzdHMgPSBleGlzdHNTeW5jKGRvY0Z1bGxQYXRobmFtZSk7XG4gICAgICAgICAgICB2YXIgZG9jU3RhdDogYW55O1xuICAgICAgICAgICAgdmFyIGNyZWF0ZWRGaWxlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZG9jRmlsZUV4aXN0cykge1xuICAgICAgICAgICAgICAgIGRvY1N0YXQgPSBzdGF0U3luYyhkb2NGdWxsUGF0aG5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKGRvY0Z1bGxQYXRobmFtZSwgXCJcIik7XG4gICAgICAgICAgICAgICAgY3JlYXRlZEZpbGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9jU3RhdCA9IHN0YXRTeW5jKGRvY0Z1bGxQYXRobmFtZSk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gc291cmNlIGlzIG9sZGVyIHRoYW4gdGhlIGRvYyBhcyBzZWVuIGZyb20gMTk3MCAtPiBvbndhcmRzIE9SXG4gICAgICAgICAgICAvLyBkb2NzIGhhdmUganVzdCBiZWVuIGNyZWF0ZWQuXG4gICAgICAgICAgICAvLyBcbiAgICAgICAgICAgIGlmIChjcmVhdGVkRmlsZSB8fCBkb2NTdGF0Lm10aW1lTXMgPCBzcmNTdGF0Lm10aW1lTXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcmNMaW5lcyA9IHJlYWRGaWxlU3luYyhzcmNGaWxlLCB7IGVuY29kaW5nOiAndXRmOCcsIGZsYWc6ICdyJyB9KTtcbiAgICAgICAgICAgICAgICB2YXIgYWxsQ29tbWVudHM7XG4gICAgICAgICAgICAgICAgdmFyIGNvbW1lbnRzID0gXCJOT05FXCI7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudHMgPSB0aGlzLmNvZGVTY2FubmVyKHNyY0xpbmVzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1lbnRzICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsQ29tbWVudHMgPSBjb21tZW50cy5yZXBsYWNlQWxsKC9cXG5cXHMrXFwqL2csIFwiXFxuXCIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBpbiBzY2FuIGZvciBmaWxlIFwiICsgc3JjRmlsZSk7IFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJDb21tZW50ID0gYFtTb3VyY2VdKGZpbGU6Ly8ke3NyY0ZpbGV9KVxcblxcbi0tLVxcbmA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnNhLndyaXRlKGRvY3VtZW50TmFtZUFuZFBhdGgsIGhlYWRlckNvbW1lbnQgKyBjb21tZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhbGxDb21tZW50cyA9PSBcInVucGFpcmVkIHN1cnJvZ2F0ZXNcIikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIGluIHNjYW4gZm9yIGZpbGUgXCIgKyBzcmNGaWxlKTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlckNvbW1lbnQgPSBgW1NvdXJjZV0oZmlsZTovLyR7c3JjRmlsZX0pXFxuXFxuLS0tXFxuYDtcbiAgICAgICAgICAgICAgICB0aGlzLmZzYS53cml0ZShkb2N1bWVudE5hbWVBbmRQYXRoLCBoZWFkZXJDb21tZW50ICsgYWxsQ29tbWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgZG9jdW1lbnQgZmlsZSBuYW1lIHVzaW5nIHRoZSBzb3VyY2UgZmlsZSBuYW1lXG4gICAgICogQHBhcmFtIHNvdXJjZUZpbGUgdG8gY3JlYXRlIGEgZG9jdW1lbnQgZmlsZSBmcm9tXG4gICAgICogQHJldHVybnMgdGhlIGRvY3VtZW50IGZpbGVcbiAgICAgKi9cbiAgICBjcmVhdGVEb2NOYW1lRnJvbVNvdXJjZU5hbWUoc291cmNlRmlsZTogc3RyaW5nLCBhcHBsaWNhdGlvblBhdGg6IHN0cmluZykge1xuICAgICAgICAvLyBnZXQgb25seSB0aGUgbmFtZSBvZiB0aGUgZmlsZVxuICAgICAgICB2YXIgZmlsZU5hbWUgPSBzb3VyY2VGaWxlXG4gICAgICAgICAgICAucmVwbGFjZShhcHBsaWNhdGlvblBhdGggKyB0aGlzLnV0aWxzLnNlcGFyYXRvciwgJycpXG4gICAgICAgICAgICAucmVwbGFjZSh0aGlzLmNvZGVFeHRlbnNpb24sICcubWQnKTtcbiAgICAgICAgLy8gcmVwbGFjZSBhbGwgYWNjdXJlbmNlc1xuICAgICAgICB3aGlsZSAoZmlsZU5hbWUuY29udGFpbnModGhpcy51dGlscy5zZXBhcmF0b3IpKSB7XG4gICAgICAgICAgICBmaWxlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UodGhpcy51dGlscy5zZXBhcmF0b3IsICcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNyZWF0ZSBhIHBhdGggdG8gdGhlIHNvdXJjZSBmaWxlIHJlbGF0aXZlIHRvIHRoZSB2YXVsdFxuICAgICAqIEBwYXJhbSBzb3VyY2VGaWxlIHRoZSBzb3VyY2UgY29kZSBmaWxlXG4gICAgICogQHBhcmFtIGRvY3VtZW50UGFydCB0aGUgZG9jdW1lbnQgZmlsZVxuICAgICAqIEByZXR1cm5zIHRoZSBwYXRoIHRvIHRoZSBzb3VyY2UgcmVsYXRpdmUgdG8gdGhlIHZhdWx0XG4gICAgICovXG4gICAgY3JlYXRlUmVsYXRpdmVQYXRoKHNvdXJjZUZpbGU6IHN0cmluZywgZG9jdW1lbnRQYXJ0OiBzdHJpbmcpIHtcbiAgICAgICAgdmFyIHNvdXJjZUZpbGVQYXJ0cyA9IHNvdXJjZUZpbGUuc3BsaXQodGhpcy51dGlscy5zZXBhcmF0b3IpO1xuICAgICAgICB2YXIgZG9jdW1lbnRBbmRQYXRoUGFydHMgPSBgJHt0aGlzLnV0aWxzLmZzYS5nZXRCYXNlUGF0aCgpfS8ke2RvY3VtZW50UGFydH1gLnNwbGl0KCcvJyk7XG5cbiAgICAgICAgd2hpbGUgKHNvdXJjZUZpbGVQYXJ0c1swXSA9PSBkb2N1bWVudEFuZFBhdGhQYXJ0c1swXSkge1xuICAgICAgICAgICAgc291cmNlRmlsZVBhcnRzID0gc291cmNlRmlsZVBhcnRzLnNsaWNlKDEpO1xuICAgICAgICAgICAgZG9jdW1lbnRBbmRQYXRoUGFydHMgPSBkb2N1bWVudEFuZFBhdGhQYXJ0cy5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBnbyB1cCBmcm9tIGN1cnJlbnQgZm9sZGVyIGRvY3VtZW50QW5kUGF0aFBhcnRzIGxlbmd0aCAtIDFcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50QW5kUGF0aFBhcnRzLmZpbHRlcih2YWx1ZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXZhbHVlLmVuZHNXaXRoKCcubWQnKVxuICAgICAgICB9KVxuICAgICAgICAgICAgLm1hcCh2YWx1ZSA9PiAnLi4nKVxuICAgICAgICAgICAgLmNvbmNhdChzb3VyY2VGaWxlUGFydHMpLmpvaW4oJy8nKTtcblxuXG4gICAgfVxufSIsICJpbXBvcnQgeyBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBzdGF0U3luYywgcmVhZGRpclN5bmMsIG1rZGlyU3luYyB9IGZyb20gJ2ZzJ1xuaW1wb3J0IHsgRmlsZVN5c3RlbUFkYXB0ZXIgfSBmcm9tICdvYnNpZGlhbidcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJykucmVtb3RlXG5pbXBvcnQgeyBEb2NGb2xkZXJzIH0gZnJvbSAnLi9Eb2NGb2xkZXJzJztcblxuZXhwb3J0IGNsYXNzIFV0aWxzIHtcbiAgICBhcHA6IEFwcDtcbiAgICAvL1xuICAgIC8vIGZpbGUgc3lzdGVtIHBhdGggc2VwYXJhdG9yXG4gICAgLy9cbiAgICBwdWJsaWMgc2VwYXJhdG9yID0gJy8nO1xuICAgIC8vXG4gICAgLy8gb2JzaWRpYW4gZmlsZSBzeXN0ZW0gYWRhcHRvclxuICAgIC8vXG4gICAgZnNhIDogRmlsZVN5c3RlbUFkYXB0ZXI7XG4gICAgLy9cbiAgICAvLyByZWdleHAgZm9yIGZpbmRpbmcgbWFya2VycyBhbmQgZmlsZSBwYXRoIGV4cHJlc3Npb25zXG4gICAgLy8gZWcgOiBeSklSQTEyMzQtMTIzLXRlc3QtMDAxLWJsYTAwLTg3LXp6ejAwLTA4XG4gICAgLy8gICAgICAgLS0tLS0tLS0tLS0tIHN0b3J5IG1hcmtlciAgXG4gICAgLy8gICAgICAgICAgICAgICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGZpbGUgZm9sZGVyIGFuZCBjb21tZW50IG1hcmtlcnNcbiAgICAvL1xuICAgIG1hcmtlclJlZ0V4cCA9IC9cXHNcXF5bYS16QS1aXStbYS16QS1aMC05XStcXC1bMC05XSsoXFwtW2EtekEtWl0rW2EtekEtWjAtOV0rXFwtWzAtOV0rKSovZztcblxuICAgIGNvbnN0cnVjdG9yKGFwcCA6IEFwcCkgeyBcbiAgICAgICAgdGhpcy5hcHAgPSBhcHA7XG4gICAgICAgIHRoaXMuZnNhID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlciBhcyBGaWxlU3lzdGVtQWRhcHRlcjtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgICogbWFrZSBzdXJlIHRoZSBzZXBhcmF0b3IgcmVnZXggZG9lcyBub3QgaGF2ZSBzaW5nbGUgJ1xcJ1xuICAgICAqL1xuICAgIHRvVmF1bHRUeXBlU2VwZXJhdG9yKCkgeyBpZiAodGhpcy5zZXBhcmF0b3IgPT0gJ1xcXFwnKSB7cmV0dXJuICcvJ30gZWxzZSB7cmV0dXJuICcvJ319XG5cbiAgICAvKipcbiAgICAgKiBSZWN1cnNpdmUgd2FsayB0aGUgZm9sZGVyIGluIGEgbm9uIHZhdWx0IGxvY2F0aW9uLiBHZXQgYWxsIGZpbGUgbmFtZXMgZnJvbVxuICAgICAqIGRpciBhbmQgZG93bndhcmRzXG4gICAgICogQHBhcmFtIGRpciB0byBzY2FuIGZyb21cbiAgICAgKiBAcGFyYW0gZmlsZXMgbGlzdCB3aXRoIGZvbGRlciBuYW1lc1xuICAgICAqIEByZXR1cm5zIGZpbGUgQXJyYXlcbiAgICAgKi9cbiAgICB3YWxrSW5Gb2xkZXJGcm9tRGlyKGRpciA6IHN0cmluZywgZmlsZXMgOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgICAgIGNvbnN0IGZpbGVMaXN0ID0gcmVhZGRpclN5bmMoZGlyKVxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZUxpc3QpIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gYCR7ZGlyfSR7dGhpcy5zZXBhcmF0b3J9JHtmaWxlfWBcbiAgICAgICAgICAgIGlmIChzdGF0U3luYyhuYW1lKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53YWxrSW5Gb2xkZXJGcm9tRGlyKG5hbWUsIGZpbGVzKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKG5hbWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsdGVyIGZpbGVzIGJ5IGV4dGVuc2lvbiB2YWx1ZVxuICAgICAqIEBwYXJhbSBleHRlbnNpb24gdG8gZmlsdGVyIGJ5XG4gICAgICogQHBhcmFtIGZpbGVzIHRvIGZpbHRlciBieSBcbiAgICAgKiBAcmV0dXJucyBmaWx0ZXJlZCBmaWxlIG5hbWVzXG4gICAgICovXG4gICAgZmlsdGVyRmlsZU5hbWVzQnlFeHRlbnNpb24oZXh0ZW5zaW9uIDogc3RyaW5nLCBmaWxlcyA6IEFycmF5PHN0cmluZz4pIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xuICAgICAgICByZXN1bHQgPSBmaWxlcy5maWx0ZXIoZmlsZU5hbWUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVOYW1lLmVuZHNXaXRoKGV4dGVuc2lvbik7XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZ2V0IGFsbCB0aGUgLm1kIGZpbGVzIGZyb20gdGhlIGZvbGRlciByZWN1cnNpdmx5XG4gICAgICogQHBhcmFtIGZvbGRlciB0byBnZXQgdGhlIG1kIGZpbGUgZnJvbVxuICAgICAqIEByZXR1cm5zIGxpc3Qgb2YgbWQgZmlsZXMgaW4gdGhlIGZvbGRlclxuICAgICAqL1xuICAgIGxpc3RNREZpbGVzSW5WYXVsdChmb2xkZXIgOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY29tbWVudEJhc2VQYXRoID0gYCR7dGhpcy5mc2EuZ2V0QmFzZVBhdGgoKX0ke3RoaXMuc2VwYXJhdG9yfSR7Zm9sZGVyfWBcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyRmlsZU5hbWVzQnlFeHRlbnNpb24oXG4gICAgICAgICAgICAnLm1kJyxcbiAgICAgICAgICAgIHRoaXMud2Fsa0luRm9sZGVyRnJvbURpcihjb21tZW50QmFzZVBhdGgsIFtdKSlcbiAgICAgICAgICAgIC5tYXAodmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBmaWxlTmFtZSA9IHZhbHVlLnJlcGxhY2UoYCR7dGhpcy5mc2EuZ2V0QmFzZVBhdGgoKX1gLCAnJyk7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGZpbGVOYW1lLmNvbnRhaW5zKGBcXFxcYCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKGAke3RoaXMuc2VwYXJhdG9yfWAsJy8nKTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmaWxlTmFtZTtcbiAgICAgICAgICAgIH0pOyAgICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIyMgbWFrZURpckluVmF1bHRcbiAgICAgKiBNYWtlIGEgZm9sZGVyIHBhdGggaW4gdGhlIHZhdWx0LiBEcm9wIHRoZSBmaWxlIG5hbWUgLCBrZWVwIHRoZSBwYXRoIGFuZCBjcmVhdGUgaXQuXG4gICAgICogQHBhcmFtIGZzYVxuICAgICAqIEBwYXJhbSBmaWxlUGF0aEFuZE5hbWVcbiAgICAgKi9cbiAgICBtYWtlRGlySW5WYXVsdChmaWxlUGF0aEFuZE5hbWUgOiBzdHJpbmcpIHtcbiAgICAgICAgdmFyIGZpbGVQYXRoID0gZmlsZVBhdGhBbmROYW1lLnNwbGl0KHRoaXMudG9WYXVsdFR5cGVTZXBlcmF0b3IoKSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIGRyb3AgZmlsZSBuYW1lIGZyb20gcGF0aCBhbmQgbmFtZSBhbmQgc3RhcnQgZnJvbSB0aGUgcm9vdCBvZiB0aGUgdmF1bHRcbiAgICAgICAgLy9cbiAgICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zbGljZSgwLCBmaWxlUGF0aC5sZW5ndGggLSAxKS5zbGljZSgxKTtcbiAgICAgICAgZmlsZVBhdGhbMF0gPSBgLyR7ZmlsZVBhdGhbMF19YDtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gY29uc3RydWN0IHBhdGggc3RlcCBieSBzdGVwIFxuICAgICAgICAvL1xuICAgICAgICB2YXIgY29uc3RydWN0ZWRQYXRoIDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgd2hpbGUgKGZpbGVQYXRoLmxlbmd0aCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0cnVjdGVkUGF0aC5wdXNoKCBmaWxlUGF0aFswXSApO1xuICAgICAgICAgICAgdGhpcy5mc2EubWtkaXIoY29uc3RydWN0ZWRQYXRoLmpvaW4oJy8nKSk7XG4gICAgICAgICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnNsaWNlKDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogb3JkZXIgc2V0IGFuZCByZXR1cm4gb3JkZXJlZCBzZXRcbiAgICAgKiBAcGFyYW0gc2V0IHRvIG9yZGVyXG4gICAgICovXG4gICAgc29ydFNldE9mU3RyaW5nKHNldCA6IFNldDxzdHJpbmc+KSA6IFNldDxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc29ydGVkQXJyYXkgPSBBcnJheS5mcm9tKHNldCkuc29ydCgpO1xuICAgICAgICByZXR1cm4gbmV3IFNldDxzdHJpbmc+KHNvcnRlZEFycmF5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqICMjIGNyZWF0ZUZvbGRlcnNcbiAgICAqIENyZWF0ZSBmb2xkZXIgYmVsb3cgZG9jdW1lbnQgcGF0aFxuICAgICpcbiAgICAqIEBwYXJhbSBkb2NQYXRoIHRoYXQgd2FzIHNldCBieSB1c2VyXG4gICAgKiBAcmV0dXJuIHRoZSBEb2NGb2xkZXIgaW5zdGFuY2VcbiAgICAqL1xuICAgIGNyZWF0ZUZvbGRlcnMoZG9jUGF0aCA6IHN0cmluZykge1xuICAgICAgICBjb25zdCBzZXR0aW5nc0Jhc2UxID0gYCR7dGhpcy5mc2EuZ2V0QmFzZVBhdGgoKX0ke3RoaXMuc2VwYXJhdG9yfSR7ZG9jUGF0aH0ke3RoaXMuc2VwYXJhdG9yfWBcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NTdG9yeUZvbGRlcjEgPSBzZXR0aW5nc0Jhc2UxICsgJ3N0b3JpZXMnO1xuICAgICAgICBjb25zdCBzZXR0aW5nc1NvbHV0aW9uRm9sZGVyMSA9IHNldHRpbmdzQmFzZTEgKyAnc29sdXRpb25zJztcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NNYXJrZXJNYXBwaW5nMSA9IHNldHRpbmdzQmFzZTEgKyAnbWFya2VyJztcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NDb21tZW50c01hcHBpbmcxID0gc2V0dGluZ3NCYXNlMSArICdjb21tZW50cyc7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzVGVzdENvbW1lbnRzTWFwcGluZzEgPSBzZXR0aW5nc0Jhc2UxICsgJ3Rlc3QgY29tbWVudHMnICAgICAgICBcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NVbml0VGVzdE1hcHBpbmcxID0gc2V0dGluZ3NCYXNlMSArICd1bml0IHRlc3RzJyAgICAgICAgXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGNyZWF0ZSBmb2xkZXJzIGluIHZhdWx0XG4gICAgICAgIC8vXG4gICAgICAgIG1rZGlyU3luYyhzZXR0aW5nc1N0b3J5Rm9sZGVyMSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIG1rZGlyU3luYyhzZXR0aW5nc1NvbHV0aW9uRm9sZGVyMSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIG1rZGlyU3luYyhzZXR0aW5nc01hcmtlck1hcHBpbmcxLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgbWtkaXJTeW5jKHNldHRpbmdzQ29tbWVudHNNYXBwaW5nMSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIG1rZGlyU3luYyhzZXR0aW5nc1Rlc3RDb21tZW50c01hcHBpbmcxLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgbWtkaXJTeW5jKHNldHRpbmdzVW5pdFRlc3RNYXBwaW5nMSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgXG4gICAgICAgIGNvbnN0IHNldHRpbmdzQmFzZSA9IGAke2RvY1BhdGh9JHt0aGlzLnNlcGFyYXRvcn1gO1xuICAgICAgICBjb25zdCBzZXR0aW5nc1N0b3J5Rm9sZGVyID0gc2V0dGluZ3NCYXNlICsgJ3N0b3JpZXMnO1xuICAgICAgICBjb25zdCBzZXR0aW5nc1NvbHV0aW9uRm9sZGVyID0gc2V0dGluZ3NCYXNlICsgJ3NvbHV0aW9ucyc7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzTWFya2VyTWFwcGluZyA9IHNldHRpbmdzQmFzZSArICdtYXJrZXInO1xuICAgICAgICBjb25zdCBzZXR0aW5nc0NvbW1lbnRzTWFwcGluZyA9IHNldHRpbmdzQmFzZSArICdjb21tZW50cyc7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzVGVzdENvbW1lbnRzTWFwcGluZyA9IHNldHRpbmdzQmFzZSArICd0ZXN0IGNvbW1lbnRzJztcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NVbml0VGVzdE1hcHBpbmcgPSBzZXR0aW5nc0Jhc2UgKyAndW5pdCB0ZXN0cyc7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBEb2NGb2xkZXJzKFxuICAgICAgICAgICAgc2V0dGluZ3NTdG9yeUZvbGRlciwgXG4gICAgICAgICAgICBzZXR0aW5nc1NvbHV0aW9uRm9sZGVyLFxuICAgICAgICAgICAgc2V0dGluZ3NNYXJrZXJNYXBwaW5nLFxuICAgICAgICAgICAgc2V0dGluZ3NDb21tZW50c01hcHBpbmcsXG4gICAgICAgICAgICBzZXR0aW5nc1Rlc3RDb21tZW50c01hcHBpbmcsXG4gICAgICAgICAgICBzZXR0aW5nc1VuaXRUZXN0TWFwcGluZ1xuICAgICAgICAgICAgKTtcbiAgICB9XG5cbn0iLCAiZXhwb3J0IGNsYXNzIERvY0ZvbGRlcnMge1xuICAgIHNldHRpbmdzU3RvcnlGb2xkZXI6IHN0cmluZztcbiAgICBzZXR0aW5nc1NvbHV0aW9uRm9sZGVyOiBzdHJpbmc7XG4gICAgc2V0dGluZ3NNYXJrZXJGb2xkZXI6IHN0cmluZztcbiAgICBzZXR0aW5nc0NvbW1lbnRGb2xkZXI6IHN0cmluZztcbiAgICBzZXR0aW5nc1Rlc3RDb21tZW50Rm9sZGVyOiBzdHJpbmc7XG4gICAgc2V0dGluZ3NVbml0VGVzdEZvbGRlcjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Ioc3RvcnlGb2xkZXI6IHN0cmluZywgc29sdXRpb25Gb2xkZXI6IHN0cmluZywgbWFya2VyTWFwcGluZzogc3RyaW5nLCBjb21tZW50TWFwcGluZzogc3RyaW5nLCB0ZXN0Q29tbWVudE1hcHBpbmc6IHN0cmluZyxcbiAgICAgICAgc2V0dGluZ3NVbml0VGVzdE1hcHBpbmc6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldHRpbmdzU3RvcnlGb2xkZXIgPSBzdG9yeUZvbGRlcjtcbiAgICAgICAgdGhpcy5zZXR0aW5nc1NvbHV0aW9uRm9sZGVyID0gc29sdXRpb25Gb2xkZXI7XG4gICAgICAgIHRoaXMuc2V0dGluZ3NNYXJrZXJGb2xkZXIgPSBtYXJrZXJNYXBwaW5nXG4gICAgICAgIHRoaXMuc2V0dGluZ3NDb21tZW50Rm9sZGVyID0gY29tbWVudE1hcHBpbmc7XG4gICAgICAgIHRoaXMuc2V0dGluZ3NUZXN0Q29tbWVudEZvbGRlciA9IHRlc3RDb21tZW50TWFwcGluZztcbiAgICAgICAgdGhpcy5zZXR0aW5nc1VuaXRUZXN0Rm9sZGVyID0gc2V0dGluZ3NVbml0VGVzdE1hcHBpbmc7XG4gICAgfVxufSIsICJpbXBvcnQgeyBBcHAsIEZpbGVTeXN0ZW1BZGFwdGVyIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICcuL1V0aWxzJ1xuaW1wb3J0IHsgRG9jRm9sZGVycyB9IGZyb20gJy4vRG9jRm9sZGVycyc7XG5pbXBvcnQgeyBzdGF0U3luYywgcmVhZGRpclN5bmMsIG1rZGlyU3luYyB9IGZyb20gJ2ZzJ1xuXG5leHBvcnQgY2xhc3MgQ3Jvc3NDdXR0aW5nQ29uY2VybnMge1xuICAgIHByaXZhdGUgZnNhOiBGaWxlU3lzdGVtQWRhcHRlcjtcbiAgICBwcml2YXRlIGRvY0ZvbGRlcnM6IERvY0ZvbGRlcnM7XG4gICAgcHJpdmF0ZSB1dGlsczogVXRpbHM7XG5cbiAgICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgZG9jRm9sZGVyczogRG9jRm9sZGVycykge1xuICAgICAgICB0aGlzLnV0aWxzID0gbmV3IFV0aWxzKGFwcCk7XG4gICAgICAgIHRoaXMuZnNhID0gdGhpcy51dGlscy5mc2E7XG4gICAgICAgIHRoaXMuZG9jRm9sZGVycyA9IGRvY0ZvbGRlcnM7XG4gICAgfVxuXG4gICAgZ2VuZXJhdGVDcm9zc0N1dHRpbmdDb25jZXJucygpIHtcbiAgICAgICAgY29uc3QgZG9jdW1lbnRUb01hcmtlck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj47XG4gICAgICAgIGNvbnN0IHRlc3REb2N1bWVudFRvTWFya2VyTWFwID0gbmV3IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PjtcbiAgICAgICAgY29uc3Qgc3RvcnlUb01hcmtlck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj47XG4gICAgICAgIGNvbnN0IHRlc3RTdG9yeVRvTWFya2VyTWFwID0gbmV3IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PjtcbiAgICAgICAgY29uc3QgbWFya2VyVG9TdG9yeU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IG1hcmtlclRvVGVzdFN0b3J5TWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgICAgY29uc3QgbWFya2VyVG9Eb2N1bWVudE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IG1hcmtlclRvVGVzdERvY3VtZW50TWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgICAgLy8gZ2V0IGFsbCB0aGUgc29sdXRpb25zIGZpbGVzIHRvIGRlbGV0ZVxuICAgICAgICAvL1xuICAgICAgICBjb25zdCBwcm9taXNlOiBBcnJheTxQcm9taXNlPHZvaWQ+PiA9IG5ldyBBcnJheTxQcm9taXNlPHZvaWQ+PigpO1xuICAgICAgICBjb25zdCBzb2x1dGlvbkZpbGVUb0RlbGV0ZSA9IHRoaXMudXRpbHMubGlzdE1ERmlsZXNJblZhdWx0KHRoaXMuZG9jRm9sZGVycy5zZXR0aW5nc1NvbHV0aW9uRm9sZGVyKTtcbiAgICAgICAgc29sdXRpb25GaWxlVG9EZWxldGUuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgICAgICAgIHByb21pc2UucHVzaCh0aGlzLmZzYS5yZW1vdmUoZmlsZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gd2FpdCBmb3IgYWxsIHByb21pc2VzIHRvIGNvbXBsZXRlXG4gICAgICAgIC8vXG4gICAgICAgIFByb21pc2UuYWxsU2V0dGxlZChwcm9taXNlKVxuICAgICAgICAgICAgLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gY2xlYW51cCB0YXJnZXQgZm9sZGVycywgYnkgdGhlIHRpbWUgdGhlIGZvbGRlcnMgYXJlIGdvdHRlbiBcbiAgICAgICAgICAgICAgICAvLyBpbiBuZXh0IGxpbmVzIHRoaXMgY2xlYW51cCBpcyBkb25lXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICB0aGlzLmZzYS5ybWRpcih0aGlzLmRvY0ZvbGRlcnMuc2V0dGluZ3NTb2x1dGlvbkZvbGRlciwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mc2EubWtkaXIodGhpcy5kb2NGb2xkZXJzLnNldHRpbmdzU29sdXRpb25Gb2xkZXIpO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gZ2V0IGxpc3Qgb2YgbWQgZmlsZXMgaW4gdGhlIGNvbW1lbnQgYW5kIHRlc3QgZm9sZGVyIG9mIHRoZSBkb2N1bWVudHNcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1lbnRNREZpbGVzID0gdGhpcy51dGlscy5saXN0TURGaWxlc0luVmF1bHQodGhpcy5kb2NGb2xkZXJzLnNldHRpbmdzQ29tbWVudEZvbGRlcik7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVzdENvbW1lbnRNREZpbGVzID0gdGhpcy51dGlscy5saXN0TURGaWxlc0luVmF1bHQodGhpcy5kb2NGb2xkZXJzLnNldHRpbmdzVGVzdENvbW1lbnRGb2xkZXIpO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gZ2V0IGxpc3Qgb2YgbWQgZmlsZXMgaW4gdGhlIHN0b3J5IGZvbGRlclxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RvcnlNREZpbGVzID0gdGhpcy51dGlscy5saXN0TURGaWxlc0luVmF1bHQodGhpcy5kb2NGb2xkZXJzLnNldHRpbmdzU3RvcnlGb2xkZXIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRlc3RTdG9yeU1ERmlsZXMgPSB0aGlzLnV0aWxzLmxpc3RNREZpbGVzSW5WYXVsdCh0aGlzLmRvY0ZvbGRlcnMuc2V0dGluZ3NVbml0VGVzdEZvbGRlcik7XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBwaWNrIHVwIGFsbCBtYXJrZXJzIGluIHRoZSBkb2Mgc3RyaW5nIGRvYyBmaWxlIGJ5IGRvYyBmaWxlIGFuZCBhZ2dyZWdhdGUgdGhlIG1hcmtlcnNcbiAgICAgICAgICAgICAgICAvLyBiZWZvcmUgcHJvY2Vzc2luZyB0aGVtXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCBhbGxQcm9taXNlcyA9IG5ldyBBcnJheTxQcm9taXNlPHZvaWQ+PigpO1xuICAgICAgICAgICAgICAgIGNvbW1lbnRNREZpbGVzLmZvckVhY2goY29tbWVudEZpbGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhbGxQcm9taXNlcy5wdXNoKHRoaXMuZnNhLnJlYWQoY29tbWVudEZpbGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlclNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGFsbCB0aGUgbWFya2VycyBpbiB0aGUgdmFsdWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXJrZXJzTWF0Y2ggPSB2YWx1ZS5tYXRjaEFsbCh0aGlzLnV0aWxzLm1hcmtlclJlZ0V4cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbShtYXJrZXJzTWF0Y2gpLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0LmFkZChtYXJrZXJbMF0udHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldCA9IHRoaXMudXRpbHMuc29ydFNldE9mU3RyaW5nKG1hcmtlclNldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jdW1lbnROYW1lID0gY29tbWVudEZpbGUuc3BsaXQoJy8nKS5sYXN0KCkgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldC5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclRvRG9jdW1lbnRNYXAuc2V0KG1hcmtlci50cmltKCksIGRvY3VtZW50TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50TmFtZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnRUb01hcmtlck1hcC5zZXQoZG9jdW1lbnROYW1lLCBtYXJrZXJTZXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB0ZXN0Q29tbWVudE1ERmlsZXMuZm9yRWFjaChjb21tZW50RmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFByb21pc2VzLnB1c2godGhpcy5mc2EucmVhZChjb21tZW50RmlsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXQgYWxsIHRoZSBtYXJrZXJzIGluIHRoZSB2YWx1ZSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hcmtlcnNNYXRjaCA9IHZhbHVlLm1hdGNoQWxsKHRoaXMudXRpbHMubWFya2VyUmVnRXhwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKG1hcmtlcnNNYXRjaCkuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuYWRkKG1hcmtlclswXS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0ID0gdGhpcy51dGlscy5zb3J0U2V0T2ZTdHJpbmcobWFya2VyU2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb2N1bWVudE5hbWUgPSBjb21tZW50RmlsZS5zcGxpdCgnLycpLmxhc3QoKSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0LmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyVG9UZXN0RG9jdW1lbnRNYXAuc2V0KG1hcmtlci50cmltKCksIGRvY3VtZW50TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50TmFtZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdERvY3VtZW50VG9NYXJrZXJNYXAuc2V0KGRvY3VtZW50TmFtZSwgbWFya2VyU2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgc3RvcnlNREZpbGVzLmZvckVhY2goc3RvcnlGaWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWxsUHJvbWlzZXMucHVzaCh0aGlzLmZzYS5yZWFkKHN0b3J5RmlsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXQgYWxsIHRoZSBtYXJrZXJzIGluIHRoZSB2YWx1ZSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hcmtlcnNNYXRjaCA9IHZhbHVlLm1hdGNoQWxsKHRoaXMudXRpbHMubWFya2VyUmVnRXhwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKG1hcmtlcnNNYXRjaCkuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuYWRkKG1hcmtlclswXS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0ID0gdGhpcy51dGlscy5zb3J0U2V0T2ZTdHJpbmcobWFya2VyU2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb2N1bWVudE5hbWUgPSBzdG9yeUZpbGUuc3BsaXQoJy8nKS5sYXN0KCkgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldC5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclRvU3RvcnlNYXAuc2V0KG1hcmtlci50cmltKCksIHN0b3J5RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50TmFtZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcnlUb01hcmtlck1hcC5zZXQoZG9jdW1lbnROYW1lLCBtYXJrZXJTZXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB0ZXN0U3RvcnlNREZpbGVzLmZvckVhY2goc3RvcnlGaWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWxsUHJvbWlzZXMucHVzaCh0aGlzLmZzYS5yZWFkKHN0b3J5RmlsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXQgYWxsIHRoZSBtYXJrZXJzIGluIHRoZSB2YWx1ZSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hcmtlcnNNYXRjaCA9IHZhbHVlLm1hdGNoQWxsKHRoaXMudXRpbHMubWFya2VyUmVnRXhwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKG1hcmtlcnNNYXRjaCkuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuYWRkKG1hcmtlclswXS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0ID0gdGhpcy51dGlscy5zb3J0U2V0T2ZTdHJpbmcobWFya2VyU2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb2N1bWVudE5hbWUgPSBzdG9yeUZpbGUuc3BsaXQoJy8nKS5sYXN0KCkgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldC5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclRvVGVzdFN0b3J5TWFwLnNldCh0aGlzLmRyb3BSaWdodEFuZE1rU3RyaW5nKG1hcmtlci50cmltKCkuc3BsaXQoXCItXCIpLCA0LCBcIi1cIiksIHN0b3J5RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50TmFtZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdFN0b3J5VG9NYXJrZXJNYXAuc2V0KGRvY3VtZW50TmFtZSwgbWFya2VyU2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgUHJvbWlzZS5hbGxTZXR0bGVkKGFsbFByb21pc2VzKVxuICAgICAgICAgICAgICAgICAgICAudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29sbGVjdCBhbGwgbWFya2VycyBpbiBvbmUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc29ydCB0aGVtIHRoZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdyb3VwIGJ5IHBhdGgvbmFtZS5tZCBleGNsdWRpbmcgdGhlIHNlcSBudW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3RPZk1hcmtlcnM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdW5pdFRlc3RNYXJrZXJzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKGRvY3VtZW50VG9NYXJrZXJNYXAudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goc2V0T2ZNYXJrZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hbExpc3RPZk1hcmtlcnM6IHN0cmluZ1tdID0gQXJyYXkuZnJvbShzZXRPZk1hcmtlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0T2ZNYXJrZXJzID0gbGlzdE9mTWFya2Vycy5jb25jYXQobG9hbExpc3RPZk1hcmtlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbSh0ZXN0RG9jdW1lbnRUb01hcmtlck1hcC52YWx1ZXMoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChzZXRPZk1hcmtlcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FsTGlzdE9mTWFya2Vyczogc3RyaW5nW10gPSBBcnJheS5mcm9tKHNldE9mTWFya2Vycyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXRUZXN0TWFya2VycyA9IHVuaXRUZXN0TWFya2Vycy5jb25jYXQobG9hbExpc3RPZk1hcmtlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdE9mTWFya2Vycy5zb3J0KChhLCBiKSA9PiBhLmxvY2FsZUNvbXBhcmUoYikpXG4gICAgICAgICAgICAgICAgICAgICAgICB1bml0VGVzdE1hcmtlcnMuc29ydCgoYSwgYikgPT4gYS5sb2NhbGVDb21wYXJlKGIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFsbE1hcmtlcnMgPSB0aGlzLmdyb3VwZWRNYXAobGlzdE9mTWFya2VycywgaSA9PiB0aGlzLnNvbHV0aW9uRG9jTmFtZUZyb21NYXJrZXIoaSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFsbFVuaXRUZXN0TWFya2VycyA9IHRoaXMuZ3JvdXBlZFVuaXRUZXN0TWFwKHVuaXRUZXN0TWFya2Vycyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKGFsbE1hcmtlcnMpLmZvckVhY2goKFtzb2xOYW1lLCBtYXJrZXJzXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZFN0cmluZyA9IGAjICR7dGhpcy5kcm9wUmlnaHRBbmRNa1N0cmluZyhzb2xOYW1lLnNwbGl0KFwiL1wiKSwgMSwgXCIgXCIpLnRvVXBwZXJDYXNlKCl9XFxuYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1aWxkIGxpbmsgdG8gc3RvcnksIGZpbHRlciB0aGUgc3RvcnkgbWFya2VycyBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyVG9TdG9yeTogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LmZyb20obWFya2VyVG9TdG9yeU1hcC5lbnRyaWVzKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChba2V5XSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0TWFya2VyID0ga2V5LnNwbGl0KFwiLVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFya2Vyc1swXS5zdGFydHNXaXRoKHRoaXMuZHJvcFJpZ2h0QW5kTWtTdHJpbmcoc3BsaXRNYXJrZXIsIDEsICctJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXR1cCBkaWUgc3RvcnkgbGlua3MgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArICcjIyBGdW5jdGlvbmFsIFJlcXVpcmVtZW50XFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJUb1N0b3J5LmZvckVhY2goKHN0b3J5LCBtYXJrZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcmtlclRvU3RvcnlNYXAuZ2V0KG1hcmtlcikgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZFN0cmluZyA9IG1kU3RyaW5nICsgYCFbWyR7bWFya2VyVG9TdG9yeU1hcC5nZXQobWFya2VyKX0jJHttYXJrZXIudHJpbSgpfV1dXFxuYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5pcXVlTWFrZXJzID0gQXJyYXkuZnJvbShuZXcgU2V0KG1hcmtlcnMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxdWVNYWtlcnMuZm9yRWFjaCgobWFya2VyLCBzdG9yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZFN0cmluZyA9IG1kU3RyaW5nICsgJyMjIEltcGxpbWVudGF0aW9uIFNvbHV0aW9uXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcmtlclRvRG9jdW1lbnRNYXAuZ2V0KG1hcmtlcikgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb2N1bWVudCA9IG1hcmtlclRvRG9jdW1lbnRNYXAuZ2V0KG1hcmtlcikhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArIGAhW1ske2RvY3VtZW50fSMke21hcmtlci50cmltKCl9XV1cXG5gO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHVuaXQgdGVzdHMgZm9yIHRoZSBkb2N1bWVudCBleGlzIHRoZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByaW50IG91dCB0aGVzZSB1bml0IHRlc3RzIC0gdGhlcmUgYmUgZHJhZ29ucyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbFVuaXRUZXN0TWFya2Vycy5nZXQobWFya2VyKSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZFN0cmluZyA9IG1kU3RyaW5nICsgJyMjIyBVbml0IFRlc3QgSW1wbGVtZW50YXRpb25cXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbFVuaXRUZXN0TWFya2Vycy5nZXQobWFya2VyKSEuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1Rlc3RNYXJrZXIobWFya2VyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArIGAhW1ske21hcmtlclRvVGVzdERvY3VtZW50TWFwLmdldChtYXJrZXIpfSMke21hcmtlci50cmltKCl9XV1cXG5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBmb2xkZXIgcGF0aCBpZiByZXF1aXJlZCBhbmQgd3JpdGUgb3V0IHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXRpbHMubWFrZURpckluVmF1bHQoc29sTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mc2Eud3JpdGUoc29sTmFtZSwgbWRTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB2YWx1ZXMgZHJvcCB0aGUgcmlnaHRtb3N0IG50aCBzdHJpbmcgYW5kIGpvaW4gdXNpbmcgdGhlIGRlbGltaXRlclxuICAgICAqIEBwYXJhbSBuIHN0cmluZyB0byBkcm9wIG9uIHRoZSByaWdodFxuICAgICAqIEBwYXJhbSBkZWxpbWl0ZXIgdXNlZCB0byBqb2luIFxuICAgICAqIEByZXR1cm5zIHJlc3VsdGluZyBzdHJpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIGRyb3BSaWdodEFuZE1rU3RyaW5nKHZhbHVlczogc3RyaW5nW10sIG46IG51bWJlciwgZGVsaW1pdGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdmFsdWVzLnNsaWNlKDAsIHZhbHVlcy5sZW5ndGggLSAobikpLmpvaW4oZGVsaW1pdGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdmFsdWVzIGRyb3AgdGhlIGxlZnRtb3N0IG50aCBzdHJpbmcgYW4gcmV0dXJuIHRoZSByZXN1bHRcbiAgICAgKiBAcGFyYW0gbiBzdHJpbmcgdG8gZHJvcCBvbiB0aGUgcmlnaHRcbiAgICAgKiBAcGFyYW0gZGVsaW1pdGVyIHVzZWQgdG8gam9pbiBcbiAgICAgKiBAcmV0dXJucyByZXN1bHRpbmcgc3RyaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSBkcm9wTGVmdEFuZE1rU3RyaW5nKHZhbHVlczogc3RyaW5nW10sIG46IG51bWJlciwgZGVsaW1pdGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdmFsdWVzLnNsaWNlKG4sIHZhbHVlcy5sZW5ndGggLSAobikpLmpvaW4oZGVsaW1pdGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzcGxpdCBzb2xOYW1lIGluIGdyb3VwcyBvZiAyIGpvaW5lZCBieSAvXG4gICAgICogQHBhcmFtIHNvbE5hbWUgc29sdXRpb24gbmFtZVxuICAgICAqIEBwYXJhbSBtYXBwaW5nIG1hcmtlclNldFxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0U29sdXRpb25GaWxlTmFtZShzb2xOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBmaWxlTmFtZVBhcnRzID0gc29sTmFtZS5zcGxpdChcIi1cIilcbiAgICAgICAgdmFyIGZpbGVOYW1lOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBmaWxlTmFtZVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSAlIDIgPT0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChpID09IGZpbGVOYW1lUGFydHMubGVuZ3RoIC0gMikge1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5wdXNoKGZpbGVOYW1lUGFydHNbaV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLnB1c2goZmlsZU5hbWVQYXJ0c1tpXSArIFwiLVwiICsgZmlsZU5hbWVQYXJ0c1tpICsgMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYC8ke2ZpbGVOYW1lLmpvaW4oXCIvXCIpfWBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUYWtlIGEgbWFya2VyIHN0cmluZyBhbmQgY29udmVydCBpbnRvIGZpbGUgcGF0aCAvIGZpbGUgbmFtZS5tZC4gb2YgdGhlIG1hcmtlciBcbiAgICAgKiBleGNsdWRpbmcgdGhlIC1bMC05XSsgYXQgdGhlIGVuZCwgaXMgaW4gbWFwcGluZyB0aGVuIHVzZSB0aGF0IG1hcHBpbmcgdmFsdWUuXG4gICAgICogbWFya2VycyBoYXZlIHRoZSBmb2xsbG93aW5nIGZvcm1hdCA6XG4gICAgICogXG4gICAgICogMS4gXkpJUkExMjM0LTAwMSA8XG4gICAgICogMi4gXkpJUkExMjM0LTAwMS1zb2x1dGlvbi0wMDFcbiAgICAgKiAzLiBeSklSQTEyMzQtMDAxLXNvbHV0aW9uLTAwMS10ZXN0LTAwMVxuICAgICAqIFxuICAgICAqIDEgbWFya2VyIGNvbnZlcnRlZCB0byBmaWxlbmFtZVxuICAgICAqIDIgbWFya2VyIGNvbnZlcnRlZCB0byBwYXRoICsgZmlsZW5hbWVcbiAgICAgKiAzIG1hcmtlciBjb252ZXJ0ZWQgdG8gcGF0aCArIGZpbGVuYW5tZSB3aGVyZSAtIGlkZW50aWNhbCB0byAyLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBtYXJrZXIgaW4gZG9jdW1lbnQgc3RyaW5nXG4gICAgICogQHJldHVybiB0aGUgbmFtZSBvZiB0aGUgcGF0aCBhbmQgZmlsZSBuYW1lLm1kXG4gICAgICovXG4gICAgcHJpdmF0ZSBzb2x1dGlvbkRvY05hbWVGcm9tTWFya2VyKG1hcmtlcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgZG9jTmFtZSA9IHRoaXMuZ2V0U29sdXRpb25GaWxlTmFtZShtYXJrZXIucmVwbGFjZShcIl5cIiwgXCJcIikpO1xuICAgICAgICBjb25zdCBzb2x1dGlvbk5hbWUgPSBgJHtkb2NOYW1lfS5tZGA7XG4gICAgICAgIHJldHVybiBgLyR7dGhpcy5kb2NGb2xkZXJzLnNldHRpbmdzU29sdXRpb25Gb2xkZXJ9JHtzb2x1dGlvbk5hbWV9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHcm91cCBieSB0aGUgbGlzdCBhY2NvcmRpbmcgdG8gYSBnZXRLZXkgZnVuY3Rpb24uIEl0IHdpbGwgYmUgb25lIGtleSBcbiAgICAgKiB0byBtYW55IHBvdGVudGlhbCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0gbGlzdCBvZiBlbGVtZW50cyB0byBncm91cCBieVxuICAgICAqIEBwYXJhbSBnZXRLZXkgZ3JvdXAgYnkga2V5XG4gICAgICogQHJldHVybnMgdGhlIGdyb3VwZWQgbGlzdFxuICAgICAqL1xuICAgIHByaXZhdGUgZ3JvdXBlZE1hcChhcnJheTogc3RyaW5nW10sIGdldEtleTogKGk6IHN0cmluZykgPT4gc3RyaW5nKTogTWFwPHN0cmluZywgc3RyaW5nW10+IHtcbiAgICAgICAgcmV0dXJuIGFycmF5LnJlZHVjZSgobWFwLCBjdXJyZW50VmFsdWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGdldEtleShjdXJyZW50VmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoIW1hcC5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgIG1hcC5zZXQoa2V5LCBbXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtYXAuZ2V0KGtleSkgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWFwPy5nZXQoa2V5KT8ucHVzaChjdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9LCBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdyb3VwIGJ5IHRoZSBsaXN0IGFjY29yZGluZyB0byBhIGdldEtleSBmdW5jdGlvbi4gSXQgd2lsbCBiZSBvbmUga2V5IFxuICAgICAqIHRvIG1hbnkgcG90ZW50aWFsIHZhbHVlc1xuICAgICAqIEBwYXJhbSBsaXN0IG9mIGVsZW1lbnRzIHRvIGdyb3VwIGJ5LCBUaGUgbGlzdCBpbiB0aGlzIGNhc2Ugd2lsbCBjb250YWluIHN0cmluZyBmb3JtYXR0ZWRcbiAgICAgKiBhcyBKSVJBMTIzNC0wMDEtc29sdXRpb24tMDAxLXRlc3QtMDAxLiBcbiAgICAgKiBAcGFyYW0gZ2V0S2V5IGdyb3VwIGJ5IGtleVxuICAgICAqIEByZXR1cm5zIHRoZSBncm91cGVkIGxpc3QuIFRoZSBNYXA8c29sTmFtZSwgTWFwPERvY3VtZW50IE1hcmtlciBtYXJrZXIgbGluaywgTGlzdDxzdHJpbmc+KFVuaXQgdGVzdCBsaW5rcyk+ID5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdyb3VwZWRVbml0VGVzdE1hcChhcnJheTogc3RyaW5nW10pOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT4ge1xuICAgICAgICByZXR1cm4gYXJyYXkucmVkdWNlKChtYXAsIGN1cnJlbnRWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gY3VycmVudFZhbHVlLnNwbGl0KFwiLVwiKTtcbiAgICAgICAgICAgIGNvbnN0IGtleVZhbHVlID0gdGhpcy5kcm9wUmlnaHRBbmRNa1N0cmluZyhrZXksIDIsIFwiLVwiKTtcblxuICAgICAgICAgICAgaWYgKCFtYXAuaGFzKGtleVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIG1hcC5zZXQoa2V5VmFsdWUsIFtdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1hcC5nZXQoa2V5VmFsdWUpICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG1hcD8uZ2V0KGtleVZhbHVlKT8ucHVzaChjdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9LCBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGlzIHRoaXMgYSB0ZXN0IG1hcmtlclxuICAgICAqIEBwYXJhbSBtYXJrZXIgdG8gY2hlY2sgaXMgaXQgaGFzIGxlZ3RoIDZcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzVGVzdE1hcmtlcihtYXJrZXI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gbWFya2VyLnNwbGl0KFwiLVwiKS5sZW5ndGggPT0gOFxuICAgIH1cblxufVxuIiwgImltcG9ydCB7IEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnLi9VdGlscydcbmltcG9ydCB7IERvY0ZvbGRlcnMgfSBmcm9tICcuL0RvY0ZvbGRlcnMnO1xuXG5leHBvcnQgY2xhc3MgTWFya2VyR3JvdXBMaXN0IHtcblxuICAgIG1hcmtlckZpbGVXaXRoUGF0aCA6IHN0cmluZztcbiAgICB1dGlscyA6IFV0aWxzO1xuICAgIGRvY0ZvbGRlcnMgOiBEb2NGb2xkZXJzO1xuXG4gICAgY29uc3RydWN0b3IoYXBwIDogQXBwLCBkb2NGb2xkZXJzIDogRG9jRm9sZGVycykge1xuICAgICAgICB0aGlzLm1hcmtlckZpbGVXaXRoUGF0aCA9IGAke2RvY0ZvbGRlcnMuc2V0dGluZ3NNYXJrZXJGb2xkZXJ9L21hcmtlci10YWJsZS5tZGBcbiAgICAgICAgdGhpcy51dGlscyA9IG5ldyBVdGlscyhhcHApO1xuICAgICAgICB0aGlzLmRvY0ZvbGRlcnMgPSBkb2NGb2xkZXJzO1xuICAgIH1cblxuICAgIGdlbmVyYXRlTWFrZXJHcm91cExpc3QoKSB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHNvbWUgY29udGFpbmVycyB0byB1c2UgbGF0ZXIgb25cbiAgICAgICAgLy9cbiAgICAgICAgY29uc3QgbWFya2VyVG9Eb2N1bWVudE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4oKTtcbiAgICAgICAgY29uc3QgbWFya2VyVG9UZXN0RG9jdW1lbnRNYXAgPSBuZXcgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+KCk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIGdldCBhbGwgdGhlIGRvYyBmaWxlcyB0byBzY2FuXG4gICAgICAgIC8vXG4gICAgICAgIGNvbnN0IGNvbW1lbnRGaWxlcyA9IHRoaXMudXRpbHMubGlzdE1ERmlsZXNJblZhdWx0KHRoaXMuZG9jRm9sZGVycy5zZXR0aW5nc0NvbW1lbnRGb2xkZXIpO1xuICAgICAgICBjb25zdCB0ZXN0Q29tbWVudEZpbGVzID0gdGhpcy51dGlscy5saXN0TURGaWxlc0luVmF1bHQodGhpcy5kb2NGb2xkZXJzLnNldHRpbmdzVGVzdENvbW1lbnRGb2xkZXIpO1xuICAgICAgICAvL1xuICAgICAgICAvLyBwaWNrIHVwIGFsbCBtYXJrZXJzIGluIHRoZSBkb2Mgc3RyaW5nIGRvYyBmaWxlIGJ5IGRvYyBmaWxlIGFuZCBhZ2dyZWdhdGUgdGhlIG1hcmtlcnNcbiAgICAgICAgLy8gYmVmb3JlIHByb2Nlc3NpbmcgdGhlbVxuICAgICAgICAvL1xuICAgICAgICBjb25zdCBwcm9taXNlOiBBcnJheTxQcm9taXNlPHZvaWQ+PiA9IG5ldyBBcnJheTxQcm9taXNlPHZvaWQ+PigpO1xuICAgICAgICBjb21tZW50RmlsZXMuZm9yRWFjaChjb21tZW50RmlsZSA9PiB7XG4gICAgICAgICAgICBwcm9taXNlLnB1c2godGhpcy51dGlscy5mc2EucmVhZChjb21tZW50RmlsZSlcbiAgICAgICAgICAgICAgICAudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGFsbCB0aGUgbWFya2VycyBpbiB0aGUgdmFsdWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWFya2Vyc01hdGNoID0gdmFsdWUubWF0Y2hBbGwodGhpcy51dGlscy5tYXJrZXJSZWdFeHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbShtYXJrZXJzTWF0Y2gpLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuYWRkKG1hcmtlclswXS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldCA9IHRoaXMudXRpbHMuc29ydFNldE9mU3RyaW5nKG1hcmtlclNldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWFya2VyVG9Eb2N1bWVudE1hcC5oYXMobWFya2VyLnRyaW0oKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyVG9Eb2N1bWVudE1hcC5zZXQobWFya2VyLCBuZXcgU2V0PHN0cmluZz4oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclRvRG9jdW1lbnRNYXAuZ2V0KG1hcmtlci50cmltKCkpPy5hZGQoY29tbWVudEZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSlcbiAgICAgICAgdGVzdENvbW1lbnRGaWxlcy5mb3JFYWNoKGNvbW1lbnRGaWxlID0+IHtcbiAgICAgICAgICAgIHByb21pc2UucHVzaCh0aGlzLnV0aWxzLmZzYS5yZWFkKGNvbW1lbnRGaWxlKVxuICAgICAgICAgICAgICAgIC50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXJTZXQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXQgYWxsIHRoZSBtYXJrZXJzIGluIHRoZSB2YWx1ZSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXJrZXJzTWF0Y2ggPSB2YWx1ZS5tYXRjaEFsbCh0aGlzLnV0aWxzLm1hcmtlclJlZ0V4cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKG1hcmtlcnNNYXRjaCkuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldC5hZGQobWFya2VyWzBdLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0ID0gdGhpcy51dGlscy5zb3J0U2V0T2ZTdHJpbmcobWFya2VyU2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldC5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXJrZXJUb1Rlc3REb2N1bWVudE1hcC5oYXMobWFya2VyLnRyaW0oKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyVG9UZXN0RG9jdW1lbnRNYXAuc2V0KG1hcmtlciwgbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJUb1Rlc3REb2N1bWVudE1hcC5nZXQobWFya2VyLnRyaW0oKSk/LmFkZChjb21tZW50RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KVxuICAgICAgICBQcm9taXNlLmFsbFNldHRsZWQocHJvbWlzZSlcbiAgICAgICAgICAgIC50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhbGxNYXJrZXJzID0gQXJyYXkuZnJvbShtYXJrZXJUb0RvY3VtZW50TWFwLmtleXMoKSkuc29ydCgpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG1kU3RyaW5nID0gXCJDb2RlIGFuZCBDb2RlIFN0b3J5IGxpbmtzXFxuXFxuXCI7XG4gICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArIGB8bWFya2VyfGRvY3VtZW50fFxcbmA7XG4gICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArIGB8LS0tLS0tfC0tLS0tLS0tfFxcbmA7XG4gICAgICAgICAgICAgICAgYWxsTWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvY05hbWVTZXQgPSBtYXJrZXJUb0RvY3VtZW50TWFwLmdldChtYXJrZXIpO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZCBtYXJrZXIgdG8gZG9jIGVudHJ5IGZyb20gdGhlIHNldCBvZiBkb2N1bWVudCBuYW1lcy5cbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgZG9jTmFtZVNldD8uZm9yRWFjaChkb2NOYW1lID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyBgfCR7bWFya2VyLnN1YnN0cmluZygxKX18W1ske2RvY05hbWV9IyR7bWFya2VyfV1dXFxuYDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgY29uc3QgYWxsVGVzdE1hcmtlcnMgPSBBcnJheS5mcm9tKG1hcmtlclRvVGVzdERvY3VtZW50TWFwLmtleXMoKSkuc29ydCgpO1xuXG4gICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArIFwiXFxuVGVzdCBhbmQgVGVzdCBTdG9yeSBsaW5rc1xcblxcblwiO1xuICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyBgfG1hcmtlcnxkb2N1bWVudHxcXG5gO1xuICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyBgfC0tLS0tLXwtLS0tLS0tLXxcXG5gO1xuICAgICAgICAgICAgICAgIGFsbFRlc3RNYXJrZXJzLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jTmFtZVNldCA9IG1hcmtlclRvVGVzdERvY3VtZW50TWFwLmdldChtYXJrZXIpO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZCBtYXJrZXIgdG8gdGVzdCBkb2MgZW50cnkgZnJvbSB0aGUgc2V0IG9mIGRvY3VtZW50IG5hbWVzLlxuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICBkb2NOYW1lU2V0Py5mb3JFYWNoKGRvY05hbWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArIGB8JHttYXJrZXIuc3Vic3RyaW5nKDEpfXxbWyR7ZG9jTmFtZX0jJHttYXJrZXJ9XV1cXG5gO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMudXRpbHMuZnNhLndyaXRlKHRoaXMubWFya2VyRmlsZVdpdGhQYXRoLCBtZFN0cmluZyk7XG4gICAgICAgICAgICB9KVxuICAgIH1cbn0iLCAibGV0IHdhc207XG5cbmNvbnN0IGhlYXAgPSBuZXcgQXJyYXkoMTI4KS5maWxsKHVuZGVmaW5lZCk7XG5cbmhlYXAucHVzaCh1bmRlZmluZWQsIG51bGwsIHRydWUsIGZhbHNlKTtcblxuZnVuY3Rpb24gZ2V0T2JqZWN0KGlkeCkgeyByZXR1cm4gaGVhcFtpZHhdOyB9XG5cbmxldCBXQVNNX1ZFQ1RPUl9MRU4gPSAwO1xuXG5sZXQgY2FjaGVkVWludDhNZW1vcnkwID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0VWludDhNZW1vcnkwKCkge1xuICAgIGlmIChjYWNoZWRVaW50OE1lbW9yeTAgPT09IG51bGwgfHwgY2FjaGVkVWludDhNZW1vcnkwLmJ5dGVMZW5ndGggPT09IDApIHtcbiAgICAgICAgY2FjaGVkVWludDhNZW1vcnkwID0gbmV3IFVpbnQ4QXJyYXkod2FzbS5tZW1vcnkuYnVmZmVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlZFVpbnQ4TWVtb3J5MDtcbn1cblxuY29uc3QgY2FjaGVkVGV4dEVuY29kZXIgPSAodHlwZW9mIFRleHRFbmNvZGVyICE9PSAndW5kZWZpbmVkJyA/IG5ldyBUZXh0RW5jb2RlcigndXRmLTgnKSA6IHsgZW5jb2RlOiAoKSA9PiB7IHRocm93IEVycm9yKCdUZXh0RW5jb2RlciBub3QgYXZhaWxhYmxlJykgfSB9ICk7XG5cbmNvbnN0IGVuY29kZVN0cmluZyA9ICh0eXBlb2YgY2FjaGVkVGV4dEVuY29kZXIuZW5jb2RlSW50byA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gZnVuY3Rpb24gKGFyZywgdmlldykge1xuICAgIHJldHVybiBjYWNoZWRUZXh0RW5jb2Rlci5lbmNvZGVJbnRvKGFyZywgdmlldyk7XG59XG4gICAgOiBmdW5jdGlvbiAoYXJnLCB2aWV3KSB7XG4gICAgY29uc3QgYnVmID0gY2FjaGVkVGV4dEVuY29kZXIuZW5jb2RlKGFyZyk7XG4gICAgdmlldy5zZXQoYnVmKTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZWFkOiBhcmcubGVuZ3RoLFxuICAgICAgICB3cml0dGVuOiBidWYubGVuZ3RoXG4gICAgfTtcbn0pO1xuXG5mdW5jdGlvbiBwYXNzU3RyaW5nVG9XYXNtMChhcmcsIG1hbGxvYywgcmVhbGxvYykge1xuXG4gICAgaWYgKHJlYWxsb2MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBidWYgPSBjYWNoZWRUZXh0RW5jb2Rlci5lbmNvZGUoYXJnKTtcbiAgICAgICAgY29uc3QgcHRyID0gbWFsbG9jKGJ1Zi5sZW5ndGgsIDEpID4+PiAwO1xuICAgICAgICBnZXRVaW50OE1lbW9yeTAoKS5zdWJhcnJheShwdHIsIHB0ciArIGJ1Zi5sZW5ndGgpLnNldChidWYpO1xuICAgICAgICBXQVNNX1ZFQ1RPUl9MRU4gPSBidWYubGVuZ3RoO1xuICAgICAgICByZXR1cm4gcHRyO1xuICAgIH1cblxuICAgIGxldCBsZW4gPSBhcmcubGVuZ3RoO1xuICAgIGxldCBwdHIgPSBtYWxsb2MobGVuLCAxKSA+Pj4gMDtcblxuICAgIGNvbnN0IG1lbSA9IGdldFVpbnQ4TWVtb3J5MCgpO1xuXG4gICAgbGV0IG9mZnNldCA9IDA7XG5cbiAgICBmb3IgKDsgb2Zmc2V0IDwgbGVuOyBvZmZzZXQrKykge1xuICAgICAgICBjb25zdCBjb2RlID0gYXJnLmNoYXJDb2RlQXQob2Zmc2V0KTtcbiAgICAgICAgaWYgKGNvZGUgPiAweDdGKSBicmVhaztcbiAgICAgICAgbWVtW3B0ciArIG9mZnNldF0gPSBjb2RlO1xuICAgIH1cblxuICAgIGlmIChvZmZzZXQgIT09IGxlbikge1xuICAgICAgICBpZiAob2Zmc2V0ICE9PSAwKSB7XG4gICAgICAgICAgICBhcmcgPSBhcmcuc2xpY2Uob2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBwdHIgPSByZWFsbG9jKHB0ciwgbGVuLCBsZW4gPSBvZmZzZXQgKyBhcmcubGVuZ3RoICogMywgMSkgPj4+IDA7XG4gICAgICAgIGNvbnN0IHZpZXcgPSBnZXRVaW50OE1lbW9yeTAoKS5zdWJhcnJheShwdHIgKyBvZmZzZXQsIHB0ciArIGxlbik7XG4gICAgICAgIGNvbnN0IHJldCA9IGVuY29kZVN0cmluZyhhcmcsIHZpZXcpO1xuXG4gICAgICAgIG9mZnNldCArPSByZXQud3JpdHRlbjtcbiAgICAgICAgcHRyID0gcmVhbGxvYyhwdHIsIGxlbiwgb2Zmc2V0LCAxKSA+Pj4gMDtcbiAgICB9XG5cbiAgICBXQVNNX1ZFQ1RPUl9MRU4gPSBvZmZzZXQ7XG4gICAgcmV0dXJuIHB0cjtcbn1cblxuZnVuY3Rpb24gaXNMaWtlTm9uZSh4KSB7XG4gICAgcmV0dXJuIHggPT09IHVuZGVmaW5lZCB8fCB4ID09PSBudWxsO1xufVxuXG5sZXQgY2FjaGVkSW50MzJNZW1vcnkwID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0SW50MzJNZW1vcnkwKCkge1xuICAgIGlmIChjYWNoZWRJbnQzMk1lbW9yeTAgPT09IG51bGwgfHwgY2FjaGVkSW50MzJNZW1vcnkwLmJ5dGVMZW5ndGggPT09IDApIHtcbiAgICAgICAgY2FjaGVkSW50MzJNZW1vcnkwID0gbmV3IEludDMyQXJyYXkod2FzbS5tZW1vcnkuYnVmZmVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlZEludDMyTWVtb3J5MDtcbn1cblxubGV0IGhlYXBfbmV4dCA9IGhlYXAubGVuZ3RoO1xuXG5mdW5jdGlvbiBkcm9wT2JqZWN0KGlkeCkge1xuICAgIGlmIChpZHggPCAxMzIpIHJldHVybjtcbiAgICBoZWFwW2lkeF0gPSBoZWFwX25leHQ7XG4gICAgaGVhcF9uZXh0ID0gaWR4O1xufVxuXG5mdW5jdGlvbiB0YWtlT2JqZWN0KGlkeCkge1xuICAgIGNvbnN0IHJldCA9IGdldE9iamVjdChpZHgpO1xuICAgIGRyb3BPYmplY3QoaWR4KTtcbiAgICByZXR1cm4gcmV0O1xufVxuXG5jb25zdCBjYWNoZWRUZXh0RGVjb2RlciA9ICh0eXBlb2YgVGV4dERlY29kZXIgIT09ICd1bmRlZmluZWQnID8gbmV3IFRleHREZWNvZGVyKCd1dGYtOCcsIHsgaWdub3JlQk9NOiB0cnVlLCBmYXRhbDogdHJ1ZSB9KSA6IHsgZGVjb2RlOiAoKSA9PiB7IHRocm93IEVycm9yKCdUZXh0RGVjb2RlciBub3QgYXZhaWxhYmxlJykgfSB9ICk7XG5cbmlmICh0eXBlb2YgVGV4dERlY29kZXIgIT09ICd1bmRlZmluZWQnKSB7IGNhY2hlZFRleHREZWNvZGVyLmRlY29kZSgpOyB9O1xuXG5mdW5jdGlvbiBnZXRTdHJpbmdGcm9tV2FzbTAocHRyLCBsZW4pIHtcbiAgICBwdHIgPSBwdHIgPj4+IDA7XG4gICAgcmV0dXJuIGNhY2hlZFRleHREZWNvZGVyLmRlY29kZShnZXRVaW50OE1lbW9yeTAoKS5zdWJhcnJheShwdHIsIHB0ciArIGxlbikpO1xufVxuXG5mdW5jdGlvbiBhZGRIZWFwT2JqZWN0KG9iaikge1xuICAgIGlmIChoZWFwX25leHQgPT09IGhlYXAubGVuZ3RoKSBoZWFwLnB1c2goaGVhcC5sZW5ndGggKyAxKTtcbiAgICBjb25zdCBpZHggPSBoZWFwX25leHQ7XG4gICAgaGVhcF9uZXh0ID0gaGVhcFtpZHhdO1xuXG4gICAgaGVhcFtpZHhdID0gb2JqO1xuICAgIHJldHVybiBpZHg7XG59XG4vKipcbiogQHBhcmFtIHtzdHJpbmd9IHN0clxuKiBAcmV0dXJucyB7c3RyaW5nfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FuX2Zvcl9jb21tZW50cyhzdHIpIHtcbiAgICBjb25zdCByZXQgPSB3YXNtLnNjYW5fZm9yX2NvbW1lbnRzKGFkZEhlYXBPYmplY3Qoc3RyKSk7XG4gICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gX193YmdfbG9hZChtb2R1bGUsIGltcG9ydHMpIHtcbiAgICBpZiAodHlwZW9mIFJlc3BvbnNlID09PSAnZnVuY3Rpb24nICYmIG1vZHVsZSBpbnN0YW5jZW9mIFJlc3BvbnNlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKG1vZHVsZSwgaW1wb3J0cyk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobW9kdWxlLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSAhPSAnYXBwbGljYXRpb24vd2FzbScpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nYCBmYWlsZWQgYmVjYXVzZSB5b3VyIHNlcnZlciBkb2VzIG5vdCBzZXJ2ZSB3YXNtIHdpdGggYGFwcGxpY2F0aW9uL3dhc21gIE1JTUUgdHlwZS4gRmFsbGluZyBiYWNrIHRvIGBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZWAgd2hpY2ggaXMgc2xvd2VyLiBPcmlnaW5hbCBlcnJvcjpcXG5cIiwgZSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJ5dGVzID0gYXdhaXQgbW9kdWxlLmFycmF5QnVmZmVyKCk7XG4gICAgICAgIHJldHVybiBhd2FpdCBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZShieXRlcywgaW1wb3J0cyk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IGF3YWl0IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKG1vZHVsZSwgaW1wb3J0cyk7XG5cbiAgICAgICAgaWYgKGluc3RhbmNlIGluc3RhbmNlb2YgV2ViQXNzZW1ibHkuSW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiB7IGluc3RhbmNlLCBtb2R1bGUgfTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfX3diZ19nZXRfaW1wb3J0cygpIHtcbiAgICBjb25zdCBpbXBvcnRzID0ge307XG4gICAgaW1wb3J0cy53YmcgPSB7fTtcbiAgICBpbXBvcnRzLndiZy5fX3diaW5kZ2VuX3N0cmluZ19nZXQgPSBmdW5jdGlvbihhcmcwLCBhcmcxKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IGdldE9iamVjdChhcmcxKTtcbiAgICAgICAgY29uc3QgcmV0ID0gdHlwZW9mKG9iaikgPT09ICdzdHJpbmcnID8gb2JqIDogdW5kZWZpbmVkO1xuICAgICAgICB2YXIgcHRyMSA9IGlzTGlrZU5vbmUocmV0KSA/IDAgOiBwYXNzU3RyaW5nVG9XYXNtMChyZXQsIHdhc20uX193YmluZGdlbl9tYWxsb2MsIHdhc20uX193YmluZGdlbl9yZWFsbG9jKTtcbiAgICAgICAgdmFyIGxlbjEgPSBXQVNNX1ZFQ1RPUl9MRU47XG4gICAgICAgIGdldEludDMyTWVtb3J5MCgpW2FyZzAgLyA0ICsgMV0gPSBsZW4xO1xuICAgICAgICBnZXRJbnQzMk1lbW9yeTAoKVthcmcwIC8gNCArIDBdID0gcHRyMTtcbiAgICB9O1xuICAgIGltcG9ydHMud2JnLl9fd2JpbmRnZW5fb2JqZWN0X2Ryb3BfcmVmID0gZnVuY3Rpb24oYXJnMCkge1xuICAgICAgICB0YWtlT2JqZWN0KGFyZzApO1xuICAgIH07XG4gICAgaW1wb3J0cy53YmcuX193YmluZGdlbl9zdHJpbmdfbmV3ID0gZnVuY3Rpb24oYXJnMCwgYXJnMSkge1xuICAgICAgICBjb25zdCByZXQgPSBnZXRTdHJpbmdGcm9tV2FzbTAoYXJnMCwgYXJnMSk7XG4gICAgICAgIHJldHVybiBhZGRIZWFwT2JqZWN0KHJldCk7XG4gICAgfTtcbiAgICBpbXBvcnRzLndiZy5fX3diaW5kZ2VuX3Rocm93ID0gZnVuY3Rpb24oYXJnMCwgYXJnMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZ2V0U3RyaW5nRnJvbVdhc20wKGFyZzAsIGFyZzEpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGltcG9ydHM7XG59XG5cbmZ1bmN0aW9uIF9fd2JnX2luaXRfbWVtb3J5KGltcG9ydHMsIG1heWJlX21lbW9yeSkge1xuXG59XG5cbmZ1bmN0aW9uIF9fd2JnX2ZpbmFsaXplX2luaXQoaW5zdGFuY2UsIG1vZHVsZSkge1xuICAgIHdhc20gPSBpbnN0YW5jZS5leHBvcnRzO1xuICAgIF9fd2JnX2luaXQuX193YmluZGdlbl93YXNtX21vZHVsZSA9IG1vZHVsZTtcbiAgICBjYWNoZWRJbnQzMk1lbW9yeTAgPSBudWxsO1xuICAgIGNhY2hlZFVpbnQ4TWVtb3J5MCA9IG51bGw7XG5cblxuICAgIHJldHVybiB3YXNtO1xufVxuXG5mdW5jdGlvbiBpbml0U3luYyhtb2R1bGUpIHtcbiAgICBpZiAod2FzbSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gd2FzbTtcblxuICAgIGNvbnN0IGltcG9ydHMgPSBfX3diZ19nZXRfaW1wb3J0cygpO1xuXG4gICAgX193YmdfaW5pdF9tZW1vcnkoaW1wb3J0cyk7XG5cbiAgICBpZiAoIShtb2R1bGUgaW5zdGFuY2VvZiBXZWJBc3NlbWJseS5Nb2R1bGUpKSB7XG4gICAgICAgIG1vZHVsZSA9IG5ldyBXZWJBc3NlbWJseS5Nb2R1bGUobW9kdWxlKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShtb2R1bGUsIGltcG9ydHMpO1xuXG4gICAgcmV0dXJuIF9fd2JnX2ZpbmFsaXplX2luaXQoaW5zdGFuY2UsIG1vZHVsZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIF9fd2JnX2luaXQoaW5wdXQpIHtcbiAgICBpZiAod2FzbSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gd2FzbTtcblxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlucHV0ID0gbmV3IFVSTCgnb2JzaWRpYW5fcnVzdF9wbHVnaW5fYmcud2FzbScsIGltcG9ydC5tZXRhLnVybCk7XG4gICAgfVxuICAgIGNvbnN0IGltcG9ydHMgPSBfX3diZ19nZXRfaW1wb3J0cygpO1xuXG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgfHwgKHR5cGVvZiBSZXF1ZXN0ID09PSAnZnVuY3Rpb24nICYmIGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkgfHwgKHR5cGVvZiBVUkwgPT09ICdmdW5jdGlvbicgJiYgaW5wdXQgaW5zdGFuY2VvZiBVUkwpKSB7XG4gICAgICAgIGlucHV0ID0gZmV0Y2goaW5wdXQpO1xuICAgIH1cblxuICAgIF9fd2JnX2luaXRfbWVtb3J5KGltcG9ydHMpO1xuXG4gICAgY29uc3QgeyBpbnN0YW5jZSwgbW9kdWxlIH0gPSBhd2FpdCBfX3diZ19sb2FkKGF3YWl0IGlucHV0LCBpbXBvcnRzKTtcblxuICAgIHJldHVybiBfX3diZ19maW5hbGl6ZV9pbml0KGluc3RhbmNlLCBtb2R1bGUpO1xufVxuXG5leHBvcnQgeyBpbml0U3luYyB9XG5leHBvcnQgZGVmYXVsdCBfX3diZ19pbml0O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsdUJBVU87OztBQ1ZQLHNCQUErQztBQUcvQyxJQUFNLFdBQVcsUUFBUSxZQUFZO0FBQ3JD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
