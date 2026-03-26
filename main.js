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
  constructor(app, plugin, version) {
    super(app, plugin);
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
    const folder = new import_obsidian.Setting(containerEl).setName("Folder").setDesc("Location of text file to scan").addText((text) => text.setPlaceholder("Enter your text file start folder").setValue(this.plugin.codeScannerSettings.dir).onChange(async (value) => {
      this.plugin.codeScannerSettings.dir = value;
      await this.plugin.saveSettings();
    }));
    const workingFolder = new import_obsidian.Setting(containerEl).setName("Working folder").setDesc("Location of md files").addText((text) => text.setPlaceholder("Enter your working folder name").setValue(this.plugin.codeScannerSettings.work).onChange(async (value) => {
      this.plugin.codeScannerSettings.work = value;
      await this.plugin.saveSettings();
    }));
    const startLine = new import_obsidian.Setting(containerEl).setName("Start").setDesc("The start of line to extract to md file").addText((text) => text.setPlaceholder("Enter your start string").setValue(this.plugin.codeScannerSettings.start).onChange(async (value) => {
      this.plugin.codeScannerSettings.start = value;
      await this.plugin.saveSettings();
    }));
    const folderStructure = new import_obsidian.Setting(containerEl).setName("Folder structure").setDesc("The folder structure definition").addText((text) => text.setPlaceholder("Enter your dot separated folder structure definition").setValue(this.plugin.codeScannerSettings.path).onChange(async (value) => {
      this.plugin.codeScannerSettings.path = value;
      await this.plugin.saveSettings();
    }));
    const extension = new import_obsidian.Setting(containerEl).setName("Extension").setDesc("Extension of the source text files to scan").addText((text) => text.setPlaceholder("Enter your text file extension").setValue(this.plugin.codeScannerSettings.extension).onChange(async (value) => {
      this.plugin.codeScannerSettings.extension = value;
      await this.plugin.saveSettings();
    }));
    const destinationExtension = new import_obsidian.Setting(containerEl).setName("Destination file extension").setDesc("Extension of the destination files into which extracted text goes").addText((text) => text.setPlaceholder("Enter your destination file extension").setValue(this.plugin.codeScannerSettings.destExtension).onChange(async (value) => {
      this.plugin.codeScannerSettings.destExtension = value;
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
  constructor(app) {
    this.separator = "/";
    this.markerRegExp = /\s\^[a-zA-Z]+[a-zA-Z0-9]+\-[0-9]+(\-[a-zA-Z]+[a-zA-Z0-9]+\-[0-9]+)*/g;
    this.app = app;
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
  init(app, plugin, scanner) {
    this.codeScanner = scanner;
    this.applicationPath = plugin.settings.applicationPath;
    this.codeExtension = plugin.settings.applicationExtension;
    this.documentPath = plugin.settings.documentPath;
    this.testPath = plugin.settings.unitTestPath;
    this.groupBySize = plugin.settings.groupBySize;
    this.sleepLength = plugin.settings.sleepLength;
    this.utils = new Utils(app);
    this.fsa = app.vault.adapter;
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
  constructor(app, docFolders) {
    this.utils = new Utils(app);
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
  constructor(app, docFolders) {
    this.markerFileWithPath = `${docFolders.settingsMarkerFolder}/marker-table.md`;
    this.utils = new Utils(app);
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
var obsidian_rust_plugin_bg_default = __toBinary("AGFzbQEAAAABlQEVYAJ/fwBgAn9/AX9gA39/fwF/YAF/AGADf39/AGAFf39/f38AYAR/f39/AX9gAX8Bf2AGf39/f39/AGAFf39/f38Bf2AAAGAEf39/fwBgB39/f39/f38AYAJ/fwF+YAZ/f39/f38Bf2AFf399f38AYAR/fX9/AGAFf39+f38AYAR/fn9/AGAFf398f38AYAR/fH9/AAJxBAN3YmcVX193YmluZGdlbl9zdHJpbmdfZ2V0AAADd2JnGl9fd2JpbmRnZW5fb2JqZWN0X2Ryb3BfcmVmAAMDd2JnFV9fd2JpbmRnZW5fc3RyaW5nX25ldwABA3diZxBfX3diaW5kZ2VuX3Rocm93AAADQ0IHBwwIAAUEAwQHBg0AAQAAAQAFCAUICQQAAwICAQMABAEBBgYOCQUPERMDCwIKAwAAAAQCBgEAAQACAwoBCgAAAAAEBQFwAR8fBQMBABEGCQF/AUGAgMAACwdHBAZtZW1vcnkCABFzY2FuX2Zvcl9jb21tZW50cwAEEV9fd2JpbmRnZW5fbWFsbG9jACQSX193YmluZGdlbl9yZWFsbG9jACcJJAEAQQELHikZKioqLy0sKykoMEQyHhQ9OSI6Qi4lFRxFMzQgOwwBBAqC9gFCsi0CLH8CfiMAQYACayICJAAgAkG4AWogABAAAkAgAigCuAEiEQRAIAIoArwBIQ8gAkGsh8AANgI4IAJBADYCNCACQoKAgIDAADcCLCACQeOHwAA2AiggAkEDNgIkIAJB4IfAADYCICACQayHwAA2AlQgAkEANgJQIAJCgYCAgMAANwJIIAJB6IfAADYCRCACQQM2AkAgAkHlh8AANgI8IAJBrIfAADYCcCACQQA2AmwgAkKBgICAwAA3AmQgAkHoh8AANgJgIAJBAzYCXCACQemHwAA2AlggAkHvh8AANgKMASACQQA2AogBIAJCg4CAgMAANwKAASACQeyHwAA2AnwgAkEDNgJ4IAJB7IfAADYCdCACQe+HwAA2AqgBIAJBATYCpAEgAkH0h8AANgKgASACQQE2ApwBIAJB8IfAADYCmAEgAkEBNgKUASACQfCHwAA2ApABIAIgAkGQAWo2AhwgAiACQfQAajYCGCACIAJB2ABqNgIUIAIgAkE8ajYCECACIAJBIGo2AgwgAkEANgK0ASACQoCAgIDAADcCrAFBkJfAAC0AAEEBRwRAIwBBEGsiASQAIwBBEGsiAyQAIANBADoAD0EBQQEQQCIHRQRAQQFBARBDAAsgASADQQ9qrTcDACABIAetNwMIIAdBARA8IANBEGokACABKQMAIS0gASkDCCEuQZCXwAAtAABBAkYEQEGQicAAQf0AQdCJwAAQIwALQZCXwABBAToAAEGIl8AAIC43AwBBgJfAACAtNwMAIAFBEGokAAsgAkHIAWpBqIjAACkDADcDAEGAl8AAQYCXwAApAwAiLUIBfDcDACACIAJBIGo2ArwBIAJBoIjAACkDADcDwAEgAkGIl8AAKQMANwPYASACIC03A9ABIAIgAkEMajYCuAEgAkHwAWohByMAQUBqIgEkAAJAAkACQCACQbgBaiIDEA0iBgRAQRBBBBBAIgVFDQIgBSAGNgIAIAFBATYCFCABIAU2AhAgAUEENgIMIAFBOGogA0EgaikDADcDACABQTBqIANBGGopAwA3AwAgAUEoaiADQRBqKQMANwMAIAFBIGogA0EIaikDADcDACABIAMpAwA3AxggAUEYahANIggEQEEEIQZBASEDA0AgASgCDCADRgRAIAFBDGogA0EBQQFBAiABKAIsGyABKAIcIAEoAhhGG0EEQQQQGCABKAIQIQULIAUgBmogCDYCACABIANBAWoiAzYCFCAGQQRqIQYgAUEYahANIggNAAsLAkAgASgCJCIDRQ0AIAMgA0EDdCIFakERaiIDRQ0AIAEoAiAgBWtBCGsgAxA8CyAHIAEpAgw3AgAgB0EIaiABQRRqKAIANgIADAELIAdBADYCCCAHQoCAgIDAADcCACADKAIMIgdFDQAgByAHQQN0IgVqQRFqIgdFDQAgAygCCCAFa0EIayAHEDwLIAFBQGskAAwBC0EEQRAQNQALIAIoAvgBIQEgAigC9AEhCyACIAJB/wFqNgLkAQJAAkACQAJAIAFBAk8EQCABQRVJDQEgAkHkAWohB0EAIQUjAEGAIGsiBiQAAkACQAJAQYCJ+gAgASABQYCJ+gBPGyIIIAEgAUEBdmsiAyADIAhJGyIIQYEITwRAIANB/////wNLIAhBAnQiA0H8////B0tyDQJBBCEFIANBBBBAIg1FDQIgCyABIA0gCCABQcEASSAHEAcgDSADEDwMAQsgCyABIAZBgAggAUHBAEkgBxAHCyAGQYAgaiQADAELIAUgAxA1AAsMAgsgDyARaiEMIAsgAUECdCIGaiEdIAIoAvABIR8gAUUEQEEEIQNBASEpDAQLIAsoAgAoAgAoAgQhEAwCCwJAIAEEQCABQQFHBEAgCyABQQJ0aiENIAtBBCIHaiEFA0AgBUEEaygCACIGKAIAKAIEIAUoAgAiCCgCACgCBEkEQCAHIQMCfwNAIAMgC2oiCiAGNgIAIAsgA0EERg0BGiADQQRrIQMgCkEIaygCACIGKAIAKAIEIAgoAgAoAgRJDQALIAMgC2oLIAg2AgALIAdBBGohByAFQQRqIgUgDUcNAAsLDAELAAsLIAFBAnQiBkEEa0ECdiIHQQNxIQogCygCACgCACgCBCEQIAdBAWtBA08EQCALQRBqIQMgB0H8////A3EhBwNAIBAgA0EMaygCACgCACgCBCIFIAUgEEkbIgUgA0EIaygCACgCACgCBCIIIAUgCEsbIgUgA0EEaygCACgCACgCBCIIIAUgCEsbIgUgAygCACgCACgCBCIIIAUgCEsbIRAgA0EQaiEDIAcgBEEEaiIERw0ACwsgDyARaiEMIAYgC2ohHSACKALwASEfIApFDQAgBEECdCALakEEaiEDA0AgECADKAIAKAIAKAIEIgQgBCAQSRshECADQQRqIQMgCkEBayIKDQALCyAGQQQQQCIDRQ0CCyACQQA2AvgBIAIgAzYC9AEgAiABNgLwASACQQA2ArwBIAIgAkH4AWo2ArgBIAIgAzYCwAEgAkG4AWoiBCgCBCEDIAQoAgAgHSALIgFHBEAgBCgCCCADQQJ0aiEHIB0gAWtBAnYhBgNAIAcCfwJAIAEoAgAoAgAiBCgCBARAIAQoAgAiBSwAACIEQQBOBEAgBEH/AXEMAwsgBS0AAUE/cSINIARBH3EiCEEGdHIgBEFfTQ0CGiAFLQACQT9xIA1BBnRyIQ0gBEFwTw0BIA0gCEEMdHIMAgtBxIzAABA+AAsgCEESdEGAgPAAcSAFLQADQT9xIA1BBnRycgs2AgAgAUEEaiEBIAdBBGohByADQQFqIQMgBkEBayIGDQALCyADNgIAIAIoAvABISMgAigC9AEhICAPBEAgAigC+AEiAUEPcUECdCEqIAFB8P///wFxIgFBcHMhKyAgIAFBAnRqISxBACEHIBEhBANAAn8gBCwAACIBQQBOBEAgAUH/AXEhAyAEQQFqDAELIAQtAAFBP3EhBSABQR9xIQMgAUFfTQRAIANBBnQgBXIhAyAEQQJqDAELIAQtAAJBP3EgBUEGdHIhBSABQXBJBEAgBSADQQx0ciEDIARBA2oMAQsgA0ESdEGAgPAAcSAELQADQT9xIAVBBnRyciEDIARBBGoLIQQgB0EBaiEFICshBiAgIQECQANAAkAgBkEQaiIGRQRAICohASAsIQYDQCABRQRAIAUhBwwFCyABQQRrIQEgBigCACEIIAZBBGohBiADIAhHDQALDAELIAEoAgAgA0YNACABQQRqKAIAIANGDQAgAUEIaigCACADRg0AIAFBDGooAgAgA0YNACABQRBqKAIAIANGDQAgAUEUaigCACADRg0AIAFBGGooAgAgA0YNACABQRxqKAIAIANGDQAgAUEgaigCACADRg0AIAFBJGooAgAgA0YNACABQShqKAIAIANGDQAgAUEsaigCACADRg0AIAFBMGooAgAgA0YNACABQTRqKAIAIANGDQAgAUE4aigCACADRg0AIAFBPGogAUFAayEBKAIAIANHDQELCwJAIClFBEAgEEUEQCAFIQcMAwsgDyAHIBBqSQRAIAUhBwwDCyACIBA2AsQBIAIgBzYCwAEgAiAMNgK8ASACIBE2ArgBIAJBADYC+AEgAkKAgICAEDcC8AEgAkHwAWogAkG4AWoQCCACKALwASIkQYCAgIB4Rw0BIAUhBwwCC0GwiMAAED4ACyACKAL4ASEGIAIoAvQBISUgCyEBAkACQAJAAkADQAJAIAYgASgCACgCACIYKAIEIgNJDQAgGCgCACAlIAMQHw0AIANFDQMgAyAHaiEWIAMgBWohCAwCCyABQQRqIgEgHUcNAAsgBSEHDAMLA0AgBCAMRg0BAn8gBCwAACIBQQBIBEAgBC0AAUE/cSEGIAFBH3EhBSABQV9NBEAgBUEGdCAGciEJIARBAmoMAgsgBC0AAkE/cSAGQQZ0ciEGIAFBcEkEQCAGIAVBDHRyIQkgBEEDagwCCyAFQRJ0QYCA8ABxIAQtAANBP3EgBkEGdHJyIQkgBEEEagwBCyABQf8BcSEJIARBAWoLIQQgA0EBayIDDQALDAELQcCIwAAQPgALQQAhGyACQQA2AuwBIAJCgICAgMAANwLkAUGAgMQAISEgGEEMaiEmQYCAxAAhHkEAIQ4gFiENIAQhASAIIQoCfwJAA0ACfwJAICYoAgAiEgRAIBgoAggiFCASaiEiQQAhBiAUIQMDQCAKIQUgCSEKAn8gAywAACIJQQBOBEAgCUH/AXEhCSADQQFqDAELIAMtAAFBP3EhFyAJQR9xIRwgCUFfTQRAIBxBBnQgF3IhCSADQQJqDAELIAMtAAJBP3EgF0EGdHIhFyAJQXBJBEAgFyAcQQx0ciEJIANBA2oMAQsgHEESdEGAgPAAcSADLQADQT9xIBdBBnRyciEJIANBBGoLIQMgEgJ/IAkgCkcEQCAUIQNBAAwBCyAeIAogBhshHiATIA0gBhshEyAGQQFqCyIGRiIcDQIgASAMRgRAIAohISANISdBgIDEAAwECyANIScgCiEhIAUhDSAFQQFqIgohCAJ/IAEsAAAiBEEATgRAIARB/wFxIQkgAUEBagwBCyABLQABQT9xIQkgBEEfcSEFIARBX00EQCAFQQZ0IAlyIQkgAUECagwBCyABLQACQT9xIAlBBnRyIQkgBEFwSQRAIAkgBUEMdHIhCSABQQNqDAELIAVBEnRBgIDwAHEgAS0AA0E/cSAJQQZ0cnIhCSABQQRqCyIBIQQgAyAiRw0ACwtBgInAABA+AAsCQAJAIB5BgIDEAEcEQCASIBNqIA9LDQUgGCgCFCEGIBgoAhAhAyACIBI2AsQBIAIgEzYCwAEgAiAMNgK8ASACIBE2ArgBIAJBADYC+AEgAkKAgICAEDcC8AEgAkHwAWogAkG4AWoQCCACKALwASIJQYCAgIB4Rg0FIAIoAvQBIRcCQCASIAIpAvQBIi1CIIinRw0AIC2nIBQgEhAfDQBBACEbIBIhKCAUIQ4MAwsgBkUNASADIAZBBHRqIRIDQAJAAkAgA0EEaigCACIORSAOIBNqIA9Lcg0AIAMoAgAhGyACIA42AsQBIAIgEzYCwAEgAiAMNgK8ASACIBE2ArgBIAJBADYC+AEgAkKAgICAEDcC8AEgAkHwAWogAkG4AWoQCCACKALwASIGQYCAgIB4Rg0AIAIoAvQBISJBACEUIAIpAvQBIi1CIIinIA5PBEAgGyAtpyAOEB9FIRQLIAYEQCAiIAYQPAsgFA0BCyASIANBEGoiA0cNAQwDCwsgA0EIaigCACEoIANBDGooAgAhFQwCC0HQiMAAED4AC0EAIQ5BACEbCyAJBEAgFyAJEDwLIAoLIQkCQCAbBEBBACEDIBVBAE4EQCAVRQRAQQEhGQwDC0EBIQMgFUEBEEAiGQ0CIBUhGQsgAyAZEDUACwJAAkACQAJAIA4EQCAeQYCAxABHDQFB8IjAABA+AAsgCCAcDQcaICchEyAhQYCAxABGDQELICYoAgAhAyAYKAIYLQAADQICfwJAIBMgFkYgDyATSXINACACIBMgFms2AsQBIAIgFjYCwAEgAiAMNgK8ASACIBE2ArgBIAJBADYC+AEgAkKAgICAEDcC8AEgAkHwAWogAkG4AWoQCCACKALwASIKQYCAgIB4Rg0AIAIoAvgBIQUgAigC9AEMAQtBACEFQQAhCkEBCyEGIAIoAuwBIgEgAigC5AFGBEAgAkHkAWoQIQsgAigC6AEgAUEMbGoiByAFNgIIIAcgBjYCBCAHIAo2AgAgAiABQQFqIgE2AuwBQQAhBiACQbgBaiACKALoASABQQFBABAJIAIoAsABIgFBAE4EQCACKAK8ASEHIAFFBEBBASEaDAMLQQEhBiABQQEQQCIaDQIgASEaCyAGIBoQNQALQeCIwAAQPgALIAEEQCAaIAcgAfwKAAALIAIoArQBIgUgAigCrAFGBEAgAkGsAWoQIQsgAigCsAEgBUEMbGoiBiABNgIIIAYgGjYCBCAGIAE2AgAgAiAFQQFqNgK0ASACKAK4ASIBRQ0AIAcgARA8CyAIIANBAkkNAxogA0EBayIBQQFxIQcgA0ECRwRAIAFBfnEhAQNAIAQgDEcEQCAIQQFqIQgCfyAEQQFqIAQsAAAiA0EATg0AGiAEQQJqIANBYEkNABogBEEEQQMgA0FvSxtqCyEECyAEIAxHBEAgCEEBaiEIAn8gBEEBaiAELAAAIgNBAE4NABogBEECaiADQWBJDQAaIARBBEEDIANBb0sbagshBAsgAUECayIBDQALCyAIIAdFDQMaIAggBCAMRg0DGgJ/IARBAWogBCwAACIBQQBODQAaIARBAmogAUFgSQ0AGiAEQQRBAyABQW9LG2oLIQQgCEEBagwDCyAVBEAgGSAoIBX8CgAACwJAAkACQCAHRSAHIBZqIA9Lcg0AIAIgBzYCxAEgAiAWNgLAASACIAw2ArwBIAIgETYCuAEgAkEANgL4ASACQoCAgIAQNwLwASACQfABaiACQbgBahAIIAIoAvABIgZBgICAgHhGDQAgAikC9AEhLSACKALsASIDIAIoAuQBRgRAIAJB5AFqECELIAIoAugBIANBDGxqIgogLTcCBCAKIAY2AgAgAiADQQFqIgY2AuwBIAIoAuQBIAZGBEAgAkHkAWoQIQsgAigC6AEgBkEMbGoiBiAVNgIIIAYgGTYCBCAGIBU2AgAgAiADQQJqNgLsASAOQQJPDQEgBSEDIAEhBgwCC0GEiMAAED4ACyAOQQFrIgNBAXECQCAOQQJGBEAgBSEIIAEhBAwBCyADQX5xIQMgBSEIIAEhBANAIAEgDEcEQCAFQQFqIgghBQJ/IAFBAWogASwAACIEQQBODQAaIAFBAmogBEFgSQ0AGiABQQRBAyAEQW9LG2oLIgQhAQsgASAMRwRAIAVBAWoiCCEFAn8gAUEBaiABLAAAIgRBAE4NABogAUECaiAEQWBJDQAaIAFBBEEDIARBb0sbagsiBCEBCyADQQJrIgMNAAsLIAghAyAEIQZFIAEgDEZyDQAgBUEBaiIIIQMCfyABQQFqIAEsAAAiBEEATg0AGiABQQJqIARBYEkNABogAUEEQQMgBEFvSxtqCyIEIQYgBCEBCwJ/IAEgDEYEQCADIQogBgwBCyADQQFqIgghCiADIRYCfyABQQFqIAEsAAAiA0EATg0AGiABQQJqIANBYEkNABogAUEDaiADQXBJDQAaIAFBBGoLIgQLIQEgCUGAgMQARw0ACyAIDAELIAgLIQcgAigC7AEiAwRAIAIoAugBIQEDQCABKAIAIgUEQCABQQRqKAIAIAUQPAsgAUEMaiEBIANBAWsiAw0ACwsgAigC5AEiAUUNACACKALoASABQQxsEDwLICRFDQAgJSAkEDwLIAQgDEcNAAsLIAJBuAFqIAIoArABIAIoArQBQeiHwABBARAJICMEQCAgICNBAnQQPAsgHwRAIAsgH0ECdBA8CyACKAK0ASIDBEAgAigCsAEhAQNAIAEoAgAiBARAIAFBBGooAgAgBBA8CyABQQxqIQEgA0EBayIDDQALCyACKAKsASIBBEAgAigCsAEgAUEMbBA8CyACQbgBaiIBKAIEIgMgASgCCBACIAEoAgAiAQRAIAMgARA8CyAPBEAgESAPEDwLIABBhAFPBEAgABABCyACQYACaiQADwtB0IfAABA+AAtBBCAGEDUAC8klAgl/AX4jAEEQayIIJAACQAJAAkACQAJAIABB9QFPBEAgAEHM/3tLBEBBACEADAYLIABBC2oiAkF4cSEFQdSWwAAoAgAiCUUNBEEfIQZBACAFayEDIABB9P//B00EQCAFQSYgAkEIdmciAGt2QQFxIABBAXRrQT5qIQYLIAZBAnRBuJPAAGooAgAiAkUEQEEAIQAMAgsgBUEZIAZBAXZrQQAgBkEfRxt0IQRBACEAA0ACQCACKAIEQXhxIgcgBUkNACAHIAVrIgcgA08NACACIQEgByIDDQBBACEDIAEhAAwECyACKAIUIgcgACAHIAIgBEEddkEEcWooAhAiAkcbIAAgBxshACAEQQF0IQQgAg0ACwwBCwJAAkACQAJAAkBB0JbAACgCACIEQRAgAEELakH4A3EgAEELSRsiBUEDdiIAdiIBQQNxBEAgAUF/c0EBcSAAaiIHQQN0IgFByJTAAGoiACABQdCUwABqKAIAIgIoAggiA0YNASADIAA2AgwgACADNgIIDAILIAVB2JbAACgCAE0NCCABDQJB1JbAACgCACIARQ0IIABoQQJ0QbiTwABqKAIAIgIoAgRBeHEgBWshAyACIQEDQAJAIAEoAhAiAA0AIAEoAhQiAA0AIAIoAhghBgJAAkAgAiACKAIMIgBGBEAgAkEUQRAgAigCFCIAG2ooAgAiAQ0BQQAhAAwCCyACKAIIIgEgADYCDCAAIAE2AggMAQsgAkEUaiACQRBqIAAbIQQDQCAEIQcgASIAQRRqIABBEGogACgCFCIBGyEEIABBFEEQIAEbaigCACIBDQALIAdBADYCAAsgBkUNBgJAIAIoAhxBAnRBuJPAAGoiASgCACACRwRAIAIgBigCEEcEQCAGIAA2AhQgAA0CDAkLIAYgADYCECAADQEMCAsgASAANgIAIABFDQYLIAAgBjYCGCACKAIQIgEEQCAAIAE2AhAgASAANgIYCyACKAIUIgFFDQYgACABNgIUIAEgADYCGAwGCyAAKAIEQXhxIAVrIgEgAyABIANJIgEbIQMgACACIAEbIQIgACEBDAALAAtB0JbAACAEQX4gB3dxNgIACyACQQhqIQAgAiABQQNyNgIEIAEgAmoiASABKAIEQQFyNgIEDAcLAkBBAiAAdCICQQAgAmtyIAEgAHRxaCIHQQN0IgFByJTAAGoiAiABQdCUwABqKAIAIgAoAggiA0cEQCADIAI2AgwgAiADNgIIDAELQdCWwAAgBEF+IAd3cTYCAAsgACAFQQNyNgIEIAAgBWoiBiABIAVrIgdBAXI2AgQgACABaiAHNgIAQdiWwAAoAgAiAgRAQeCWwAAoAgAhAQJAQdCWwAAoAgAiBEEBIAJBA3Z0IgNxRQRAQdCWwAAgAyAEcjYCACACQXhxQciUwABqIgMhBAwBCyACQXhxIgJByJTAAGohBCACQdCUwABqKAIAIQMLIAQgATYCCCADIAE2AgwgASAENgIMIAEgAzYCCAsgAEEIaiEAQeCWwAAgBjYCAEHYlsAAIAc2AgAMBgtB1JbAAEHUlsAAKAIAQX4gAigCHHdxNgIACwJAAkAgA0EQTwRAIAIgBUEDcjYCBCACIAVqIgcgA0EBcjYCBCADIAdqIAM2AgBB2JbAACgCACIBRQ0BQeCWwAAoAgAhAAJAQdCWwAAoAgAiBEEBIAFBA3Z0IgZxRQRAQdCWwAAgBCAGcjYCACABQXhxQciUwABqIgQhAQwBCyABQXhxIgRByJTAAGohASAEQdCUwABqKAIAIQQLIAEgADYCCCAEIAA2AgwgACABNgIMIAAgBDYCCAwBCyACIAMgBWoiAEEDcjYCBCAAIAJqIgAgACgCBEEBcjYCBAwBC0HglsAAIAc2AgBB2JbAACADNgIACyACQQhqIgBFDQMMBAsgACABckUEQEEAIQFBAiAGdCIAQQAgAGtyIAlxIgBFDQMgAGhBAnRBuJPAAGooAgAhAAsgAEUNAQsDQCADIAAoAgRBeHEiAiAFayIEIAMgAyAESyIEGyACIAVJIgIbIQMgASAAIAEgBBsgAhshASAAKAIQIgIEfyACBSAAKAIUCyIADQALCyABRQ0AIAVB2JbAACgCACIATSADIAAgBWtPcQ0AIAEoAhghBgJAAkAgASABKAIMIgBGBEAgAUEUQRAgASgCFCIAG2ooAgAiAg0BQQAhAAwCCyABKAIIIgIgADYCDCAAIAI2AggMAQsgAUEUaiABQRBqIAAbIQQDQCAEIQcgAiIAQRRqIABBEGogACgCFCICGyEEIABBFEEQIAIbaigCACICDQALIAdBADYCAAsCQCAGRQ0AAkACQCABKAIcQQJ0QbiTwABqIgIoAgAgAUcEQCABIAYoAhBHBEAgBiAANgIUIAANAgwECyAGIAA2AhAgAA0BDAMLIAIgADYCACAARQ0BCyAAIAY2AhggASgCECICBEAgACACNgIQIAIgADYCGAsgASgCFCICRQ0BIAAgAjYCFCACIAA2AhgMAQtB1JbAAEHUlsAAKAIAQX4gASgCHHdxNgIACwJAIANBEE8EQCABIAVBA3I2AgQgASAFaiIAIANBAXI2AgQgACADaiADNgIAIANBgAJPBEAgACADEBMMAgsCQEHQlsAAKAIAIgJBASADQQN2dCIEcUUEQEHQlsAAIAIgBHI2AgAgA0H4AXFByJTAAGoiAyECDAELIANB+AFxIgRByJTAAGohAiAEQdCUwABqKAIAIQMLIAIgADYCCCADIAA2AgwgACACNgIMIAAgAzYCCAwBCyABIAMgBWoiAEEDcjYCBCAAIAFqIgAgACgCBEEBcjYCBAsgAUEIaiIADQELAkACQAJAAkACQCAFQdiWwAAoAgAiAUsEQCAFQdyWwAAoAgAiAE8EQCAIQQRqIQACfyAFQa+ABGpBgIB8cSIBQRB2IAFB//8DcUEAR2oiAUAAIgRBf0YEQEEAIQFBAAwBCyABQRB0IgJBEGsgAiAEQRB0IgFBACACa0YbCyECIABBADYCCCAAIAI2AgQgACABNgIAIAgoAgQiAUUEQEEAIQAMCAsgCCgCDCEHQeiWwAAgCCgCCCIEQeiWwAAoAgBqIgA2AgBB7JbAACAAQeyWwAAoAgAiAiAAIAJLGzYCAAJAAkBB5JbAACgCACICBEBBuJTAACEAA0AgASAAKAIAIgMgACgCBCIGakYNAiAAKAIIIgANAAsMAgtB9JbAACgCACIAQQAgACABTRtFBEBB9JbAACABNgIAC0H4lsAAQf8fNgIAQcSUwAAgBzYCAEG8lMAAIAQ2AgBBuJTAACABNgIAQdSUwABByJTAADYCAEHclMAAQdCUwAA2AgBB0JTAAEHIlMAANgIAQeSUwABB2JTAADYCAEHYlMAAQdCUwAA2AgBB7JTAAEHglMAANgIAQeCUwABB2JTAADYCAEH0lMAAQeiUwAA2AgBB6JTAAEHglMAANgIAQfyUwABB8JTAADYCAEHwlMAAQeiUwAA2AgBBhJXAAEH4lMAANgIAQfiUwABB8JTAADYCAEGMlcAAQYCVwAA2AgBBgJXAAEH4lMAANgIAQZSVwABBiJXAADYCAEGIlcAAQYCVwAA2AgBBkJXAAEGIlcAANgIAQZyVwABBkJXAADYCAEGYlcAAQZCVwAA2AgBBpJXAAEGYlcAANgIAQaCVwABBmJXAADYCAEGslcAAQaCVwAA2AgBBqJXAAEGglcAANgIAQbSVwABBqJXAADYCAEGwlcAAQaiVwAA2AgBBvJXAAEGwlcAANgIAQbiVwABBsJXAADYCAEHElcAAQbiVwAA2AgBBwJXAAEG4lcAANgIAQcyVwABBwJXAADYCAEHIlcAAQcCVwAA2AgBB1JXAAEHIlcAANgIAQdyVwABB0JXAADYCAEHQlcAAQciVwAA2AgBB5JXAAEHYlcAANgIAQdiVwABB0JXAADYCAEHslcAAQeCVwAA2AgBB4JXAAEHYlcAANgIAQfSVwABB6JXAADYCAEHolcAAQeCVwAA2AgBB/JXAAEHwlcAANgIAQfCVwABB6JXAADYCAEGElsAAQfiVwAA2AgBB+JXAAEHwlcAANgIAQYyWwABBgJbAADYCAEGAlsAAQfiVwAA2AgBBlJbAAEGIlsAANgIAQYiWwABBgJbAADYCAEGclsAAQZCWwAA2AgBBkJbAAEGIlsAANgIAQaSWwABBmJbAADYCAEGYlsAAQZCWwAA2AgBBrJbAAEGglsAANgIAQaCWwABBmJbAADYCAEG0lsAAQaiWwAA2AgBBqJbAAEGglsAANgIAQbyWwABBsJbAADYCAEGwlsAAQaiWwAA2AgBBxJbAAEG4lsAANgIAQbiWwABBsJbAADYCAEHMlsAAQcCWwAA2AgBBwJbAAEG4lsAANgIAQeSWwAAgAUEPakF4cSIAQQhrIgI2AgBByJbAAEHAlsAANgIAQdyWwAAgBEEoayIEIAEgAGtqQQhqIgA2AgAgAiAAQQFyNgIEIAEgBGpBKDYCBEHwlsAAQYCAgAE2AgAMCAsgAiADSSABIAJNcg0AIAAoAgwiA0EBcQ0AIANBAXYgB0YNAwtB9JbAAEH0lsAAKAIAIgAgASAAIAFJGzYCACABIARqIQNBuJTAACEAAkACQANAIAMgACgCACIGRwRAIAAoAggiAA0BDAILCyAAKAIMIgNBAXENACADQQF2IAdGDQELQbiUwAAhAANAAkAgAiAAKAIAIgNPBEAgAiADIAAoAgRqIgZJDQELIAAoAgghAAwBCwtB5JbAACABQQ9qQXhxIgBBCGsiAzYCAEHclsAAIARBKGsiCSABIABrakEIaiIANgIAIAMgAEEBcjYCBCABIAlqQSg2AgRB8JbAAEGAgIABNgIAIAIgBkEga0F4cUEIayIAIAAgAkEQakkbIgNBGzYCBEG4lMAAKQIAIQogA0EQakHAlMAAKQIANwIAIANBCGoiACAKNwIAQcSUwAAgBzYCAEG8lMAAIAQ2AgBBuJTAACABNgIAQcCUwAAgADYCACADQRxqIQADQCAAQQc2AgAgAEEEaiIAIAZJDQALIAIgA0YNByADIAMoAgRBfnE2AgQgAiADIAJrIgBBAXI2AgQgAyAANgIAIABBgAJPBEAgAiAAEBMMCAsCQEHQlsAAKAIAIgFBASAAQQN2dCIEcUUEQEHQlsAAIAEgBHI2AgAgAEH4AXFByJTAAGoiACEBDAELIABB+AFxIgBByJTAAGohASAAQdCUwABqKAIAIQALIAEgAjYCCCAAIAI2AgwgAiABNgIMIAIgADYCCAwHCyAAIAE2AgAgACAAKAIEIARqNgIEIAFBD2pBeHFBCGsiBCAFQQNyNgIEIAZBD2pBeHFBCGsiAyAEIAVqIgBrIQUgA0HklsAAKAIARg0DIANB4JbAACgCAEYNBCADKAIEIgJBA3FBAUYEQCADIAJBeHEiARASIAEgBWohBSABIANqIgMoAgQhAgsgAyACQX5xNgIEIAAgBUEBcjYCBCAAIAVqIAU2AgAgBUGAAk8EQCAAIAUQEwwGCwJAQdCWwAAoAgAiAUEBIAVBA3Z0IgJxRQRAQdCWwAAgASACcjYCACAFQfgBcUHIlMAAaiIFIQMMAQsgBUH4AXEiAUHIlMAAaiEDIAFB0JTAAGooAgAhBQsgAyAANgIIIAUgADYCDCAAIAM2AgwgACAFNgIIDAULQdyWwAAgACAFayIBNgIAQeSWwABB5JbAACgCACIAIAVqIgI2AgAgAiABQQFyNgIEIAAgBUEDcjYCBCAAQQhqIQAMBgtB4JbAACgCACEAAkAgASAFayICQQ9NBEBB4JbAAEEANgIAQdiWwABBADYCACAAIAFBA3I2AgQgACABaiIBIAEoAgRBAXI2AgQMAQtB2JbAACACNgIAQeCWwAAgACAFaiIENgIAIAQgAkEBcjYCBCAAIAFqIAI2AgAgACAFQQNyNgIECyAAQQhqIQAMBQsgACAEIAZqNgIEQeSWwABB5JbAACgCACIAQQ9qQXhxIgFBCGsiAjYCAEHclsAAQdyWwAAoAgAgBGoiBCAAIAFrakEIaiIBNgIAIAIgAUEBcjYCBCAAIARqQSg2AgRB8JbAAEGAgIABNgIADAMLQeSWwAAgADYCAEHclsAAQdyWwAAoAgAgBWoiATYCACAAIAFBAXI2AgQMAQtB4JbAACAANgIAQdiWwABB2JbAACgCACAFaiIBNgIAIAAgAUEBcjYCBCAAIAFqIAE2AgALIARBCGohAAwBC0EAIQBB3JbAACgCACIBIAVNDQBB3JbAACABIAVrIgE2AgBB5JbAAEHklsAAKAIAIgAgBWoiAjYCACACIAFBAXI2AgQgACAFQQNyNgIEIABBCGohAAsgCEEQaiQAIAALgRkBDn8jAEEQayITJAACQAJAAkACQCABQSFJBEAgACEMIAEhCgwBCyACQQRrIRECQANAIARFBEAgACABIAIgA0EBIAYQBwwGCyAAIAFBA3YiC0EcbGohDCAAIAtBBHRqIQcgBEEBayEEIBMCfyABQcAATwRAIAAgByAMIAsgBhAaDAELIAAgDCAHIAcoAgAoAgAoAgQiByAAKAIAKAIAKAIEIgtJIgogDCgCACgCACgCBCIMIAdJcxsgCiALIAxLcxsLIg4oAgAiBzYCDCAOIABrQQJ2IQwCQCAFBEAgBygCACgCBCAFKAIAKAIAKAIETw0BCyABIANLDQRBACEKIAAhByACIAFBAnQiFGoiEiEIIAwhCwNAIAAgC0EDayIJQQAgCSALTRtBAnRqIg8gB0sEQCAOKAIAKAIAKAIEIQkDQCAKQQJ0IAIgCEEEayAJIAcoAgAiDSgCACgCBEkiEBtqIA02AgAgCiAQaiIKQQJ0IAIgCEEIayAJIAdBBGooAgAiDSgCACgCBEkiEBtqIA02AgAgCiAQaiIKQQJ0IAIgCEEMayAJIAdBCGooAgAiDSgCACgCBEkiEBtqIA02AgAgCiAQaiIKQQJ0IAIgCEEQayIIIAkgB0EMaigCACINKAIAKAIESSIQG2ogDTYCACAKIBBqIQogB0EQaiIHIA9JDQALCyAAIAtBAnRqIgkgB0sEQCAOKAIAKAIAKAIEIQ8DQCAKQQJ0IAIgCEEEayIIIA8gBygCACINKAIAKAIESSIQG2ogDTYCACAKIBBqIQogB0EEaiIHIAlJDQALCyABIAtHBEAgCEEEayIIIApBAnRqIAcoAgA2AgAgB0EEaiEHIAEhCwwBCwsgCkECdCIPBEAgACACIA/8CgAACyABIAprIQ0CQCABIApGDQAgDUEDcSELQQAhCCAKIAFrQXxNBEAgACAPaiEHIA1BfHEhECARIBRqIQkDQCAHIAkoAgA2AgAgB0EEaiASIAhB/v///wNzQQJ0aigCADYCACAHQQhqIBIgCEH9////A3NBAnRqKAIANgIAIAdBDGogEiAIQfz///8Dc0ECdGooAgA2AgAgCUEQayEJIAdBEGohByAQIAhBBGoiCEcNAAsLIAtFDQAgESAUIAhBAnQiCGtqIQcgACAIaiAPaiEIA0AgCCAHKAIANgIAIAdBBGshByAIQQRqIQggC0EBayILDQALCyAKRQ0AIAEgCkkNAiAAIA9qIA0gAiADIAQgE0EMaiAGEAYgCiIBQSFPDQEgACEMDAMLIAEgA0sNA0EAIQkgACEHIAIgAUECdCISaiIPIQgDQCAAIAxBA2siBUEAIAUgDE0bQQJ0aiILIAdLBEAgDigCACgCACgCBCEFA0AgCUECdCACIAhBBGsgBygCACIKKAIAKAIEIAVPIg0baiAKNgIAIAkgDWoiCkECdCACIAhBCGsgB0EEaigCACIJKAIAKAIEIAVPIg0baiAJNgIAIAogDWoiCkECdCACIAhBDGsgB0EIaigCACIJKAIAKAIEIAVPIg0baiAJNgIAIAogDWoiCkECdCACIAhBEGsiCCAHQQxqKAIAIgkoAgAoAgQgBU8iDRtqIAk2AgAgCiANaiEJIAdBEGoiByALSQ0ACwsgACAMQQJ0aiIFIAdLBEAgDigCACgCACgCBCELA0AgCUECdCACIAhBBGsiCCAHKAIAIgooAgAoAgQgC08iDRtqIAo2AgAgCSANaiEJIAdBBGoiByAFSQ0ACwsgASAMRwRAIAIgCUECdGogBygCADYCACAHQQRqIQcgCUEBaiEJIAhBBGshCCABIQwMAQsLIAlBAnQiDgRAIAAgAiAO/AoAAAsgASAJRg0FIAEgCWsiCkEDcSEFIAAgDmohDEEAIQggCSABa0F8TQRAIApBfHEhDSARIBJqIQsgDCEHA0AgByALKAIANgIAIAdBBGogDyAIQf7///8Dc0ECdGooAgA2AgAgB0EIaiAPIAhB/f///wNzQQJ0aigCADYCACAHQQxqIA8gCEH8////A3NBAnRqKAIANgIAIAtBEGshCyAHQRBqIQcgDSAIQQRqIghHDQALCyAFBEAgESAIQQJ0IgtrIBJqIQcgACALaiAOaiEIA0AgCCAHKAIANgIAIAdBBGshByAIQQRqIQggBUEBayIFDQALCyABIAlPBEBBACEFIAwhACAKIgFBIUkNAwwBCwsjAEEgayIAJAACQCABIAlPIgIEQCACDQEgACAJNgIIIAAgATYCDCAAIABBDGqtQoCAgIDQA4Q3AxggACAAQQhqrUKAgICA0AOENwMQQYmAwAAgAEEQakHAh8AAECMACyAAIAk2AgggACABNgIMIAAgAEEMaq1CgICAgNADhDcDGCAAIABBCGqtQoCAgIDQA4Q3AxBB6IDAACAAQRBqQcCHwAAQIwALIAAgATYCCCAAIAE2AgwgACAAQQxqrUKAgICA0AOENwMYIAAgAEEIaq1CgICAgNADhDcDEEGhgcAAIABBEGpBwIfAABAjAAtBgIDAAEETQbCHwAAQIwwBCyAKQQJJDQIgAyAKQRBqSQ0AIAogCkEBdiIBayEGIAECfwJAIApBD00EQCAKQQdNDQEgDEEIQQwgDCgCCCgCACgCBCAMKAIMKAIAKAIESSIDG2oiBSAMIAwoAgAoAgAoAgQiBCAMKAIEKAIAKAIEIgdPQQJ0aiIAIAxBDEEIIAMbaiIDIAwgBCAHSUECdGoiCygCACIIKAIAKAIEIAMoAgAiCSgCACgCBEkiBBsgACgCACIOKAIAKAIEIAUoAgAiESgCACgCBEkiBRsoAgAiBygCACgCBCEPIAsgAyAAIAUbIAQbKAIAIgAoAgAoAgQhAyACIA4gESAFGzYCDCACIAkgCCAEGzYCACACIAAgByADIA9JIgMbNgIIIAIgByAAIAMbNgIEIAwgAUECdCIIaiIAIAAoAgAoAgAoAgQiBCAAKAIEKAIAKAIEIgVJQQJ0aiIHIABBDEEIIAAoAggoAgAoAgQgACgCDCgCACgCBEkiCxtqIgMgACAEIAVPQQJ0aiIEIAQoAgAiCSgCACgCBCAAQQhBDCALG2oiACgCACIOKAIAKAIESSIFGyAHKAIAIhEoAgAoAgQgAygCACIPKAIAKAIESSIHGygCACILKAIAKAIEIRIgACAEIAMgBxsgBRsoAgAiAygCACgCBCEEIAIgCGoiACAJIA4gBRs2AgwgACAPIBEgBxs2AgAgACALIAMgBCASSyIEGzYCCCAAIAMgCyAEGzYCBEEEDAILIAwgAiACIApBAnRqIgAQCiAMIAFBAnQiA2ogAiADaiAAQSBqEApBCAwBCyACIAwoAgA2AgAgAiABQQJ0IgBqIAAgDGooAgA2AgBBAQsiAE0NASAAQQJ0IQMgACEFA0AgAiAFQQJ0IgRqIgcgBCAMaigCACIENgIAIAQoAgAoAgQiCyAHQQRrKAIAIggoAgAoAgRLBEAgAyEHAn8DQCACIAdqIgkgCDYCACACIAdBBEYNARogB0EEayEHIAlBCGsoAgAiCCgCACgCBCALSQ0ACyACIAdqCyAENgIACyADQQRqIQMgBUEBaiIFIAFHDQALDAELAAsgAiABQQJ0IgNqIQsgACAGSQRAIAMgDGohESAAQQJ0IQVBBCEEIAshAwNAIAsgAEECdCIHaiIIIAcgEWooAgAiDjYCACAOKAIAKAIEIg8gCEEEaygCACIJKAIAKAIESwRAIAQhCCADIQcCfwNAIAUgB2oiEiAJNgIAIAsgBSAIRg0BGiAIQQRqIQggB0EEayEHIBJBCGsoAgAiCSgCACgCBCAPSQ0ACyAFIAdqCyAONgIACyAEQQRrIQQgA0EEaiEDIABBAWoiACAGRw0ACwsgC0EEayEHIAIgCkECdEEEayIAaiEIIAAgDGohCQNAIAwgCygCACIAIAIoAgAiAyADKAIAKAIEIgMgACgCACgCBCIASSIEGzYCACAJIAcoAgAiBSAIKAIAIgYgBSgCACgCBCIFIAYoAgAoAgQiBkkiDhs2AgAgCUEEayEJIAxBBGohDCAHQXxBACAOG2ohByAIQXxBACAFIAZPG2ohCCACIAAgA01BAnRqIQIgCyAEQQJ0aiELIAFBAWsiAQ0ACyAHQQRqIQAgCkEBcQR/IAwgAiALIAAgAksiARsoAgA2AgAgCyAAIAJNQQJ0aiELIAIgAUECdGoFIAILIABGIAsgCEEEakZxDQAQPwALIBNBEGokAAvmCgITfwJ+IwBB0AJrIhMkAAJAIAFBAkkNAEKAgICAgICAgMAAIAGtIhmAIhogGX5CgICAgICAgIDAAFKtAn8gAUGBIE8EQEEBIAFBAXJnQR9zIgZBAXYgBkEBcWoiBnQgASAGdmpBAXYMAQtBwAAgASABQQF2ayIGIAZBwABPGwshFCAafCEZIABBBGshFiAAQQhqIRdBASEIA0BBACELQQEhCSABIA1LIhgEQCAAIA1BAnQiEWohDiANrSIaAn8CQCABIA1rIgcgFEkNAAJAIAdBAkkEQCAHIQYMAQsCfwJAAkAgDigCBCgCACgCBCIJIA4oAgAoAgAoAgRLIgpFBEBBAiEGIAdBAkYNBCAXIA1BAnRqIQsDQCAJIAsoAgAoAgAoAgQiD0kNAyALQQRqIQsgDyEJIAcgBkEBaiIGRw0ACwwBC0ECIQZBASAHQQJGDQIaIBcgDUECdGohCwNAIAkgCygCACgCACgCBCIPTw0CIAtBBGohCyAPIQkgByAGQQFqIgZHDQALCyAHIQYLIAYgFEkNAiAKRQ0BIAZBAkkEQEEBIQYMAgsgBkEBdgshDyAOIAZBAnQiCWohCkEAIQsgD0EBRwRAIBYgCSARamohCSAPQf7///8HcSERIA4hBwNAIAkoAgAhEiAJIAcoAgA2AgAgByASNgIAIAogC0H+////A3NBAnRqIhIoAgAhECASIAdBBGoiEigCADYCACASIBA2AgAgCUEIayEJIAdBCGohByARIAtBAmoiC0cNAAsLIA9BAXFFDQAgDiALQQJ0aiIJKAIAIQcgCSAKIAtBf3NBAnRqIgkoAgA2AgAgCSAHNgIACyAGQQF0QQFyDAELIAcgFCAHIBRJG0EBdCAERQ0AGiAOQSAgByAHQSBPGyIGIAIgA0EAQQAgBRAGIAZBAXRBAXILIglBAXYgDWqtfCAZfiANIAhBAXZrrSAafCAZfoV5pyELCwJAAkAgDEECSQ0AIBYgDUECdCIGaiEPIAAgBmohEgNAIAxBAWsiDiATQY4CamotAAAgC0kNAQJ/AkACQCADIBNBBGogDkECdGooAgAiCkEBdiIGIAhBAXYiB2oiEU8gCCAKckEBcUVxRQRAIAAgDSARa0ECdGohDCAKQQFxRQ0BDAILIBFBAXQMAgsgDCAGIAIgAyAGQQFyZ0EBdEE+c0EAIAUQBgsgCEEBcUUEQCAMIAZBAnRqIAcgAiADIAdBAXJnQQF0QT5zQQAgBRAGCwJAIAhBAkkgCkECSXINACADIAcgBiAGIAdLIgobIgdJDQAgDCAGQQJ0aiEIIAdBAnQiBgRAIAIgCCAMIAobIAb8CgAACyACIAZqIQcCQCAKRQRAIAIhBgNAIAwgCCgCACIKIAYoAgAiECAQKAIAKAIEIhAgCigCACgCBCIKSSIVGzYCACAMQQRqIQwgBiAKIBBNQQJ0aiIGIAdGDQIgCCAVQQJ0aiIIIBJHDQALDAELIA8hBgNAAkAgBiAIQQRrIggoAgAiCiAHQQRrIgcoAgAiECAKKAIAKAIEIgogECgCACgCBCIQSSIVGzYCACAHIBVBAnRqIQcgCCAKIBBPQQJ0aiIIIAxGDQAgBkEEayEGIAIgB0cNAQsLIAghDCACIQYLIAcgBmsiCEUNACAMIAYgCPwKAAALIBFBAXRBAXILIQhBASEHIA4iDEEBSw0ACwwBCyAMIQcLIBNBjgJqIAdqIAs6AAAgE0EEaiAHQQJ0aiAINgIAIBgEQCAHQQFqIQwgCUEBdiANaiENIAkhCAwBCwsgCEEBcQ0AIAAgASACIAMgAUEBcmdBAXRBPnNBACAFEAYLIBNB0AJqJAALlAoBCX8CQCABKAIMIglFDQAgCSABKAIEIgcgASgCACICayIDQQJ2IANBA3FBAEdqIgQgASgCCCIBayIFQQAgBCAFTxsiBCAEIAlLGyIEIAAoAgAgACgCCCIFa0sEQCAAIAUgBEEBQQEQGAsCQCABRQ0AAkACQAJAIAFBAWsiBEEgSQ0AQQAhBQJAIARBIEYNACADQWBxIgFFDQAgASACaiEGA0AgAiAFaiEBIAVBIGohBSAEIAEsAABBv39KayABQQFqLAAAQb9/SmsgAUECaiwAAEG/f0prIAFBA2osAABBv39KayABQQRqLAAAQb9/SmsgAUEFaiwAAEG/f0prIAFBBmosAABBv39KayABQQdqLAAAQb9/SmsgAUEIaiwAAEG/f0prIAFBCWosAABBv39KayABQQpqLAAAQb9/SmsgAUELaiwAAEG/f0prIAFBDGosAABBv39KayABQQ1qLAAAQb9/SmsgAUEOaiwAAEG/f0prIAFBD2osAABBv39KayABQRBqLAAAQb9/SmsgAUERaiwAAEG/f0prIAFBEmosAABBv39KayABQRNqLAAAQb9/SmsgAUEUaiwAAEG/f0prIAFBFWosAABBv39KayABQRZqLAAAQb9/SmsgAUEXaiwAAEG/f0prIAFBGGosAABBv39KayABQRlqLAAAQb9/SmsgAUEaaiwAAEG/f0prIAFBG2osAABBv39KayABQRxqLAAAQb9/SmsgAUEdaiwAAEG/f0prIAFBHmosAABBv39KayABQR9qLAAAQb9/SmsiBEEhSQ0BIAFBIGogBkcNAAsLIAIgBWoiASAHRgRAIAEhAgwCCyACIANqIQIDQCABLAAAQb9/TARAIAFBAWoiASAHRw0BDAILCyABIQILIARFDQELA0AgAiAHRg0DIAIgAi0AAC0A4IlAaiECIARBAWsiBA0ACwsgAiAHRg0BIAIsAAAiAUEATgRAIAJBAWohAgwBCyABQWBJBEAgAkECaiECDAELIAFBcEkEQCACQQNqIQIMAQsgAUH/AXFBEnRBgIDwAHEgAi0AA0E/cSACLQACQT9xQQZ0IAItAAFBP3FBDHRycnJBgIDEAEYNASACQQRqIQILA0AgAiAHRg0BAn8CfwJAIAIsAAAiAUEASARAIAItAAFBP3EhAyABQR9xIQQgAUFfSw0BIARBBnQgA3IhASACQQJqDAILIAJBAWohAiABQf8BcSEBIAAoAgghBEEBIQZBAQwCCyACLQACQT9xIANBBnRyIQMgAUFwSQRAIAMgBEEMdHIhASACQQNqDAELIARBEnRBgIDwAHEgAi0AA0E/cSADQQZ0cnIiAUGAgMQARg0DIAJBBGoLIQIgACgCCCEEQQEhBkEBIAFBgAFJDQAaQQAhBkECIAFBgBBJDQAaQQNBBCABQYCABEkbCyIFIAAoAgAgBCIDa0sEfyAAIAMgBUEBQQEQGCAAKAIIBSADCyAAKAIEaiEDAkAgBkUEQCABQT9xQYB/ciEGIAFBBnYhCCABQYAQSQRAIAMgBjoAASADIAhBwAFyOgAADAILIAFBDHYhCiAIQT9xQYB/ciEIIAFB//8DTQRAIAMgBjoAAiADIAg6AAEgAyAKQeABcjoAAAwCCyADIAY6AAMgAyAIOgACIAMgCkE/cUGAf3I6AAEgAyABQRJ2QXByOgAADAELIAMgAToAAAsgACAEIAVqNgIIIAlBAWsiCQ0ACwsL4ggCB38BfiMAQRBrIgokAAJAAkACQAJAIAIEQAJAIAStIAJBDGwiBUEMayIIQQxurX4iDEIgiFAEQCAMpyEJIAEhBgNAIAVFDQIgBkEIaiAFQQxrIQUgBkEMaiEGKAIAIgcgCWoiCSAHTw0ACwsjAEEQayIAJAAgAEE1NgIEIABB/IvAADYCACAAIACtQoCAgIDgA4Q3AwhB1oHAACAAQQhqQbSMwAAQIwALQQAhBSAJQQBIDQECQCAJRQRAQQEhBgwBC0EBIQUgCUEBEEAiBkUNAgtBACEHIApBADYCDCAKIAY2AgggAUEIaigCACEFIAogCTYCBCABQQRqKAIAIQsgBSAJSwRAIApBBGpBACAFQQFBARAYIAooAgwhByAKKAIIIQYLIAUEQCAGIAdqIAsgBfwKAAALIAkgBSAHaiIHayEFIAYgB2ohBgJAAkACQAJAAkACQCAEDgUEAwIBAAULIAJBAUYNByABQRRqIQQDQCAFQQNNDQogBEEEaygCACEHIAQoAgAhASAGIAMoAAA2AAAgBUEEayIFIAFJDQogBkEEaiECIAEEQCACIAcgAfwKAAALIARBDGohBCAFIAFrIQUgASACaiEGIAhBDGsiCA0ACwwHCyACQQFGDQYgAUEUaiEEA0AgBUECTQ0JIARBBGsoAgAhByAEKAIAIQEgBiADLwAAOwAAIAZBAmogA0ECai0AADoAACAFQQNrIgUgAUkNCSAGQQNqIQIgAQRAIAIgByAB/AoAAAsgBEEMaiEEIAUgAWshBSABIAJqIQYgCEEMayIIDQALDAYLIAJBAUYNBSABQRRqIQQDQCAFQQFNDQggBEEEaygCACEHIAQoAgAhASAGIAMvAAA7AAAgBUECayIFIAFJDQggBkECaiECIAEEQCACIAcgAfwKAAALIARBDGohBCAFIAFrIQUgASACaiEGIAhBDGsiCA0ACwwFCyACQQFGDQQgAUEUaiEEA0AgBUUNByAEQQRrKAIAIQcgBCgCACEBIAYgAy0AADoAACAFQQFrIgUgAUkNByAGQQFqIQIgAQRAIAIgByAB/AoAAAsgBEEMaiEEIAUgAWshBSABIAJqIQYgCEEMayIIDQALDAQLIAJBAUYNAyABQRRqIQMDQCAFIAMoAgAiAUkNBiABBEAgBiADQQRrKAIAIAH8CgAACyADQQxqIQMgBSABayEFIAEgBmohBiAIQQxrIggNAAsMAwsgAkEBRg0CIAFBFGohAgNAIAQgBUsNBSACQQRrKAIAIQcgAigCACEBIAQEQCAGIAMgBPwKAAALIAUgBGsiBSABSQ0FIAQgBmohBiABBEAgBiAHIAH8CgAACyACQQxqIQIgBSABayEFIAEgBmohBiAIQQxrIggNAAsMAgsgAEEANgIIIABCgICAgBA3AgAMAgsgBSAJEDUACyAAIAopAgQ3AgAgAEEIaiAJIAVrNgIACyAKQRBqJAAPC0Hgi8AAQRNB7IvAABAjAAuaCAEMfyAAQQhBDCAAKAIIKAIAKAIEIAAoAgwoAgAoAgRJIgcbaiIKIAAgACgCACgCACgCBCIJIAAoAgQoAgAoAgQiBE9BAnRqIgMgAEEMQQggBxtqIgcgACAEIAlLQQJ0aiIFKAIAIgYoAgAoAgQgBygCACILKAIAKAIESSIJGyADKAIAKAIAKAIEIAooAgAoAgAoAgRJIgQbIggoAgAoAgAoAgQhDCAFIAcgAyAEGyAJGyIHKAIAKAIAKAIEIQUgAiALIAYgCRsiCTYCACACIAggByAFIAxJIgUbKAIANgIEIAIgByAIIAUbKAIANgIIIAJBDGoiByADIAogBBsoAgA2AgAgAEEQaiIDQQhBDCAAKAIYKAIAKAIEIAAoAhwoAgAoAgRJIgQbaiIKIAMgACgCECgCACgCBCIIIAAoAhQoAgAoAgQiBU9BAnRqIgAgA0EMQQggBBtqIgQgAyAFIAhLQQJ0aiIGKAIAIgsoAgAoAgQgBCgCACIMKAIAKAIESSIDGyAAKAIAKAIAKAIEIAooAgAoAgAoAgRJIggbIgUoAgAoAgAoAgQhDSAGIAQgACAIGyADGyIEKAIAKAIAKAIEIQYgAkEQaiIOIAwgCyADGyIDNgIAIAJBFGogBSAEIAYgDUkiBhsoAgA2AgAgAkEYaiAEIAUgBhsoAgA2AgAgAkEcaiIEIAAgCiAIGygCACIANgIAIAEgAyAJIAkoAgAoAgQiCiADKAIAKAIEIgNJIgkbNgIAIAEgBygCACIIIAAgCCgCACgCBCIIIAAoAgAoAgQiAEkiBRs2AhwgASAOIAlBAnRqIgkoAgAiBiACIAMgCk1BAnRqIgIoAgAiAyADKAIAKAIEIgMgBigCACgCBCIKSSIGGzYCBCABIAdBfEEAIAUbaiIHKAIAIgUgBEF8QQAgACAITRtqIgAoAgAiBCAFKAIAKAIEIgggBCgCACgCBCIESSIFGzYCGCABIAkgBkECdGoiCSgCACIGIAIgAyAKT0ECdGoiAigCACIDIAMoAgAoAgQiAyAGKAIAKAIEIgpJIgYbNgIIIAEgB0F8QQAgBRtqIgcoAgAiBSAAQXxBACAEIAhNG2oiACgCACIEIAUoAgAoAgQiCCAEKAIAKAIEIgRJIgUbNgIUIAEgCSAGQQJ0aiIJKAIAIgYgAiADIApPQQJ0aiICKAIAIgMgAygCACgCBCIDIAYoAgAoAgQiCkkiBhs2AgwgASAHQXxBACAFG2oiASgCACIHIABBfEEAIAQgCE0baiIAKAIAIgQgBygCACgCBCIHIAQoAgAoAgQiBEkiCBs2AhACQCACIAMgCk9BAnRqIAFBfEEAIAgbakEEakYEQCAJIAZBAnRqIABBfEEAIAQgB00bakEEakYNAQsQPwALC5QGAQV/IABBCGsiASAAQQRrKAIAIgNBeHEiAGohAgJAAkAgA0EBcQ0AIANBAnFFDQEgASgCACIDIABqIQAgASADayIBQeCWwAAoAgBGBEAgAigCBEEDcUEDRw0BQdiWwAAgADYCACACIAIoAgRBfnE2AgQgASAAQQFyNgIEIAIgADYCAA8LIAEgAxASCwJAAkACQAJAAkAgAigCBCIDQQJxRQRAIAJB5JbAACgCAEYNAiACQeCWwAAoAgBGDQMgAiADQXhxIgIQEiABIAAgAmoiAEEBcjYCBCAAIAFqIAA2AgAgAUHglsAAKAIARw0BQdiWwAAgADYCAA8LIAIgA0F+cTYCBCABIABBAXI2AgQgACABaiAANgIACyAAQYACSQ0CIAEgABATQQAhAUH4lsAAQfiWwAAoAgBBAWsiADYCACAADQRBwJTAACgCACIABEADQCABQQFqIQEgACgCCCIADQALC0H4lsAAQf8fIAEgAUH/H00bNgIADwtB5JbAACABNgIAQdyWwABB3JbAACgCACAAaiIANgIAIAEgAEEBcjYCBEHglsAAKAIAIAFGBEBB2JbAAEEANgIAQeCWwABBADYCAAsgAEHwlsAAKAIAIgNNDQNB5JbAACgCACICRQ0DQQAhAEHclsAAKAIAIgRBKUkNAkG4lMAAIQEDQCACIAEoAgAiBU8EQCACIAUgASgCBGpJDQQLIAEoAgghAQwACwALQeCWwAAgATYCAEHYlsAAQdiWwAAoAgAgAGoiADYCACABIABBAXI2AgQgACABaiAANgIADwsCQEHQlsAAKAIAIgJBASAAQQN2dCIDcUUEQEHQlsAAIAIgA3I2AgAgAEH4AXFByJTAAGoiACECDAELIABB+AFxIgBByJTAAGohAiAAQdCUwABqKAIAIQALIAIgATYCCCAAIAE2AgwgASACNgIMIAEgADYCCA8LQcCUwAAoAgAiAQRAA0AgAEEBaiEAIAEoAggiAQ0ACwtB+JbAAEH/HyAAIABB/x9NGzYCACADIARPDQBB8JbAAEF/NgIACwvTBAIGfgR/IAAgACgCOCACajYCOAJAIAAoAjwiC0UEQAwBC0EEIQkCfkEIIAtrIgogAiACIApLGyIMQQRJBEBBACEJQgAMAQsgATUAAAshAyAMIAlBAXJLBEAgASAJajMAACAJQQN0rYYgA4QhAyAJQQJyIQkLIAAgACkDMCAJIAxJBH4gASAJajEAACAJQQN0rYYgA4QFIAMLIAtBA3RBOHGthoQiAzcDMCACIApPBEAgACAAKQMYIAOFIgQgACkDCHwiBiAAKQMQIgVCDYkgBSAAKQMAfCIFhSIHfCIIIAdCEYmFNwMQIAAgCEIgiTcDCCAAIAYgBEIQiYUiBEIViSAEIAVCIIl8IgSFNwMYIAAgAyAEhTcDAAwBCyAAIAIgC2o2AjwPCyACIAprIgJBB3EhCSACQXhxIgIgCksEQCAAKQMIIQQgACkDECEDIAApAxghBiAAKQMAIQUDQCAEIAEgCmopAAAiByAGhSIEfCIGIAMgBXwiBSADQg2JhSIDfCIIIANCEYmFIQMgBiAEQhCJhSIEQhWJIAQgBUIgiXwiBYUhBiAIQiCJIQQgBSAHhSEFIApBCGoiCiACSQ0ACyAAIAM3AxAgACAGNwMYIAAgBDcDCCAAIAU3AwALQQQhAgJ+IAlBBEkEQEEAIQJCAAwBCyABIApqNQAACyEDIAkgAkEBcksEQCABIApqIAJqMwAAIAJBA3SthiADhCEDIAJBAnIhAgsgACACIAlJBH4gASACIApqajEAACACQQN0rYYgA4QFIAMLNwMwIAAgCTYCPAuzDwIZfwR+IwBBEGsiDiQAAkACQCAAKAIAIg0gACgCBCIXRg0AIABBGGohEiAAQQhqIQoDQCAAIA1BBGoiGDYCACANKAIAIgEoAgAhEyAOIAEoAgQiFDYCDCAOIBM2AgggEiAOQQhqEA8hGyAAKAIQRQRAIwBBIGsiDyQAAkACQAJ/AkAgCigCDCIHQQFqIgEgB08EQCAKKAIEIgggCEEBaiICQQN2IgRBB2wgCEEISRsiC0EBdiABSQRAIAtBAWoiAiABIAEgAkkbIgFBD0kNAiABQf////8BTQRAQX8gAUEDdEEHbkEBa2d2IgFB/v///wFLDQUgAUEBagwECxAxIA8oAhgaDAULIAIEQCAKKAIAIQNBACEBIAQgAkEHcUEAR2oiBEEBcSAEQQFHBEAgBEH+////A3EhBgNAIAEgA2oiBCAEKQMAIhpCf4VCB4hCgYKEiJCgwIABgyAaQv/+/fv379+//wCEfDcDACAEQQhqIgQgBCkDACIaQn+FQgeIQoGChIiQoMCAAYMgGkL//v379+/fv/8AhHw3AwAgAUEQaiEBIAZBAmsiBg0ACwsEQCABIANqIgEgASkDACIaQn+FQgeIQoGChIiQoMCAAYMgGkL//v379+/fv/8AhHw3AwALIANBCGohBgJAIAJBCE8EQCACIANqIAMpAAA3AAAMAQsgAkUNACAGIAMgAvwKAAALIANBCGshFUEAIQEDQAJAIAMgASICaiIQLQAAQYABRw0AIBUgAUEDdGshFiADIAFBf3NBA3RqIQQCQANAIAggEiAWEA+nIhFxIgUhASADIAVqKQAAQoCBgoSIkKDAgH+DIhpQBEBBCCEJA0AgASAJaiEBIAlBCGohCSADIAEgCHEiAWopAABCgIGChIiQoMCAf4MiGlANAAsLIAMgGnqnQQN2IAFqIAhxIgFqLAAAQQBOBEAgAykDAEKAgYKEiJCgwIB/g3qnQQN2IQELIAEgBWsgAiAFa3MgCHFBCE8EQCABIANqIgUtAAAgBSARQRl2IgU6AAAgBiABQQhrIAhxaiAFOgAAIAMgAUEDdGtBCGshAUH/AUYNAiABKAAAIQUgASAEKAAANgAAIAQgBTYAACAEKAAEIQUgBCABKAAENgAEIAEgBTYABAwBCwsgECARQRl2IgE6AAAgBiACQQhrIAhxaiABOgAADAELIBBB/wE6AAAgBiACQQhrIAhxakH/AToAACABIAQpAAA3AAALIAJBAWohASACIAhHDQALCyAKIAsgB2s2AggMBAsQMSAPKAIAGgwDC0EEIAFBCHFBCGogAUEESRsLIgFBCGoiAiABQQN0IgRqIgMgAkkgA0H4////B0tyDQAgA0EIEEAiBkUEQEEIIAMQQwALIAQgBmohBSACBEAgBUH/ASAC/AsACyABQQFrIgkgAUEDdkEHbCAJQQhJGyEQAkAgB0UEQCAKKAIAIQIMAQsgBUEIaiERIAooAgAiAkEIayEVIAIpAwBCf4VCgIGChIiQoMCAf4MhGkEAIQEgByEDIAIhBANAIBpQBEADQCABQQhqIQEgBEEIaiIEKQMAQoCBgoSIkKDAgH+DIhpCgIGChIiQoMCAf1ENAAsgGkKAgYKEiJCgwIB/hSEaCyAFIAkgEiAVIBp6p0EDdiABakEDdCIWaxAPpyIZcSIGaikAAEKAgYKEiJCgwIB/gyIcUARAQQghCwNAIAYgC2ohBiALQQhqIQsgBSAGIAlxIgZqKQAAQoCBgoSIkKDAgH+DIhxQDQALCyAaQgF9IBqDIRogBSAceqdBA3YgBmogCXEiBmosAABBAE4EQCAFKQMAQoCBgoSIkKDAgH+DeqdBA3YhBgsgBSAGaiAZQRl2Igs6AAAgESAGQQhrIAlxaiALOgAAIAUgBkEDdGtBCGsgAiAWa0EIaykAADcDACADQQFrIgMNAAsLIAogCTYCBCAKIAU2AgAgCiAQIAdrNgIIIAhFDQEgCCAIQQN0QQ9qQXhxIgFqQQlqIgdFDQEgAiABayAHEDwMAQsQMSAPKAIIGgsgD0EgaiQACyAAKAIMIgIgG6dxIQEgG0IZiCIcQv8Ag0KBgoSIkKDAgAF+IR0gACgCCCEHQQAhA0EAIQQDQAJ/AkACQCABIAdqKQAAIhsgHYUiGkJ/hSAaQoGChIiQoMCAAX2DQoCBgoSIkKDAgH+DIhpQRQRAA0AgByAaeqdBA3YgAWogAnFBA3RrIghBBGsoAgAgFEYEQCATIAhBCGsoAgAgFBAfRQ0DCyAaQgF9IBqDIhpQRQ0ACwsgG0KAgYKEiJCgwIB/gyEaIANFBEAgGlANAiAaeqdBA3YgAWogAnEhDAtBASAaIBtCAYaDUA0CGiAHIAxqLAAAIgFBAE4EQCAHIAcpAwBCgIGChIiQoMCAf4N6p0EDdiIMai0AACEBCyAHIAxqIBynQf8AcSIKOgAAIAcgDEEIayACcWpBCGogCjoAACAAIAAoAhAgAUEBcWs2AhAgACAAKAIUQQFqNgIUIAcgDEEDdGsiAEEIayATNgIAIABBBGsgFDYCAAwGCyAYIg0gF0cNAwwEC0EACyEDIARBCGoiBCABaiACcSEBDAALAAsAC0EAIQ0LIA5BEGokACANC/sDAQh/IwBBEGsiBiQAAn8CQCADQQFxRQRAIAItAAAiBQ0BQQAMAgsgACACIANBAXYgASgCDBECAAwBCyABKAIMIQoDQCACQQFqIQQCQAJAAkACQCAFwEEASARAIAVB/wFxIghBgAFGDQEgCEHAAUcNAyAGIAE2AgQgBiAANgIAIAZCoICAgAY3AgggAyAHQQN0aiICKAIAIAYgAigCBBEBAEUNAkEBDAYLIAAgBCAFQf8BcSICIAoRAgBFBEAgAiAEaiECDAQLQQEMBQsgACACQQNqIgQgAi8AASICIAoRAgBFBEAgAiAEaiECDAMLQQEMBAsgB0EBaiEHIAQhAgwBC0GggICABiELIAVBAXEEQCACKAABIQsgAkEFaiEEC0EAIQgCfyAFQQJxRQRAQQAhCSAEDAELIAQvAAAhCSAEQQJqCyECIAVBBHEEfyACLwAAIQggAkECagUgAgshBCAFQQhxBH8gBC8AACEHIARBAmoFIAQLIQIgBUEQcQRAIAMgCUEDdGovAQQhCQsgBiAFQSBxBH8gAyAIQQN0ai8BBAUgCAs7AQ4gBiAJOwEMIAYgCzYCCCAGIAE2AgQgBiAANgIAQQEgAyAHQQN0aiIEKAIAIAYgBCgCBBEBAA0CGiAHQQFqIQcLIAItAAAiBQ0AC0EACyAGQRBqJAALzQMCBn4CfyMAQdAAayIIJAAgCEFAayIJQgA3AwAgCEIANwM4IAggACkDCCICNwMwIAggACkDACIDNwMoIAggAkLzytHLp4zZsvQAhTcDICAIIAJC7d6R85bM3LfkAIU3AxggCCADQuHklfPW7Nm87ACFNwMQIAggA0L1ys2D16zbt/MAhTcDCCAIQQhqIgAgASgCACABKAIEEAwgCEH/AToATyAAIAhBzwBqQQEQDCAIKQMIIQMgCCkDGCECIAk1AgAhBiAIKQM4IQQgCCkDICAIKQMQIQcgCEHQAGokACAEIAZCOIaEIgaFIgRCEIkgBCAHfCIEhSIFQhWJIAUgAiADfCIDQiCJfCIFhSIHQhCJIAcgBCACQg2JIAOFIgJ8IgNCIIlC/wGFfCIEhSIHQhWJIAcgAyACQhGJhSICIAUgBoV8IgNCIIl8IgaFIgVCEIkgBSADIAJCDYmFIgIgBHwiA0IgiXwiBIUiBUIViSAFIAMgAkIRiYUiAiAGfCIDQiCJfCIGhSIFQhCJIAUgAkINiSADhSICIAR8IgNCIIl8IgSFQhWJIAJCEYkgA4UiAkINiSACIAZ8hSICQhGJhSACIAR8IgJCIImFIAKFC48EAQJ/IAAgAWohAgJAAkAgACgCBCIDQQFxDQAgA0ECcUUNASAAKAIAIgMgAWohASAAIANrIgBB4JbAACgCAEYEQCACKAIEQQNxQQNHDQFB2JbAACABNgIAIAIgAigCBEF+cTYCBCAAIAFBAXI2AgQgAiABNgIADAILIAAgAxASCwJAAkACQCACKAIEIgNBAnFFBEAgAkHklsAAKAIARg0CIAJB4JbAACgCAEYNAyACIANBeHEiAhASIAAgASACaiIBQQFyNgIEIAAgAWogATYCACAAQeCWwAAoAgBHDQFB2JbAACABNgIADwsgAiADQX5xNgIEIAAgAUEBcjYCBCAAIAFqIAE2AgALIAFBgAJPBEAgACABEBMPCwJAQdCWwAAoAgAiAkEBIAFBA3Z0IgNxRQRAQdCWwAAgAiADcjYCACABQfgBcUHIlMAAaiIBIQIMAQsgAUH4AXEiAUHIlMAAaiECIAFB0JTAAGooAgAhAQsgAiAANgIIIAEgADYCDCAAIAI2AgwgACABNgIIDwtB5JbAACAANgIAQdyWwABB3JbAACgCACABaiIBNgIAIAAgAUEBcjYCBCAAQeCWwAAoAgBHDQFB2JbAAEEANgIAQeCWwABBADYCAA8LQeCWwAAgADYCAEHYlsAAQdiWwAAoAgAgAWoiATYCACAAIAFBAXI2AgQgACABaiABNgIACwvnAgEFfwJAIAFBzf97QRAgACAAQRBNGyIAa08NACAAQRAgAUELakF4cSABQQtJGyIEakEMahAFIgJFDQAgAkEIayEBAkAgAEEBayIDIAJxRQRAIAEhAAwBCyACQQRrIgUoAgAiBkF4cSACIANqQQAgAGtxQQhrIgIgAEEAIAIgAWtBEE0baiIAIAFrIgJrIQMgBkEDcQRAIAAgAyAAKAIEQQFxckECcjYCBCAAIANqIgMgAygCBEEBcjYCBCAFIAIgBSgCAEEBcXJBAnI2AgAgASACaiIDIAMoAgRBAXI2AgQgASACEBAMAQsgASgCACEBIAAgAzYCBCAAIAEgAmo2AgALAkAgACgCBCIBQQNxRQ0AIAFBeHEiAiAEQRBqTQ0AIAAgBCABQQFxckECcjYCBCAAIARqIgEgAiAEayIEQQNyNgIEIAAgAmoiAiACKAIEQQFyNgIEIAEgBBAQCyAAQQhqIQMLIAMLggMBBH8gACgCDCECAkACQAJAIAFBgAJPBEAgACgCGCEDAkACQCAAIAJGBEAgAEEUQRAgACgCFCICG2ooAgAiAQ0BQQAhAgwCCyAAKAIIIgEgAjYCDCACIAE2AggMAQsgAEEUaiAAQRBqIAIbIQQDQCAEIQUgASICQRRqIAJBEGogAigCFCIBGyEEIAJBFEEQIAEbaigCACIBDQALIAVBADYCAAsgA0UNAgJAIAAoAhxBAnRBuJPAAGoiASgCACAARwRAIAMoAhAgAEYNASADIAI2AhQgAg0DDAQLIAEgAjYCACACRQ0EDAILIAMgAjYCECACDQEMAgsgACgCCCIAIAJHBEAgACACNgIMIAIgADYCCA8LQdCWwABB0JbAACgCAEF+IAFBA3Z3cTYCAA8LIAIgAzYCGCAAKAIQIgEEQCACIAE2AhAgASACNgIYCyAAKAIUIgBFDQAgAiAANgIUIAAgAjYCGA8LDwtB1JbAAEHUlsAAKAIAQX4gACgCHHdxNgIAC8QCAQR/IABCADcCECAAAn9BACABQYACSQ0AGkEfIAFB////B0sNABogAUEmIAFBCHZnIgNrdkEBcSADQQF0a0E+agsiAjYCHCACQQJ0QbiTwABqIQRBASACdCIDQdSWwAAoAgBxRQRAIAQgADYCACAAIAQ2AhggACAANgIMIAAgADYCCEHUlsAAQdSWwAAoAgAgA3I2AgAPCwJAAkAgASAEKAIAIgMoAgRBeHFGBEAgAyECDAELIAFBGSACQQF2a0EAIAJBH0cbdCEFA0AgAyAFQR12QQRxaiIEKAIQIgJFDQIgBUEBdCEFIAIhAyACKAIEQXhxIAFHDQALCyACKAIIIgEgADYCDCACIAA2AgggAEEANgIYIAAgAjYCDCAAIAE2AggPCyAEQRBqIAA2AgAgACADNgIYIAAgADYCDCAAIAA2AggLiAIBBn8gACgCCCIEIQICf0EBIAFBgAFJDQAaQQIgAUGAEEkNABpBA0EEIAFBgIAESRsLIgYgACgCACAEa0sEfyAAIAQgBhAbIAAoAggFIAILIAAoAgRqIQICQCABQYABTwRAIAFBP3FBgH9yIQUgAUEGdiEDIAFBgBBJBEAgAiAFOgABIAIgA0HAAXI6AAAMAgsgAUEMdiEHIANBP3FBgH9yIQMgAUH//wNNBEAgAiAFOgACIAIgAzoAASACIAdB4AFyOgAADAILIAIgBToAAyACIAM6AAIgAiAHQT9xQYB/cjoAASACIAFBEnZBcHI6AAAMAQsgAiABOgAACyAAIAQgBmo2AghBAAv6AQIDfwF+IwBBMGsiAiQAIAEoAgBBgICAgHhGBEAgASgCDCEDIAJBLGoiBEEANgIAIAJCgICAgBA3AiQgAkEkakH0jcAAIAMoAgAiAygCACADKAIEEA4aIAJBIGogBCgCACIDNgIAIAIgAikCJCIFNwMYIAFBCGogAzYCACABIAU3AgALIAEpAgAhBSABQoCAgIAQNwIAIAJBEGoiAyABQQhqIgEoAgA2AgAgAUEANgIAIAIgBTcDCEEMQQQQQCIBRQRAQQRBDBBDAAsgASACKQMINwIAIAFBCGogAygCADYCACAAQdSPwAA2AgQgACABNgIAIAJBMGokAAuUAgECfyMAQSBrIgUkAEGol8AAQaiXwAAoAgAiBkEBajYCAAJAAn9BACAGQQBIDQAaQQFBpJfAAC0AAA0AGkGkl8AAQQE6AABBoJfAAEGgl8AAKAIAQQFqNgIAQQILQf8BcSIGQQJHBEAgBkEBcUUNASAFQQhqIAAgASgCGBEAAAwBC0Gsl8AAKAIAIgZBAEgNAEGsl8AAIAZBAWo2AgBBsJfAACgCAARAIAUgACABKAIUEQAAIAUgBDoAHSAFIAM6ABwgBSACNgIYIAUgBSkDADcCEEGwl8AAKAIAIAVBEGpBtJfAACgCACgCFBEAAAtBrJfAAEGsl8AAKAIAQQFrNgIAQaSXwABBADoAACADRQ0AAAsAC6gBAgJ/AX5BASEHQQQhBgJAIAQgBWpBAWtBACAEa3GtIAOtfiIIQiCIUEUEQEEAIQMMAQsgCKciA0GAgICAeCAEa0sEQEEAIQMMAQsCQAJAAn8gAQRAIAIgASAFbCAEIAMQOAwBCyADRQRAIAQhBgwCCyADIAQQQAsiBg0AIAAgBDYCBAwBCyAAIAY2AgRBACEHC0EIIQYLIAAgBmogAzYCACAAIAc2AgALpwEBAX8jAEEQayIFJAAgBEUEQEEAQQAQNQALIAIgASACaiIBSwRAQQBBABA1AAsgBUEEaiAAKAIAIgIgACgCBCABIAJBAXQiAiABIAJLGyIBQQhBBEEBIARBgQhJGyAEQQFGGyICIAEgAksbIgEgAyAEEBcgBSgCBEEBRgRAIAUoAgggBSgCDBA1AAsgBSgCCCECIAAgATYCACAAIAI2AgQgBUEQaiQAC5wBAQF/IwBBEGsiBiQAAkAgAQRAIAZBBGogASADIAQgBSACKAIQEQUAAkAgBigCBCICIAYoAgwiAU0EQCAGKAIIIQUMAQsgAkECdCECIAYoAgghAyABRQRAQQQhBSADIAIQPAwBCyADIAJBBCABQQJ0IgIQOCIFRQ0CCyAAIAE2AgQgACAFNgIAIAZBEGokAA8LEEEAC0EEIAIQNQALmQEBAn8gA0H4////AXEEQCAAIAAgA0EDdiIDQQR0IgVqIAAgA0EcbCIGaiADIAQQGiEAIAEgASAFaiABIAZqIAMgBBAaIQEgAiACIAVqIAIgBmogAyAEEBohAgsgACACIAEgASgCACgCACgCBCIBIAAoAgAoAgAoAgQiAEkiAyABIAIoAgAoAgAoAgQiAUtzGyADIAAgAUtzGwuHAQEBfyMAQRBrIgMkACACIAEgAmoiAUsEQEEAQQAQNQALIANBBGogACgCACICIAAoAgRBCCABIAJBAXQiAiABIAJLGyIBIAFBCE0bIgFBAUEBEBcgAygCBEEBRgRAIAMoAgggAygCDBA1AAsgAygCCCECIAAgATYCACAAIAI2AgQgA0EQaiQAC5wBAgN/AX4jAEEgayICJAAgASgCAEGAgICAeEYEQCABKAIMIQMgAkEcaiIEQQA2AgAgAkKAgICAEDcCFCACQRRqQfSNwAAgAygCACIDKAIAIAMoAgQQDhogAkEQaiAEKAIAIgM2AgAgAiACKQIUIgU3AwggAUEIaiADNgIAIAEgBTcCAAsgAEHUj8AANgIEIAAgATYCACACQSBqJAALUwEBfyMAQSBrIgEkACABQQo2AgwgASAANgIIIAEgAUEIaq1CgICAgNADhDcDGCABIAFBDGqtQoCAgIDQA4Q3AxBBsYDAACABQRBqQfyRwAAQIwALRwEBfyAAKAIAIAAoAggiA2sgAkkEQCAAIAMgAhAbIAAoAgghAwsgAgRAIAAoAgQgA2ogASAC/AoAAAsgACACIANqNgIIQQALQwEDfwJAIAJFDQADQCAALQAAIgQgAS0AACIFRgRAIABBAWohACABQQFqIQEgAkEBayICDQEMAgsLIAQgBWshAwsgAwvbBwIMfwF+IwBBEGsiDSQAAn8gASEFIA1BBmohBkEKIQIgACgCACIJIgBB6AdPBEAgBkEEayEEIAAhAQJAAkADQCABIAFBkM4AbiIAQZDOAGxrIgtB//8DcUHkAG4hCAJAIANBCmoiCkEEa0EKSQRAIARBCmoiByAIQQF0IgwtALSQQDoAACAKQQNrIgJBCkkNASACEB0ACyAKQQRrEB0ACyAHQQFqIAxBtZDAAGotAAA6AAAgCkECa0EKSQRAIAdBAmogCyAIQeQAbGtBAXRB/v8HcSICLQC0kEA6AAAgCkEBa0EKTw0CIAdBA2ogAkG1kMAAai0AADoAACAEQQRrIQQgA0EEayEDIAFB/6ziBEsgACEBRQ0DDAELCyAKQQJrEB0ACyAKQQFrEB0ACyADQQpqIQILAkAgAEEJTQRAIAAhAyACIQEMAQsgAEH//wNxQeQAbiEDAkAgAkECayIBQQpJBEAgASAGaiAAIANB5ABsa0H//wNxQQF0IgAtALSQQDoAACACQQFrIgJBCk8NASACIAZqIABBtZDAAGotAAA6AAAMAgsgARAdAAsgAhAdAAtBACAJIAMbRQRAIAFBAWsiAUEKTwRAIAEQHQALIAEgBmogA0EBdC0AtZBAOgAACyABIAZqIQtBCiABayEIQQAhBEEBQStBgIDEACAFKAIIIgJBgICAAXEiABshDEEAIAJBgICABHEbIQYCQCAAQRV2IAhqIgMgBS8BDCIASQRAAkACQCACQYCAgAhxRQRAIAAgA2shAEEAIQECQAJAAkAgAkEddkEDcUEBaw4DAAEAAgsgACEBDAELIABB/v8DcUEBdiEBCyACQf///wBxIQIgBSgCBCEJIAUoAgAhAwNAIARB//8DcSABQf//A3FPDQJBASEHIARBAWohBCADIAIgCSgCEBEBAEUNAAsMBAsgBSAFKQIIIg6nQYCAgP95cUGwgICAAnI2AghBASEHIAUoAgAiAiAFKAIEIgEgDCAGECYNAyAAIANrQf//A3EhAANAIARB//8DcSAATw0CIARBAWohBCACQTAgASgCEBEBAEUNAAsMAwtBASEHIAMgCSAMIAYQJg0CIAMgCyAIIAkoAgwRAgANAkEAIQQgACABa0H//wNxIQEDQCAEQf//A3EiACABSSEHIAAgAU8NAyAEQQFqIQQgAyACIAkoAhARAQBFDQALDAILIAIgCyAIIAEoAgwRAgANASAFIA43AghBAAwCC0EBIQcgBSgCACIBIAUoAgQiACAMIAYQJg0AIAEgCyAIIAAoAgwRAgAhBwsgBwsgDUEQaiQAC88CAgp/AX4jAEEQayIDJAAgA0EIaiEHIAAoAgAhASMAQRBrIgIkACACQQRqIQQgACgCBCEKQQEhCEEEIQUCQEEEIAFBAWoiASAAKAIAIglBAXQiBiABIAZLGyIBIAFBBE0bIgatQgx+IgtCIIhQRQRAQQAhAQwBCyALpyIBQfz///8HSwRAQQAhAQwBCwJAAkACfyAJBEAgCiAJQQxsQQQgARA4DAELIAFFDQEgAUEEEEALIgUNACAEQQQ2AgQMAQsgBCAFNgIEQQAhCAtBCCEFCyAEIAVqIAE2AgAgBCAINgIAAn8gAigCBARAIAIoAgwhACACKAIIDAELIAIoAgghASAAIAY2AgAgACABNgIEQYGAgIB4CyEBIAcgADYCBCAHIAE2AgAgAkEQaiQAIAMoAggiAEGBgICAeEcEQCAAIAMoAgwQNQALIANBEGokAAtEAQJ/IAEoAgQhAiABKAIAIQNBCEEEEEAiAUUEQEEEQQgQQwALIAEgAjYCBCABIAM2AgAgAEHEjsAANgIEIAAgATYCAAveAQIBfwF+IwBBIGsiAyQAIAMgATYCECADIAA2AgwgA0EBOwEcIAMgAjYCGCADIANBDGo2AhQjAEEQayIBJAAgA0EUaiIAKQIAIQQgASAANgIMIAEgBDcCBCMAQRBrIgAkACABQQRqIgEoAgAiAigCBCIDQQFxBEAgAigCACECIAAgA0EBdjYCBCAAIAI2AgAgAEGMjsAAIAEoAgQgASgCCCIALQAIIAAtAAkQFgALIABBgICAgHg2AgAgACABNgIMIABBqI7AACABKAIEIAEoAggiAC0ACCAALQAJEBYACy4AAkAgAWlBAUcgAEGAgICAeCABa0tyDQAgAARAIAAgARBAIgFFDQELIAEPCwALPgAgACgCAEGAgICAeEcEQCABIAAoAgQgACgCCBA3DwsgASgCACABKAIEIAAoAgwoAgAiACgCACAAKAIEEA4LOAACQCACQYCAxABGDQAgACACIAEoAhARAQBFDQBBAQ8LIANFBEBBAA8LIAAgA0EAIAEoAgwRAgALLQACQCADaUEBRyABQYCAgIB4IANrS3INACAAIAEgAyACEDgiAEUNACAADwsACx0AIABFBEAQQQALIAAgAiADIAQgBSABKAIQEQkACxsAIABFBEAQQQALIAAgAiADIAQgASgCEBEGAAsbACAARQRAEEEACyAAIAIgAyAEIAEoAhARCwALGwAgAEUEQBBBAAsgACACIAMgBCABKAIQERAACxsAIABFBEAQQQALIAAgAiADIAQgASgCEBESAAsbACAARQRAEEEACyAAIAIgAyAEIAEoAhARFAALJQEBfyAAKAIAIgFBgICAgHhyQYCAgIB4RwRAIAAoAgQgARA8CwsZACAARQRAEEEACyAAIAIgAyABKAIQEQQACxcAIABFBEAQQQALIAAgAiABKAIQEQEACxEAQeSPwABBOUGAkMAAECMACxcBAX8gACgCACIBBEAgACgCBCABEDwLCx8AIABBCGpB3I3AACkCADcCACAAQdSNwAApAgA3AgALHwAgAEEIakHsjcAAKQIANwIAIABB5I3AACkCADcCAAsdACAABEAgACABEEMAC0GQkMAAQSNBpJDAABAjAAsRACAAIAFBAXRBAXIgAhAjAAsWACAAKAIAIAEgAiAAKAIEKAIMEQIAC+cGAQV/An8CQAJAAkACQAJAAkACQCAAQQRrIgcoAgAiCEF4cSIEQQRBCCAIQQNxIgUbIAFqTwRAIAVBACABQSdqIgYgBEkbDQECQCACQQlPBEAgAiADEBEiAg0BQQAMCgtBACECIANBzP97Sw0IQRAgA0ELakF4cSADQQtJGyEBIABBCGshBiAFRQRAIAZFIAFBgAJJciAEIAFrQYCACEsgASAET3JyDQcgAAwKCyAEIAZqIQUCQCABIARLBEAgBUHklsAAKAIARg0BQeCWwAAoAgAgBUcEQCAFKAIEIghBAnENCSAIQXhxIgggBGoiBCABSQ0JIAUgCBASIAQgAWsiBUEQTwRAIAcgASAHKAIAQQFxckECcjYCACABIAZqIgEgBUEDcjYCBCAEIAZqIgQgBCgCBEEBcjYCBCABIAUQEAwJCyAHIAQgBygCAEEBcXJBAnI2AgAgBCAGaiIBIAEoAgRBAXI2AgQMCAtB2JbAACgCACAEaiIEIAFJDQgCQCAEIAFrIgVBD00EQCAHIAhBAXEgBHJBAnI2AgAgBCAGaiIBIAEoAgRBAXI2AgRBACEFQQAhAQwBCyAHIAEgCEEBcXJBAnI2AgAgASAGaiIBIAVBAXI2AgQgBCAGaiIEIAU2AgAgBCAEKAIEQX5xNgIEC0HglsAAIAE2AgBB2JbAACAFNgIADAcLIAQgAWsiBEEPTQ0GIAcgASAIQQFxckECcjYCACABIAZqIgEgBEEDcjYCBCAFIAUoAgRBAXI2AgQgASAEEBAMBgtB3JbAACgCACAEaiIEIAFLDQQMBgsgAyABIAEgA0sbIgMEQCACIAAgA/wKAAALIAcoAgAiA0F4cSIHIAFBBEEIIANBA3EiAxtqSQ0CIANFIAYgB09yDQZBlI/AAEEuQcSPwAAQNgALQdSOwABBLkGEj8AAEDYAC0GUj8AAQS5BxI/AABA2AAtB1I7AAEEuQYSPwAAQNgALIAcgASAIQQFxckECcjYCACABIAZqIgUgBCABayIBQQFyNgIEQdyWwAAgATYCAEHklsAAIAU2AgALIAZFDQAgAAwDCyADEAUiAUUNASADQXxBeCAHKAIAIgJBA3EbIAJBeHFqIgIgAiADSxsiAgRAIAEgACAC/AoAAAsgASECCyAAEAsLIAILCxAAIAEgACgCACAAKAIEEDcLEwAgAEHEjsAANgIEIAAgATYCAAucCwEMfyAAKAIAIQYgACgCBCEFQQAhAAJAAkAgASIIKAIIIgpBgICAwAFxRQ0AAkACQAJAAkAgCkGAgICAAXEEQCABLwEOIgMNAUEAIQUMAgsgBUEQTwRAAn8CQAJAIAUgBkEDakF8cSIAIAZrIglJDQAgBSAJayIBQQRJDQAgACAGRwRAIAYgAGsiAEF8TQRAA0AgAyAEIAZqIgIsAABBv39KaiACQQFqLAAAQb9/SmogAkECaiwAAEG/f0pqIAJBA2osAABBv39KaiEDIARBBGoiBA0ACwsgBCAGaiECA0AgAyACLAAAQb9/SmohAyACQQFqIQIgAEEBaiIADQALCyAGIAlqIQACQCABQQNxIgJFDQAgACABQfz///8HcWoiBCwAAEG/f0ohByACQQFGDQAgByAELAABQb9/SmohByACQQJGDQAgByAELAACQb9/SmohBwsgAUECdiEJIAMgB2ohBANAIAAhASAJRQ0CQcABIAkgCUHAAU8bIgdBA3EhCwJAIAdBAnQiAEHwB3EiA0UEQEEAIQIMAQsgASADaiEMQQAhAiABIQMDQCACIAMoAgAiDUF/c0EHdiANQQZ2ckGBgoQIcWogA0EEaigCACICQX9zQQd2IAJBBnZyQYGChAhxaiADQQhqKAIAIgJBf3NBB3YgAkEGdnJBgYKECHFqIANBDGooAgAiAkF/c0EHdiACQQZ2ckGBgoQIcWohAiADQRBqIgMgDEcNAAsLIAkgB2shCSAAIAFqIQAgAkEIdkH/gfwHcSACQf+B/AdxakGBgARsQRB2IARqIQQgC0UNAAsCfyABIAdB/AFxQQJ0aiIAKAIAIgFBf3NBB3YgAUEGdnJBgYKECHEiASALQQFGDQAaIAEgACgCBCIDQX9zQQd2IANBBnZyQYGChAhxaiIBIAtBAkYNABogASAAKAIIIgBBf3NBB3YgAEEGdnJBgYKECHFqCyIAQQh2Qf+BHHEgAEH/gfwHcWpBgYAEbEEQdiAEaiEEDAELQQAgBUUNARogBUEDcSEAIAVBBE8EQCAFQXxxIQMDQCAEIAIgBmoiASwAAEG/f0pqIAFBAWosAABBv39KaiABQQJqLAAAQb9/SmogAUEDaiwAAEG/f0pqIQQgAyACQQRqIgJHDQALCyAARQ0AIAIgBmohAwNAIAQgAywAAEG/f0pqIQQgA0EBaiEDIABBAWsiAA0ACwsgBAshAgwECyAFRQ0DIAVBA3EhAyAFQQRPBEAgBUEMcSEEA0AgAiAAIAZqIgEsAABBv39KaiABQQFqLAAAQb9/SmogAUECaiwAAEG/f0pqIAFBA2osAABBv39KaiECIAQgAEEEaiIARw0ACwsgA0UNAyAAIAZqIQEDQCACIAEsAABBv39KaiECIAFBAWohASADQQFrIgMNAAsMAwsgBSAGaiEHQQAhBSAGIQEgAyEAA0AgASICIAdGDQIgBQJ/IAFBAWogASwAACIEQQBODQAaIAFBAmogBEFgSQ0AGiABQQNqIARBcEkNABogAUEEagsiASACa2ohBSAAQQFrIgANAAsLQQAhAAsgAyAAayECCyACIAgvAQwiAE8NACAAIAJrIQNBACECQQAhAAJAAkACQCAKQR12QQNxQQFrDgIAAQILIAMhAAwBCyADQf7/A3FBAXYhAAsgCkH///8AcSEHIAgoAgQhBCAIKAIAIQgDQCACQf//A3EgAEH//wNxSQRAQQEhASACQQFqIQIgCCAHIAQoAhARAQBFDQEMAwsLQQEhASAIIAYgBSAEKAIMEQIADQFBACECIAMgAGtB//8DcSEAA0AgAkH//wNxIgMgAEkhASAAIANNDQIgAkEBaiECIAggByAEKAIQEQEARQ0ACwwBCyAIKAIAIAYgBSAIKAIEKAIMEQIAIQELIAELXwECfwJAAkAgAEEEaygCACICQXhxIgNBBEEIIAJBA3EiAhsgAWpPBEAgAkEAIAMgAUEnaksbDQEgABALDAILQdSOwABBLkGEj8AAEDYAC0GUj8AAQS5BxI/AABA2AAsLDwAgAEH0jcAAIAEgAhAOCw4AQeiSwABBKyAAEDYACxIAQYySwABBmQFB2JLAABAjAAsZAAJ/IAFBCU8EQCABIAAQEQwBCyAAEAULCwwAQdSMwABBMhADAAsMACAAIAEpAgA3AwALPQEBfyMAQRBrIgIkACACIAE2AgwgAiAANgIIIAJBCGoiACgCACAAKAIEQZyXwAAoAgAiAEENIAAbEQAAAAsMAEGYl8AAQQE6AAALCQAgAEEANgIACwvdEgQAQYCAwAALowhtaWQgPiBsZW4Wc2xpY2UgaW5kZXggc3RhcnRzIGF0IMANIGJ1dCBlbmRzIGF0IMAAIGluZGV4IG91dCBvZiBib3VuZHM6IHRoZSBsZW4gaXMgwBIgYnV0IHRoZSBpbmRleCBpcyDAABJyYW5nZSBzdGFydCBpbmRleCDAIiBvdXQgb2YgcmFuZ2UgZm9yIHNsaWNlIG9mIGxlbmd0aCDAABByYW5nZSBlbmQgaW5kZXggwCIgb3V0IG9mIHJhbmdlIGZvciBzbGljZSBvZiBsZW5ndGggwAAvcnVzdGMvNGE0ZWY0OTNlM2ExNDg4YzZlMzIxNTcwMjM4MDg0YjM4OTQ4ZjZkYi9saWJyYXJ5L2NvcmUvc3JjL3NsaWNlL3NvcnQvc2hhcmVkL3NtYWxsc29ydC5ycwAvaG9tZS9nZXJyaWUvLnJ1c3R1cC90b29sY2hhaW5zL3N0YWJsZS14ODZfNjQtdW5rbm93bi1saW51eC1nbnUvbGliL3J1c3RsaWIvc3JjL3J1c3QvbGlicmFyeS9jb3JlL3NyYy9zbGljZS9zb3J0L3N0YWJsZS9xdWlja3NvcnQucnMAL2hvbWUvZ2VycmllLy5ydXN0dXAvdG9vbGNoYWlucy9zdGFibGUteDg2XzY0LXVua25vd24tbGludXgtZ251L2xpYi9ydXN0bGliL3NyYy9ydXN0L2xpYnJhcnkvc3RkL3NyYy9zeXMvdGhyZWFkX2xvY2FsL25vX3RocmVhZHMucnMAL2hvbWUvZ2VycmllLy5ydXN0dXAvdG9vbGNoYWlucy9zdGFibGUteDg2XzY0LXVua25vd24tbGludXgtZ251L2xpYi9ydXN0bGliL3NyYy9ydXN0L2xpYnJhcnkvYWxsb2Mvc3JjL3N0ci5ycwAvcnVzdGMvNGE0ZWY0OTNlM2ExNDg4YzZlMzIxNTcwMjM4MDg0YjM4OTQ4ZjZkYi9saWJyYXJ5L2NvcmUvc3JjL2ZtdC9udW0ucnMAL3J1c3QvZGVwcy9oYXNoYnJvd24tMC4xNi4xL3NyYy9yYXcvbW9kLnJzAC9ydXN0Yy80YTRlZjQ5M2UzYTE0ODhjNmUzMjE1NzAyMzgwODRiMzg5NDhmNmRiL2xpYnJhcnkvYWxsb2Mvc3JjL3Jhd192ZWMvbW9kLnJzAC9ydXN0L2RlcHMvZGxtYWxsb2MtMC4yLjExL3NyYy9kbG1hbGxvYy5ycwBzcmMvbGliLnJzAAAAADgBEACEAAAASgAAAB8AAAA4ARAAhAAAAEQAAAAXAAAAogMQAAoAAABSAQAAHwAAAC8qKiovLy8vCi8vYiIiIgEiXCIA8QMQAAIAAADwAxAAAQAAAKIDEAAKAAAAtQAAAE4AAAAAAAAA//////////8YBBAAQbCIwAALsAKiAxAACgAAAOMAAABKAAAAogMQAAoAAADvAAAARwAAAKIDEAAKAAAAFAEAADcAAACiAxAACgAAADEBAAA0AAAAogMQAAoAAAAiAQAAPwAAAKIDEAAKAAAA/QAAAEkAAABBdHRlbXB0ZWQgdG8gaW5pdGlhbGl6ZSB0aHJlYWQtbG9jYWwgd2hpbGUgaXQgaXMgYmVpbmcgZHJvcHBlZAAAvQEQAIMAAABrAAAADQAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAEGii8AACzMCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAwMDAwMDAwMDAwMDAwMDBAQEBAQAQeCLwAALswdtaWQgPiBsZW4AAABBAhAAbQAAALEAAAAWAAAAYXR0ZW1wdCB0byBqb2luIGludG8gY29sbGVjdGlvbiB3aXRoIGxlbiA+IHVzaXplOjpNQVgAAABBAhAAbQAAAJoAAAAKAAAAogMQAAoAAADeAAAAMQAAAGNsb3N1cmUgaW52b2tlZCByZWN1cnNpdmVseSBvciBhZnRlciBiZWluZyBkcm9wcGVkQXR0ZW1wdGVkIHRvIGluaXRpYWxpemUgdGhyZWFkLWxvY2FsIHdoaWxlIGl0IGlzIGJlaW5nIGRyb3BwZWS9ARAAgwAAAGsAAAANAAAAbV3L1ixQ62N4QaZXcRuLuSPKO0qmd3yTQmNJr5dvsoQOAAAADAAAAAQAAAAPAAAAEAAAABEAAAAAAAAACAAAAAQAAAASAAAAEwAAABQAAAAVAAAAFgAAABAAAAAEAAAAFwAAABgAAAAZAAAAGgAAAAAAAAAIAAAABAAAABsAAABhc3NlcnRpb24gZmFpbGVkOiBwc2l6ZSA+PSBzaXplICsgbWluX292ZXJoZWFkAAB3AxAAKgAAALEEAAAJAAAAYXNzZXJ0aW9uIGZhaWxlZDogcHNpemUgPD0gc2l6ZSArIG1heF9vdmVyaGVhZAAAdwMQACoAAAC3BAAADQAAAA4AAAAMAAAABAAAABwAAABIYXNoIHRhYmxlIGNhcGFjaXR5IG92ZXJmbG93+wIQACoAAAAlAAAAKAAAAGNhcGFjaXR5IG92ZXJmbG93AAAAJgMQAFAAAAAcAAAABQAAADAwMDEwMjAzMDQwNTA2MDcwODA5MTAxMTEyMTMxNDE1MTYxNzE4MTkyMDIxMjIyMzI0MjUyNjI3MjgyOTMwMzEzMjMzMzQzNTM2MzczODM5NDA0MTQyNDM0NDQ1NDY0NzQ4NDk1MDUxNTI1MzU0NTU1NjU3NTg1OTYwNjE2MjYzNjQ2NTY2Njc2ODY5NzA3MTcyNzM3NDc1NzY3Nzc4Nzk4MDgxODI4Mzg0ODU4Njg3ODg4OTkwOTE5MjkzOTQ5NTk2OTc5ODk5rwIQAEsAAABXAgAABQAAAHVzZXItcHJvdmlkZWQgY29tcGFyaXNvbiBmdW5jdGlvbiBkb2VzIG5vdCBjb3JyZWN0bHkgaW1wbGVtZW50IGEgdG90YWwgb3JkZXLYABAAXwAAAFwDAAAFAAAAY2FsbGVkIGBPcHRpb246OnVud3JhcCgpYCBvbiBhIGBOb25lYCB2YWx1ZQB7CXByb2R1Y2VycwIIbGFuZ3VhZ2UBBFJ1c3QADHByb2Nlc3NlZC1ieQMFcnVzdGMdMS45NC4wICg0YTRlZjQ5M2UgMjAyNi0wMy0wMikGd2FscnVzBjAuMjAuMwx3YXNtLWJpbmRnZW4SMC4yLjkyICgyYTRhNDkzNjIpAGsPdGFyZ2V0X2ZlYXR1cmVzBisPbXV0YWJsZS1nbG9iYWxzKxNub250cmFwcGluZy1mcHRvaW50KwtidWxrLW1lbW9yeSsIc2lnbi1leHQrD3JlZmVyZW5jZS10eXBlcysKbXVsdGl2YWx1ZQ==");

// main.ts
var DEFAULT_SETTINGS = {
  documentPath: "UNKNOWN",
  applicationExtension: ".java",
  unitTestPath: "UNKNOWN",
  sleepLength: 0,
  applicationPath: "UNKNOWN",
  groupBySize: 0
};
var VERSION = "1.0.1";
var SourceScanner = class extends import_obsidian2.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.intervalHandle = void 0;
    this.scanSource = new ScanSource();
    this.app = app;
    this.utils = new Utils(app);
  }
  getPlatformPathAndName() {
    const platform = process.platform;
    const adapter = this.app.vault.adapter;
    let executablePath = "";
    let workFolder = "";
    if (adapter instanceof import_obsidian2.FileSystemAdapter) {
      if (platform === "win32") {
        const basePath = adapter.getBasePath() + "\\" + this.app.vault.configDir + "\\plugins\\code-scanner-ver2";
        executablePath = basePath + "\\get-comments.exe";
        if (this.codeScannerSettings.work.startsWith("\\")) {
          workFolder = this.codeScannerSettings.work;
        } else {
          workFolder = "\\" + this.codeScannerSettings.work;
        }
      } else if (platform === "darwin") {
        const basePath = adapter.getBasePath() + "/" + this.app.vault.configDir + "/plugins/code-scanner-ver2";
        executablePath = basePath + "/get-comments-macos";
        if (this.codeScannerSettings.work.startsWith("/")) {
          workFolder = this.codeScannerSettings.work;
        } else {
          workFolder = "/" + this.codeScannerSettings.work;
        }
      } else if (platform === "linux") {
        const basePath = adapter.getBasePath() + "/" + this.app.vault.configDir + "/plugins/code-scanner-ver2";
        executablePath = basePath + "/get-comments-linux";
        if (this.codeScannerSettings.work.startsWith("/")) {
          workFolder = this.codeScannerSettings.work;
        } else {
          workFolder = "/" + this.codeScannerSettings.work;
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
      if (!(0, import_fs3.existsSync)(executablePath)) {
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
    if (this.codeScannerSettings.dir == "UNKNOWN") {
      new InfoModal(this.app, "Configuration Required", "Please configure plugin before using").open();
      return;
    }
    const adapter = this.app.vault.adapter;
    const parameters = [
      "-dir",
      this.codeScannerSettings.dir,
      "-start",
      this.codeScannerSettings.start,
      "-path",
      this.codeScannerSettings.path,
      "-ext",
      this.codeScannerSettings.extension,
      "-dest",
      this.codeScannerSettings.destExtension
    ];
    await this.checkCLIVersion().then((data) => {
      const path2 = this.getPlatformPathAndName();
      if (path2[0]) {
        const executablePath = path2[1];
        const workFolder = path2[2];
        if (!(0, import_fs3.existsSync)(executablePath)) {
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
  async onload() {
    await this.loadSettings();
    new VersionSelectionModal(this.app, (selectedVersion) => {
      if (selectedVersion === "version1") {
        console.log("Version 1 selected");
        this.addSettingTab(new ScannerSettingsTab(this.app, this, "version1"));
      } else if (selectedVersion === "version2") {
        console.log("Version 2 selected");
        this.addSettingTab(new ScannerSettingsTab(this.app, this, "version2"));
      }
    }).open();
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
    this.addCommand({
      id: "open-sample-modal-complex",
      name: "Open sample modal (complex)",
      checkCallback: (checking) => {
        const markdownView = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
        if (markdownView) {
          if (!checking) {
            new SampleModal(this.app).open();
          }
          return true;
        }
      }
    });
    this.registerDomEvent(document, "click", (evt) => {
      console.log("click", evt);
    });
    this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1e3));
    await obsidian_rust_plugin_default(Promise.resolve(obsidian_rust_plugin_bg_default));
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
var SampleModal = class extends import_obsidian2.Modal {
  constructor(app) {
    super(app);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.setText("Woah!");
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var InfoModal = class extends import_obsidian2.Modal {
  constructor(app, title, message) {
    super(app);
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
var _VersionSelectionModal = class extends import_obsidian2.Modal {
  constructor(app) {
    super(app);
    this.resolvePromise = null;
    this.rejectPromise = null;
    this.selectedVersion = "version1";
  }
  static async selectVersion(app) {
    if (_VersionSelectionModal.currentModal) {
      _VersionSelectionModal.currentModal.close();
    }
    const modal = new _VersionSelectionModal(app);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJ0cy9TZXR0aW5nc1RhYi50cyIsICJ0cy9TY2FuU291cmNlLnRzIiwgInRzL1V0aWxzLnRzIiwgInRzL0RvY0ZvbGRlcnMudHMiLCAidHMvQ3Jvc3NDdXR0aW5nQ29uY2VybnMudHMiLCAidHMvTWFya2VyR3JvdXBMaXN0LnRzIiwgInBrZy9vYnNpZGlhbl9ydXN0X3BsdWdpbi5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgXG5cdEFwcCwgXG5cdEVkaXRvciwgXG5cdEZpbGVTeXN0ZW1BZGFwdGVyLFxuXHRNYXJrZG93blZpZXcsIFxuXHRNb2RhbCwgXG5cdFBsdWdpbk1hbmlmZXN0LCBcblx0UGx1Z2luLCBcblx0UGx1Z2luU2V0dGluZ1RhYixcblx0Tm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuXG5pbXBvcnQgeyBTY2FubmVyU2V0dGluZ3NUYWIgfSBmcm9tIFwiLi90cy9TZXR0aW5nc1RhYlwiO1xuaW1wb3J0IHsgU2NhblNvdXJjZSB9IGZyb20gJy4vdHMvU2NhblNvdXJjZSdcbmltcG9ydCB7IENyb3NzQ3V0dGluZ0NvbmNlcm5zIH0gZnJvbSAnLi90cy9Dcm9zc0N1dHRpbmdDb25jZXJucyc7XG5pbXBvcnQgeyBNYXJrZXJHcm91cExpc3QgfSBmcm9tICcuL3RzL01hcmtlckdyb3VwTGlzdCc7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJy4vdHMvVXRpbHMnXG5pbXBvcnQgeyBzcGF3biwgc3Bhd25TeW5jIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwiZnNcIjtcblxuaW1wb3J0ICogYXMgbGV4ZXJfcGx1Z2luIGZyb20gXCIuL3BrZy9vYnNpZGlhbl9ydXN0X3BsdWdpbi5qc1wiO1xuaW1wb3J0ICogYXMgbGV4ZXJfd2FzbSBmcm9tICcuL3BrZy9vYnNpZGlhbl9ydXN0X3BsdWdpbl9iZy53YXNtJztcblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnXG5cbmludGVyZmFjZSBDb2RlU2Nhbm5lclNldHRpbmdzIHtcblx0ZGlyOiBzdHJpbmc7XG5cdHdvcms6IHN0cmluZztcblx0c3RhcnQ6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRleHRlbnNpb246IHN0cmluZztcblx0ZGVzdEV4dGVuc2lvbjogc3RyaW5nO1xufVxuXG5jb25zdCBDT0RFX1NDQU5ORVJfREVGQVVMVF9TRVRUSU5HUzogQ29kZVNjYW5uZXJTZXR0aW5ncyA9IHtcblx0ZGlyOiBcIlVOS05PV05cIixcblx0d29yazogXCJVTktOT1dOXCIsXG5cdHN0YXJ0OiBcIlVOS05PV05cIixcblx0cGF0aDogXCJVTktOT1dOXCIsXG5cdGV4dGVuc2lvbjogXCJVTktOT1dOXCIsXG5cdGRlc3RFeHRlbnNpb246IFwiVU5LTk9XTlwiLFxufTtcblxuaW50ZXJmYWNlIE15UGx1Z2luU2V0dGluZ3Mge1xuXHRkb2N1bWVudFBhdGg6IHN0cmluZztcblx0YXBwbGljYXRpb25FeHRlbnNpb246IHN0cmluZztcblx0c2xlZXBMZW5ndGg6IG51bWJlcjtcblx0YXBwbGljYXRpb25QYXRoOiBzdHJpbmc7XG5cdHVuaXRUZXN0UGF0aDogc3RyaW5nO1xuXHRncm91cEJ5U2l6ZTogbnVtYmVyO1xufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBNeVBsdWdpblNldHRpbmdzID0ge1xuXHRkb2N1bWVudFBhdGg6ICdVTktOT1dOJyxcblx0YXBwbGljYXRpb25FeHRlbnNpb246ICcuamF2YScsXG5cdHVuaXRUZXN0UGF0aDogXCJVTktOT1dOXCIsXG5cdHNsZWVwTGVuZ3RoOiAwLjAsXG5cdGFwcGxpY2F0aW9uUGF0aDogJ1VOS05PV04nLFxuXHRncm91cEJ5U2l6ZTogMC4wLFxufVxuXG5jb25zdCBWRVJTSU9OID0gXCIxLjAuMVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb3VyY2VTY2FubmVyIGV4dGVuZHMgUGx1Z2luIHtcblx0YXBwOiBBcHA7XG5cdGNvZGVTY2FubmVyU2V0dGluZ3M6IENvZGVTY2FubmVyU2V0dGluZ3M7XG5cdHNldHRpbmdzOiBNeVBsdWdpblNldHRpbmdzO1xuXHRpbnRlcnZhbEhhbmRsZTogYW55ID0gdW5kZWZpbmVkO1xuXHRzY2FuU291cmNlID0gbmV3IFNjYW5Tb3VyY2UoKTtcblx0dXRpbHM6IFV0aWxzO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBtYW5pZmVzdDogUGx1Z2luTWFuaWZlc3QpIHtcblx0XHRzdXBlcihhcHAsIG1hbmlmZXN0KTtcblx0XHR0aGlzLmFwcCA9IGFwcDtcblx0XHR0aGlzLnV0aWxzID0gbmV3IFV0aWxzKGFwcCk7XG5cdH1cblxuXHRcdHByaXZhdGUgZ2V0UGxhdGZvcm1QYXRoQW5kTmFtZSgpOiBbYm9vbGVhbiwgc3RyaW5nPywgc3RyaW5nP10ge1xuXHRcdGNvbnN0IHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybTsgLy8gZS5nLiwgJ2RhcndpbicsICd3aW4zMicsICdsaW51eCdcblx0XHRjb25zdCBhZGFwdGVyID0gdGhpcy5hcHAudmF1bHQuYWRhcHRlcjtcblxuXHRcdGxldCBleGVjdXRhYmxlUGF0aCA9IFwiXCI7XG5cdFx0bGV0IHdvcmtGb2xkZXIgPSBcIlwiO1xuXHRcdGlmIChhZGFwdGVyIGluc3RhbmNlb2YgRmlsZVN5c3RlbUFkYXB0ZXIpIHtcblx0XHRcdGlmIChwbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XG5cdFx0XHRcdGNvbnN0IGJhc2VQYXRoID1cblx0XHRcdFx0XHRhZGFwdGVyLmdldEJhc2VQYXRoKCkgK1xuXHRcdFx0XHRcdFwiXFxcXFwiICtcblx0XHRcdFx0XHR0aGlzLmFwcC52YXVsdC5jb25maWdEaXIgK1xuXHRcdFx0XHRcdFwiXFxcXHBsdWdpbnNcXFxcY29kZS1zY2FubmVyLXZlcjJcIjtcblx0XHRcdFx0ZXhlY3V0YWJsZVBhdGggPSBiYXNlUGF0aCArIFwiXFxcXGdldC1jb21tZW50cy5leGVcIjtcblx0XHRcdFx0aWYgKHRoaXMuY29kZVNjYW5uZXJTZXR0aW5ncy53b3JrLnN0YXJ0c1dpdGgoXCJcXFxcXCIpKSB7XG5cdFx0XHRcdFx0d29ya0ZvbGRlciA9IHRoaXMuY29kZVNjYW5uZXJTZXR0aW5ncy53b3JrO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdvcmtGb2xkZXIgPSBcIlxcXFxcIiArIHRoaXMuY29kZVNjYW5uZXJTZXR0aW5ncy53b3JrO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHBsYXRmb3JtID09PSBcImRhcndpblwiKSB7XG5cdFx0XHRcdGNvbnN0IGJhc2VQYXRoID1cblx0XHRcdFx0XHRhZGFwdGVyLmdldEJhc2VQYXRoKCkgK1xuXHRcdFx0XHRcdFwiL1wiICtcblx0XHRcdFx0XHR0aGlzLmFwcC52YXVsdC5jb25maWdEaXIgK1xuXHRcdFx0XHRcdFwiL3BsdWdpbnMvY29kZS1zY2FubmVyLXZlcjJcIjtcblx0XHRcdFx0ZXhlY3V0YWJsZVBhdGggPSBiYXNlUGF0aCArIFwiL2dldC1jb21tZW50cy1tYWNvc1wiO1xuXHRcdFx0XHRpZiAodGhpcy5jb2RlU2Nhbm5lclNldHRpbmdzLndvcmsuc3RhcnRzV2l0aChcIi9cIikpIHtcblx0XHRcdFx0XHR3b3JrRm9sZGVyID0gdGhpcy5jb2RlU2Nhbm5lclNldHRpbmdzLndvcms7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d29ya0ZvbGRlciA9IFwiL1wiICsgdGhpcy5jb2RlU2Nhbm5lclNldHRpbmdzLndvcms7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAocGxhdGZvcm0gPT09IFwibGludXhcIikge1xuXHRcdFx0XHRjb25zdCBiYXNlUGF0aCA9XG5cdFx0XHRcdFx0YWRhcHRlci5nZXRCYXNlUGF0aCgpICtcblx0XHRcdFx0XHRcIi9cIiArXG5cdFx0XHRcdFx0dGhpcy5hcHAudmF1bHQuY29uZmlnRGlyICtcblx0XHRcdFx0XHRcIi9wbHVnaW5zL2NvZGUtc2Nhbm5lci12ZXIyXCI7XG5cdFx0XHRcdGV4ZWN1dGFibGVQYXRoID0gYmFzZVBhdGggKyBcIi9nZXQtY29tbWVudHMtbGludXhcIjtcblx0XHRcdFx0aWYgKHRoaXMuY29kZVNjYW5uZXJTZXR0aW5ncy53b3JrLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XG5cdFx0XHRcdFx0d29ya0ZvbGRlciA9IHRoaXMuY29kZVNjYW5uZXJTZXR0aW5ncy53b3JrO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdvcmtGb2xkZXIgPSBcIi9cIiArIHRoaXMuY29kZVNjYW5uZXJTZXR0aW5ncy53b3JrO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRuZXcgSW5mb01vZGFsKFxuXHRcdFx0XHRcdHRoaXMuYXBwLFxuXHRcdFx0XHRcdFwiVW5zdXBwb3J0ZWQgUGxhdGZvcm1cIixcblx0XHRcdFx0XHRgVW5zdXBwb3J0ZWQgcGxhdGZvcm06ICR7cGxhdGZvcm19YCxcblx0XHRcdFx0KS5vcGVuKCk7XG5cdFx0XHRcdHJldHVybiBbZmFsc2VdO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFt0cnVlLCBleGVjdXRhYmxlUGF0aCwgd29ya0ZvbGRlcl07XG5cdFx0fVxuXHRcdHJldHVybiBbZmFsc2VdO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBjaGVja0NMSVZlcnNpb24oKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgcGFyYW1ldGVycyA9IFtcIi12ZXJcIl07XG5cdFx0Y29uc3QgcGF0aCA9IHRoaXMuZ2V0UGxhdGZvcm1QYXRoQW5kTmFtZSgpO1xuXG5cdFx0aWYgKHBhdGhbMF0pIHtcblx0XHRcdGNvbnN0IGV4ZWN1dGFibGVQYXRoID0gcGF0aFsxXSBhcyBzdHJpbmc7XG5cdFx0XHQvLyBDaGVjayBpZiBleGVjdXRhYmxlIGV4aXN0c1xuXHRcdFx0aWYgKCFleGlzdHNTeW5jKGV4ZWN1dGFibGVQYXRoKSkge1xuXHRcdFx0XHRuZXcgSW5mb01vZGFsKFxuXHRcdFx0XHRcdHRoaXMuYXBwLFxuXHRcdFx0XHRcdFwiRXhlY3V0YWJsZSBOb3QgRm91bmRcIixcblx0XHRcdFx0XHRgRXhlY3V0YWJsZSBub3QgZm91bmQ6ICR7ZXhlY3V0YWJsZVBhdGh9YCxcblx0XHRcdFx0KS5vcGVuKCk7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoYEV4ZWN1dGFibGUgbm90IGZvdW5kOiAke2V4ZWN1dGFibGVQYXRofWApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBOb3cgc3Bhd24gdGhlIHByb2Nlc3Ncblx0XHRcdGNvbnN0IHJlc3VsdCA9IHNwYXduU3luYyhleGVjdXRhYmxlUGF0aCwgcGFyYW1ldGVycyk7XG5cblx0XHRcdGNvbnN0IHZlcnNpb24gPSBTdHJpbmcocmVzdWx0LnN0ZG91dCkudHJpbSgpO1xuXHRcdFx0aWYgKHZlcnNpb24gIT0gVkVSU0lPTikge1xuXHRcdFx0XHRjb25zdCBtb2RhbCA9IG5ldyBJbmZvTW9kYWwoXG5cdFx0XHRcdFx0dGhpcy5hcHAsXG5cdFx0XHRcdFx0XCJDTEkgVmVyc2lvbiBtaXNtYXRjaCAtIHBsdWdpbiB2ZXJzaW9uIGlzIFtcIiArXG5cdFx0XHRcdFx0XHRWRVJTSU9OICtcblx0XHRcdFx0XHRcdFwiXVwiLFxuXHRcdFx0XHRcdGBDTEkgVmVyc2lvbjogYCArIHZlcnNpb24sXG5cdFx0XHRcdCk7XG5cdFx0XHRcdG1vZGFsLm9wZW4oKTtcblx0XHRcdFx0YXdhaXQgbW9kYWwuZ2V0UmVzdWx0KCk7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlZlcnNpb24gbWlzbWF0Y2hcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyB0cmlnZ2VyU2NhbigpIHtcblx0XHRpZiAodGhpcy5jb2RlU2Nhbm5lclNldHRpbmdzLmRpciA9PSBcIlVOS05PV05cIikge1xuXHRcdFx0bmV3IEluZm9Nb2RhbChcblx0XHRcdFx0dGhpcy5hcHAsXG5cdFx0XHRcdFwiQ29uZmlndXJhdGlvbiBSZXF1aXJlZFwiLFxuXHRcdFx0XHRcIlBsZWFzZSBjb25maWd1cmUgcGx1Z2luIGJlZm9yZSB1c2luZ1wiLFxuXHRcdFx0KS5vcGVuKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyO1xuXHRcdGNvbnN0IHBhcmFtZXRlcnMgPSBbXG5cdFx0XHRcIi1kaXJcIixcblx0XHRcdHRoaXMuY29kZVNjYW5uZXJTZXR0aW5ncy5kaXIsXG5cdFx0XHRcIi1zdGFydFwiLFxuXHRcdFx0dGhpcy5jb2RlU2Nhbm5lclNldHRpbmdzLnN0YXJ0LFxuXHRcdFx0XCItcGF0aFwiLFxuXHRcdFx0dGhpcy5jb2RlU2Nhbm5lclNldHRpbmdzLnBhdGgsXG5cdFx0XHRcIi1leHRcIixcblx0XHRcdHRoaXMuY29kZVNjYW5uZXJTZXR0aW5ncy5leHRlbnNpb24sXG5cdFx0XHRcIi1kZXN0XCIsXG5cdFx0XHR0aGlzLmNvZGVTY2FubmVyU2V0dGluZ3MuZGVzdEV4dGVuc2lvbixcblx0XHRdO1xuXG5cdFx0YXdhaXQgdGhpcy5jaGVja0NMSVZlcnNpb24oKVxuXHRcdFx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRcdFx0Y29uc3QgcGF0aCA9IHRoaXMuZ2V0UGxhdGZvcm1QYXRoQW5kTmFtZSgpO1xuXG5cdFx0XHRcdGlmIChwYXRoWzBdKSB7XG5cdFx0XHRcdFx0Y29uc3QgZXhlY3V0YWJsZVBhdGggPSBwYXRoWzFdIGFzIHN0cmluZztcblx0XHRcdFx0XHRjb25zdCB3b3JrRm9sZGVyID0gcGF0aFsyXSBhcyBzdHJpbmc7XG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgZXhlY3V0YWJsZSBleGlzdHNcblx0XHRcdFx0XHRpZiAoIWV4aXN0c1N5bmMoZXhlY3V0YWJsZVBhdGgpKSB7XG5cdFx0XHRcdFx0XHRuZXcgSW5mb01vZGFsKFxuXHRcdFx0XHRcdFx0XHR0aGlzLmFwcCxcblx0XHRcdFx0XHRcdFx0XCJFeGVjdXRhYmxlIE5vdCBGb3VuZFwiLFxuXHRcdFx0XHRcdFx0XHRgRXhlY3V0YWJsZSBub3QgZm91bmQ6ICR7ZXhlY3V0YWJsZVBhdGh9YCxcblx0XHRcdFx0XHRcdCkub3BlbigpO1xuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcblx0XHRcdFx0XHRcdFx0YEV4ZWN1dGFibGUgbm90IGZvdW5kOiAke2V4ZWN1dGFibGVQYXRofWAsXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChhZGFwdGVyIGluc3RhbmNlb2YgRmlsZVN5c3RlbUFkYXB0ZXIpIHtcblx0XHRcdFx0XHRcdC8vIE5vdyBzcGF3biB0aGUgcHJvY2Vzc1xuXHRcdFx0XHRcdFx0Y29uc3Qgd29ya1BhdGggPSBhZGFwdGVyLmdldEJhc2VQYXRoKCkgKyB3b3JrRm9sZGVyO1xuXHRcdFx0XHRcdFx0Y29uc3QgY2hpbGQgPSBzcGF3bihcblx0XHRcdFx0XHRcdFx0ZXhlY3V0YWJsZVBhdGgsXG5cdFx0XHRcdFx0XHRcdHBhcmFtZXRlcnMuY29uY2F0KFtcIi13b3JrXCIsIHdvcmtQYXRoXSksXG5cdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRjaGlsZC5zdGRvdXQub24oXCJkYXRhXCIsIChkYXRhKSA9PiB7XG5cdFx0XHRcdFx0XHRcdG5ldyBJbmZvTW9kYWwoXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5hcHAsXG5cdFx0XHRcdFx0XHRcdFx0XCJQcm9jZXNzIEVycm9yXCIsXG5cdFx0XHRcdFx0XHRcdFx0YEVycm9yOiAke2RhdGF9YCxcblx0XHRcdFx0XHRcdFx0KS5vcGVuKCk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0Y2hpbGQuc3RkZXJyLm9uKFwiZGF0YVwiLCAoZGF0YSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGBzdGRlcnI6ICR7ZGF0YX1gKTtcblx0XHRcdFx0XHRcdFx0bmV3IEluZm9Nb2RhbChcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmFwcCxcblx0XHRcdFx0XHRcdFx0XHRcIlByb2Nlc3MgRXJyb3JcIixcblx0XHRcdFx0XHRcdFx0XHRgRXJyb3I6ICR7ZGF0YX1gLFxuXHRcdFx0XHRcdFx0XHQpLm9wZW4oKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRjaGlsZC5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gc3RhcnQgcHJvY2VzczogJHtlcnJvcn1gKTtcblx0XHRcdFx0XHRcdFx0bmV3IEluZm9Nb2RhbChcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmFwcCxcblx0XHRcdFx0XHRcdFx0XHRcIlByb2Nlc3MgRmFpbGVkXCIsXG5cdFx0XHRcdFx0XHRcdFx0YEZhaWxlZCB0byBzdGFydCBwcm9jZXNzOiAke2Vycm9yLm1lc3NhZ2V9YCxcblx0XHRcdFx0XHRcdFx0KS5vcGVuKCk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0Y2hpbGQub24oXCJjbG9zZVwiLCAoY29kZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAoY29kZSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdG5ldyBJbmZvTW9kYWwoXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmFwcCxcblx0XHRcdFx0XHRcdFx0XHRcdFwiU2NhbiBDb21wbGV0ZVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XCJTY2FuIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHlcIixcblx0XHRcdFx0XHRcdFx0XHQpLm9wZW4oKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRuZXcgSW5mb01vZGFsKFxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5hcHAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcIlNjYW4gRmFpbGVkXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRgU2NhbiBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHtjb2RlfWAsXG5cdFx0XHRcdFx0XHRcdFx0KS5vcGVuKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLndhcm4oXCJzY2FuIGNvZGVcIikpO1xuXHR9XG5cblx0YXN5bmMgb25sb2FkKCkge1xuXG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuXG5cdFx0Ly8gVGhpcyBhZGRzIGEgc2V0dGluZ3MgdGFiIHNvIHRoZSB1c2VyIGNhbiBjb25maWd1cmUgdmFyaW91cyBhc3BlY3RzIG9mIHRoZSBwbHVnaW5cblx0XHQvLyBJbiB5b3VyIG1haW4gcGx1Z2luIGZpbGUgb3IgY29tbWFuZCBjYWxsYmFja1xuXHRcdG5ldyBWZXJzaW9uU2VsZWN0aW9uTW9kYWwodGhpcy5hcHAsIChzZWxlY3RlZFZlcnNpb24pID0+IHtcbiAgICBcdFx0aWYgKHNlbGVjdGVkVmVyc2lvbiA9PT0gJ3ZlcnNpb24xJykge1xuICAgICAgICBcdFx0Y29uc29sZS5sb2coJ1ZlcnNpb24gMSBzZWxlY3RlZCcpO1xuXHRcdFx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IFNjYW5uZXJTZXR0aW5nc1RhYih0aGlzLmFwcCwgdGhpcywgXCJ2ZXJzaW9uMVwiKSk7XG4gICAgXHRcdH0gZWxzZSBpZiAoc2VsZWN0ZWRWZXJzaW9uID09PSAndmVyc2lvbjInKSB7XG4gICAgICAgIFx0XHRjb25zb2xlLmxvZygnVmVyc2lvbiAyIHNlbGVjdGVkJyk7XG5cdFx0XHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgU2Nhbm5lclNldHRpbmdzVGFiKHRoaXMuYXBwLCB0aGlzLCBcInZlcnNpb24yXCIpKTtcbiAgICBcdFx0fVxuXHRcdH0pLm9wZW4oKTtcblx0XHRcblx0XHR2YXIgc2JJdGVtID0gdGhpcy5hZGRTdGF0dXNCYXJJdGVtKClcblx0XHRzYkl0ZW0uc2V0VGV4dChcIkNvbW1lbnQgc2Nhbm5lciBPRkZcIilcblxuXHRcdC8vIFRoaXMgY3JlYXRlcyBhbiBpY29uIGluIHRoZSBsZWZ0IHJpYmJvbi5cblx0XHRjb25zdCByaWJib25JY29uRWwgPSB0aGlzLmFkZFJpYmJvbkljb24oXG5cdFx0XHQndmlldycsXG5cdFx0XHQnQ29tbWVudCBTY2FubmVyIFRTJywgKGV2dDogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHQvLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBjbGlja3MgdGhlIGljb24uXG5cdFx0XHRcdGlmICh0aGlzLmludGVydmFsSGFuZGxlID09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHNiSXRlbS5zZXRUZXh0KCdDb21tZW50IHNjYW5uZXIgT04nKVxuXHRcdFx0XHRcdHRoaXMuaW50ZXJ2YWxIYW5kbGUgPSB0aGlzLnNjYW5Tb3VyY2UuaW5pdCh0aGlzLmFwcCwgdGhpcywgbGV4ZXJfcGx1Z2luLnNjYW5fZm9yX2NvbW1lbnRzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzYkl0ZW0uc2V0VGV4dCgnQ29tbWVudCBzY2FubmVyIE9GRicpXG5cdFx0XHRcdFx0Y2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSGFuZGxlKTtcblx0XHRcdFx0XHR0aGlzLmludGVydmFsSGFuZGxlID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHQvLyBQZXJmb3JtIGFkZGl0aW9uYWwgdGhpbmdzIHdpdGggdGhlIHJpYmJvblxuXHRcdHJpYmJvbkljb25FbC5hZGRDbGFzcygnbXktcGx1Z2luLXJpYmJvbi1jbGFzcycpO1xuXG5cdFx0Ly8gVGhpcyBhZGRzIGEgc3RhdHVzIGJhciBpdGVtIHRvIHRoZSBib3R0b20gb2YgdGhlIGFwcC4gRG9lcyBub3Qgd29yayBvbiBtb2JpbGUgYXBwcy5cblx0XHRjb25zdCBzdGF0dXNCYXJJdGVtRWwgPSB0aGlzLmFkZFN0YXR1c0Jhckl0ZW0oKTtcblx0XHRzdGF0dXNCYXJJdGVtRWwuc2V0VGV4dCgnU3RhdHVzIEJhciBUZXh0Jyk7XG5cblx0XHQvLyBcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdzb3VyY2Utc2Nhbm5lci1zb2x1dGlvbi1maWxlcycsXG5cdFx0XHRuYW1lOiAnQ3JlYXRlIHNvbHV0aW9uIGZpbGVzJyxcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLnNldHRpbmdzLmRvY3VtZW50UGF0aCA9PSAnVU5LTk9XTicpIHtcblx0XHRcdFx0XHRjb25zdCBub3RpY2UgPSBuZXcgTm90aWNlKCdQbGVhc2UgY29uZmlndXJlIHNvbHV0aW9uIHNjYW5uZXIgcG9ydGlvbiBiZWZvcmUgdXNpbmcgaXQuJywgMC4wKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBkb2NGb2xkZXJzID0gdGhpcy51dGlscy5jcmVhdGVGb2xkZXJzKHRoaXMuc2V0dGluZ3MuZG9jdW1lbnRQYXRoKTtcblx0XHRcdFx0XHRjb25zdCBjcm9zc0N1dHRpbmdDb25jZXJucyA9IG5ldyBDcm9zc0N1dHRpbmdDb25jZXJucyh0aGlzLmFwcCwgZG9jRm9sZGVycyk7XG5cdFx0XHRcdFx0Y3Jvc3NDdXR0aW5nQ29uY2VybnMuZ2VuZXJhdGVDcm9zc0N1dHRpbmdDb25jZXJucygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdzb3VyY2Utc2Nhbm5lci1tYXJrZXItdGFibGUnLFxuXHRcdFx0bmFtZTogJ0NyZWF0ZSBtYXJrZXIgdGFibGUnLFxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHtcblx0XHRcdFx0Y29uc3QgZG9jRm9sZGVycyA9IHRoaXMudXRpbHMuY3JlYXRlRm9sZGVycyh0aGlzLnNldHRpbmdzLmRvY3VtZW50UGF0aCk7XG5cdFx0XHRcdGNvbnN0IG1hcmtlckdyb3VwTGlzdCA9IG5ldyBNYXJrZXJHcm91cExpc3QodGhpcy5hcHAsIGRvY0ZvbGRlcnMpO1xuXHRcdFx0XHRtYXJrZXJHcm91cExpc3QuZ2VuZXJhdGVNYWtlckdyb3VwTGlzdCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gVGhpcyBhZGRzIGFuIGVkaXRvciBjb21tYW5kIHRoYXQgY2FuIHBlcmZvcm0gc29tZSBvcGVyYXRpb24gb24gdGhlIGN1cnJlbnQgZWRpdG9yIGluc3RhbmNlXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnc2FtcGxlLWVkaXRvci1jb21tYW5kJyxcblx0XHRcdG5hbWU6ICdTYW1wbGUgZWRpdG9yIGNvbW1hbmQnLFxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSA9PiB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVkaXRvci5nZXRTZWxlY3Rpb24oKSk7XG5cdFx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKCdTYW1wbGUgRWRpdG9yIENvbW1hbmQnKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXG5cdFx0Ly8gVGhpcyBhZGRzIGEgY29tcGxleCBjb21tYW5kIHRoYXQgY2FuIGNoZWNrIHdoZXRoZXIgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGFwcCBhbGxvd3MgZXhlY3V0aW9uIG9mIHRoZSBjb21tYW5kXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnb3Blbi1zYW1wbGUtbW9kYWwtY29tcGxleCcsXG5cdFx0XHRuYW1lOiAnT3BlbiBzYW1wbGUgbW9kYWwgKGNvbXBsZXgpJyxcblx0XHRcdGNoZWNrQ2FsbGJhY2s6IChjaGVja2luZzogYm9vbGVhbikgPT4ge1xuXHRcdFx0XHQvLyBDb25kaXRpb25zIHRvIGNoZWNrXG5cdFx0XHRcdGNvbnN0IG1hcmtkb3duVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG5cdFx0XHRcdGlmIChtYXJrZG93blZpZXcpIHtcblx0XHRcdFx0XHQvLyBJZiBjaGVja2luZyBpcyB0cnVlLCB3ZSdyZSBzaW1wbHkgXCJjaGVja2luZ1wiIGlmIHRoZSBjb21tYW5kIGNhbiBiZSBydW4uXG5cdFx0XHRcdFx0Ly8gSWYgY2hlY2tpbmcgaXMgZmFsc2UsIHRoZW4gd2Ugd2FudCB0byBhY3R1YWxseSBwZXJmb3JtIHRoZSBvcGVyYXRpb24uXG5cdFx0XHRcdFx0aWYgKCFjaGVja2luZykge1xuXHRcdFx0XHRcdFx0bmV3IFNhbXBsZU1vZGFsKHRoaXMuYXBwKS5vcGVuKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gVGhpcyBjb21tYW5kIHdpbGwgb25seSBzaG93IHVwIGluIENvbW1hbmQgUGFsZXR0ZSB3aGVuIHRoZSBjaGVjayBmdW5jdGlvbiByZXR1cm5zIHRydWVcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gSWYgdGhlIHBsdWdpbiBob29rcyB1cCBhbnkgZ2xvYmFsIERPTSBldmVudHMgKG9uIHBhcnRzIG9mIHRoZSBhcHAgdGhhdCBkb2Vzbid0IGJlbG9uZyB0byB0aGlzIHBsdWdpbilcblx0XHQvLyBVc2luZyB0aGlzIGZ1bmN0aW9uIHdpbGwgYXV0b21hdGljYWxseSByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIHdoZW4gdGhpcyBwbHVnaW4gaXMgZGlzYWJsZWQuXG5cdFx0dGhpcy5yZWdpc3RlckRvbUV2ZW50KGRvY3VtZW50LCAnY2xpY2snLCAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnY2xpY2snLCBldnQpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gV2hlbiByZWdpc3RlcmluZyBpbnRlcnZhbHMsIHRoaXMgZnVuY3Rpb24gd2lsbCBhdXRvbWF0aWNhbGx5IGNsZWFyIHRoZSBpbnRlcnZhbCB3aGVuIHRoZSBwbHVnaW4gaXMgZGlzYWJsZWQuXG5cdFx0dGhpcy5yZWdpc3RlckludGVydmFsKHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiBjb25zb2xlLmxvZygnc2V0SW50ZXJ2YWwnKSwgNSAqIDYwICogMTAwMCkpO1xuXHRcdFxuXHRcdGF3YWl0IGxleGVyX3BsdWdpbi5kZWZhdWx0KFByb21pc2UucmVzb2x2ZShsZXhlcl93YXNtLmRlZmF1bHQpKTtcblxuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdFx0aWYgKHRoaXMuaW50ZXJ2YWxIYW5kbGUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxIYW5kbGUpO1xuXHRcdFx0dGhpcy5pbnRlcnZhbEhhbmRsZSA9IHVuZGVmaW5lZDtcblx0ICAgIH1cblx0fVxuXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcblx0XHR0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcblx0fVxuXG5cdGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuXHR9IFxufVxuXG5jbGFzcyBTYW1wbGVNb2RhbCBleHRlbmRzIE1vZGFsIHsgXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwKSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0fVxuXG5cdG9uT3BlbigpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuc2V0VGV4dCgnV29haCEnKTtcblx0fVxuXG5cdG9uQ2xvc2UoKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdH1cbn1cbmNsYXNzIEluZm9Nb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cHJpdmF0ZSByZXNvbHZlUHJvbWlzZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkO1xuXHRwcml2YXRlIHByb21pc2U6IFByb21pc2U8c3RyaW5nIHwgbnVsbD47XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0YXBwOiBBcHAsXG5cdFx0cHVibGljIHRpdGxlOiBzdHJpbmcsXG5cdFx0cHVibGljIG1lc3NhZ2U6IHN0cmluZyxcblx0KSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0XHQvLyBDcmVhdGUgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBtb2RhbCBjbG9zZXNcblx0XHR0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0dGhpcy5yZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG5cdFx0fSk7XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cblx0XHQvLyBBZGQgdGl0bGVcblx0XHRjb250ZW50RWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IHRoaXMudGl0bGUgfSk7XG5cblx0XHQvLyBBZGQgbWVzc2FnZVxuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiB0aGlzLm1lc3NhZ2UgfSk7XG5cblx0XHQvLyBBZGQgT0sgYnV0dG9uXG5cdFx0Y29uc3QgYnV0dG9uQ29udGFpbmVyID0gY29udGVudEVsLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IFwibW9kYWwtYnV0dG9uLWNvbnRhaW5lclwiLFxuXHRcdH0pO1xuXHRcdGNvbnN0IG9rQnV0dG9uID0gYnV0dG9uQ29udGFpbmVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJPS1wiIH0pO1xuXHRcdG9rQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBDbG9zZSBvbiBFbnRlciBrZXlcblx0XHR0aGlzLnNjb3BlLnJlZ2lzdGVyKFtdLCBcIkVudGVyXCIsICgpID0+IHtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIE1ldGhvZCB0byBhd2FpdCB0aGUgcmVzdWx0XG5cdGdldFJlc3VsdCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcblx0XHRyZXR1cm4gdGhpcy5wcm9taXNlO1xuXHR9XHRcblxufVxuXG5leHBvcnQgY2xhc3MgVmVyc2lvblNlbGVjdGlvbk1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICAgIHByaXZhdGUgc3RhdGljIGN1cnJlbnRNb2RhbDogVmVyc2lvblNlbGVjdGlvbk1vZGFsIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSByZXNvbHZlUHJvbWlzZTogKCh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVqZWN0UHJvbWlzZTogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzZWxlY3RlZFZlcnNpb246IHN0cmluZyA9ICd2ZXJzaW9uMSc7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKGFwcDogQXBwKSB7XG4gICAgICAgIHN1cGVyKGFwcCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHNlbGVjdFZlcnNpb24oYXBwOiBBcHApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICAvLyBDbG9zZSBhbnkgZXhpc3RpbmcgbW9kYWxcbiAgICAgICAgaWYgKFZlcnNpb25TZWxlY3Rpb25Nb2RhbC5jdXJyZW50TW9kYWwpIHtcbiAgICAgICAgICAgIFZlcnNpb25TZWxlY3Rpb25Nb2RhbC5jdXJyZW50TW9kYWwuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgbW9kYWwgPSBuZXcgVmVyc2lvblNlbGVjdGlvbk1vZGFsKGFwcCk7XG4gICAgICAgIFZlcnNpb25TZWxlY3Rpb25Nb2RhbC5jdXJyZW50TW9kYWwgPSBtb2RhbDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtb2RhbC5yZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gICAgICAgICAgICBtb2RhbC5yZWplY3RQcm9taXNlID0gcmVqZWN0O1xuICAgICAgICAgICAgbW9kYWwub3BlbigpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbk9wZW4oKSB7XG4gICAgICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXG4gICAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdTZWxlY3QgVmVyc2lvbicgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBDcmVhdGUgY29udGFpbmVyIGZvciByYWRpbyBidXR0b25zXG4gICAgICAgIGNvbnN0IHJhZGlvQ29udGFpbmVyID0gY29udGVudEVsLmNyZWF0ZURpdigpO1xuICAgICAgICByYWRpb0NvbnRhaW5lci5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnMjBweCc7XG4gICAgICAgIFxuICAgICAgICAvLyBWZXJzaW9uIDEgcmFkaW9cbiAgICAgICAgY29uc3QgdmVyc2lvbjFDb250YWluZXIgPSByYWRpb0NvbnRhaW5lci5jcmVhdGVEaXYoKTtcbiAgICAgICAgdmVyc2lvbjFDb250YWluZXIuc3R5bGUubWFyZ2luQm90dG9tID0gJzEwcHgnO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdmVyc2lvbjFSYWRpbyA9IHZlcnNpb24xQ29udGFpbmVyLmNyZWF0ZUVsKCdpbnB1dCcsIHtcbiAgICAgICAgICAgIHR5cGU6ICdyYWRpbycsXG4gICAgICAgICAgICB2YWx1ZTogJ3ZlcnNpb24xJyxcbiAgICAgICAgICAgIGF0dHI6IHsgaWQ6ICd2ZXJzaW9uMScgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmVyc2lvbjFDb250YWluZXIuY3JlYXRlRWwoJ2xhYmVsJywgeyB0ZXh0OiAnIFZlcnNpb24xJywgYXR0cjogeyBmb3I6ICd2ZXJzaW9uMScgfSB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFZlcnNpb24gMiByYWRpb1xuICAgICAgICBjb25zdCB2ZXJzaW9uMkNvbnRhaW5lciA9IHJhZGlvQ29udGFpbmVyLmNyZWF0ZURpdigpO1xuICAgICAgICB2ZXJzaW9uMkNvbnRhaW5lci5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnMTBweCc7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2ZXJzaW9uMlJhZGlvID0gdmVyc2lvbjJDb250YWluZXIuY3JlYXRlRWwoJ2lucHV0Jywge1xuICAgICAgICAgICAgdHlwZTogJ3JhZGlvJyxcbiAgICAgICAgICAgIHZhbHVlOiAndmVyc2lvbjInLFxuICAgICAgICAgICAgYXR0cjogeyBpZDogJ3ZlcnNpb24yJyB9XG4gICAgICAgIH0pO1xuICAgICAgICB2ZXJzaW9uMkNvbnRhaW5lci5jcmVhdGVFbCgnbGFiZWwnLCB7IHRleHQ6ICcgVmVyc2lvbjInLCBhdHRyOiB7IGZvcjogJ3ZlcnNpb24yJyB9IH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0IGRlZmF1bHQgc2VsZWN0aW9uXG4gICAgICAgIHZlcnNpb24xUmFkaW8uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgIHZlcnNpb24xUmFkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZlcnNpb24xUmFkaW8uY2hlY2tlZCkgdGhpcy5zZWxlY3RlZFZlcnNpb24gPSAndmVyc2lvbjEnO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHZlcnNpb24yUmFkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZlcnNpb24yUmFkaW8uY2hlY2tlZCkgdGhpcy5zZWxlY3RlZFZlcnNpb24gPSAndmVyc2lvbjInO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIEJ1dHRvbiBjb250YWluZXJcbiAgICAgICAgY29uc3QgYnV0dG9uQ29udGFpbmVyID0gY29udGVudEVsLmNyZWF0ZURpdigpO1xuICAgICAgICBidXR0b25Db250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICAgICAgYnV0dG9uQ29udGFpbmVyLnN0eWxlLmdhcCA9ICcxMHB4JztcbiAgICAgICAgYnV0dG9uQ29udGFpbmVyLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtZW5kJztcbiAgICAgICAgYnV0dG9uQ29udGFpbmVyLnN0eWxlLm1hcmdpblRvcCA9ICcyMHB4JztcbiAgICAgICAgXG4gICAgICAgIC8vIENhbmNlbCBidXR0b25cbiAgICAgICAgY29uc3QgY2FuY2VsQnRuID0gYnV0dG9uQ29udGFpbmVyLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdDYW5jZWwnIH0pO1xuICAgICAgICBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWplY3RQcm9taXNlKSB0aGlzLnJlamVjdFByb21pc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTdWJtaXQgYnV0dG9uXG4gICAgICAgIGNvbnN0IHN1Ym1pdEJ0biA9IGJ1dHRvbkNvbnRhaW5lci5jcmVhdGVFbCgnYnV0dG9uJywgeyBcbiAgICAgICAgICAgIHRleHQ6ICdTdWJtaXQnLFxuICAgICAgICAgICAgY2xzOiAnbW9kLWN0YSdcbiAgICAgICAgfSk7XG4gICAgICAgIHN1Ym1pdEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlc29sdmVQcm9taXNlKSB0aGlzLnJlc29sdmVQcm9taXNlKHRoaXMuc2VsZWN0ZWRWZXJzaW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25DbG9zZSgpIHtcbiAgICAgICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICAgICAgICBWZXJzaW9uU2VsZWN0aW9uTW9kYWwuY3VycmVudE1vZGFsID0gbnVsbDtcbiAgICB9XG59IiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IFNvdXJjZVNjYW5uZXIgZnJvbSBcIi4uL21haW5cIjtcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4vVXRpbHNcIjtcbmNvbnN0IGVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5yZW1vdGUgXG5jb25zdCBkaWFsb2cgPSBlbGVjdHJvbi5kaWFsb2dcblxuZXhwb3J0IGNsYXNzIFNjYW5uZXJTZXR0aW5nc1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuXHRwbHVnaW46IFNvdXJjZVNjYW5uZXI7XG4gICAgdmVyc2lvbjogU3RyaW5nO1xuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBTb3VyY2VTY2FubmVyLCB2ZXJzaW9uOiBTdHJpbmcpIHtcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb247XG5cdH1cblxuXHRkaXNwbGF5KCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnZlcnNpb24gPT0gXCJ2ZXJzaW9uMVwiKSB7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZVNjYW5uZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGV4dFNjYW5uZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNvdXJjZVNjYW5uZXIoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHtjb250YWluZXJFbH0gPSB0aGlzO1xuXG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy9idXMgTWFrZSBzdXJlIHRoYXQgdGhlIHNjYW5uZXIgaXMgc3dpdGNoZWQgb2ZmIGJlZm9yZSBhbGxvd2luZyBcbiAgICAgICAgLy9idXMgdXNlciB0byB1cGRhdGUgdGhlIHNldHRpbmdzLiBec2V0dGluZ3MtMDFcbiAgICAgICAgLy9cbiAgICAgICAgaWYgKHRoaXMucGx1Z2luLmludGVydmFsSGFuZGxlKSB7XG4gICAgICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgICAgICAuc2V0TmFtZShcIlNjYW5uZXIgaXMgcnVubmluZ1wiKVxuICAgICAgICAgICAgICAgIC5zZXREZXNjKFwiUGxlYXNlIHNodXRkb3duIHRoZSBzY2FubmVyIGJlZm9yZSB1cGRhdGluZyB0aGUgc2V0dGluZ3NcIik7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHZhciBhcHBQYXRoU2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKTtcblxuICAgICAgICAgICAgYXBwUGF0aFNldHRpbmdcbiAgICAgICAgICAgICAgICAuc2V0TmFtZShcIkFwcGxpY2F0aW9uIFBhdGhcIilcbiAgICAgICAgICAgICAgICAuc2V0RGVzYyhgQXBwbGljYXRpb24gd29ya3NwYWNlOiAke3RoaXMucGx1Z2luLnNldHRpbmdzLmFwcGxpY2F0aW9uUGF0aH1gKVxuICAgICAgICAgICAgICAgIC5hZGRCdXR0b24oYnV0dG9uID0+XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgLnNldEJ1dHRvblRleHQoXCJTRUxFQ1QgQVBQTElDQVRJT04gUEFUSFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uQ2xpY2soKGNiIDogTW91c2VFdmVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWxvZy5zaG93T3BlbkRpYWxvZyh7cHJvcGVydGllczogWydvcGVuRGlyZWN0b3J5J10gfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlc3VsdDogeyBjYW5jZWxlZDogYW55OyBmaWxlUGF0aHM6IHN0cmluZ1tdOyB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQuY2FuY2VsZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQuZmlsZVBhdGhzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBwbGljYXRpb25QYXRoID0gcmVzdWx0LmZpbGVQYXRoc1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcFBhdGhTZXR0aW5nLnNldERlc2MoYEFwcGxpY2F0aW9uIHdvcmtzcGFjZTogJHt0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcHBsaWNhdGlvblBhdGh9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICB2YXIgdGVzdFBhdGhTZXR0aW5nID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpO1xuXG4gICAgICAgICAgICB0ZXN0UGF0aFNldHRpbmdcbiAgICAgICAgICAgICAgICAuc2V0TmFtZShcIlRlc3QgUGF0aFwiKVxuICAgICAgICAgICAgICAgIC5zZXREZXNjKGBUZXN0IHdvcmtzcGFjZTogJHt0aGlzLnBsdWdpbi5zZXR0aW5ncy51bml0VGVzdFBhdGh9YClcbiAgICAgICAgICAgICAgICAuYWRkQnV0dG9uKGJ1dHRvbiA9PlxuICAgICAgICAgICAgICAgICAgICBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRCdXR0b25UZXh0KFwiU0VMRUNUIFVOSVQgVEVTVCBQQVRIXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAub25DbGljaygoY2IgOiBNb3VzZUV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlhbG9nLnNob3dPcGVuRGlhbG9nKHtwcm9wZXJ0aWVzOiBbJ29wZW5EaXJlY3RvcnknXSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihhc3luYyAocmVzdWx0OiB7IGNhbmNlbGVkOiBhbnk7IGZpbGVQYXRoczogc3RyaW5nW107IH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdC5jYW5jZWxlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdC5maWxlUGF0aHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy51bml0VGVzdFBhdGggPSByZXN1bHQuZmlsZVBhdGhzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdFBhdGhTZXR0aW5nLnNldERlc2MoYFRlc3Qgd29ya3NwYWNlOiAke3RoaXMucGx1Z2luLnNldHRpbmdzLnVuaXRUZXN0UGF0aH1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICBcblxuICAgICAgICAgICAgY29uc3QgZG9jdW1lbnRQYXRoID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAgICAgLnNldE5hbWUoXCJEb2N1bWVudGF0aW9uIFBhdGhcIilcbiAgICAgICAgICAgICAgICAuc2V0RGVzYyhcIlBhdGggdG8gZG9jdW1lbnQgd29ya3NwYWNlIHJlbGF0aXZlIGZyb20gdmF1bHRcIilcbiAgICAgICAgICAgICAgICAuYWRkVGV4dCh0ZXh0ID0+IHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHRoZSBkb2N1bWVudGF0aW9uIHBhdGhcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kb2N1bWVudFBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgdmFsdWUgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRvY3VtZW50UGF0aCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgYXBwbGljYXRpb25UeXBlID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAgICAgLnNldE5hbWUoXCJBcHBsaWNhdGlvbiB0eXBlXCIpXG4gICAgICAgICAgICAgICAgLnNldERlc2MoXCJUeXBlIG9mIGFwcGxpY2F0aW9uXCIpXG4gICAgICAgICAgICAgICAgLmFkZERyb3Bkb3duKGRyb3BEb3duID0+IFxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcERvd25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkT3B0aW9uKCcuamF2YScsICdqYXZhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkT3B0aW9uKCcucnMnLCAncnVzdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZE9wdGlvbignLmMnLCAnYycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZE9wdGlvbignLmMrKycsICdjKysnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRPcHRpb24oJy5jcHAnLCAnY3BwJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkT3B0aW9uKCcuY3h4JywgJ2N4eCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZE9wdGlvbignLnRzJywgJ3R5cGVzY3JpcHQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcHBsaWNhdGlvbkV4dGVuc2lvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9Plx0e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcHBsaWNhdGlvbkV4dGVuc2lvbiA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBhY3RpdmF0aW9uSW50ZXJ2YWwgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgICAgICAuc2V0TmFtZShcIkFjdGl2YXRpb24gaW50ZXJ2YWxcIilcbiAgICAgICAgICAgICAgICAuc2V0RGVzYyhcIkFjdGl2YXRpb24gaW50ZXJ2YWwgaW4gbXNcIilcbiAgICAgICAgICAgICAgICAuYWRkVGV4dCh0ZXh0ID0+IHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHRoZSBhY3RpdmF0aW9uIGludGVydmFsXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc2xlZXBMZW5ndGgudG9TdHJpbmcoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyB2YWx1ZSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2xlZXBMZW5ndGggPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgbnVtYmVyT2ZTcmNGaWxlcyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgICAgIC5zZXROYW1lKFwiTnVtYmVyIG9mIHNvdXJjZSBmaWxlcyB0byBwcm9jZXNzXCIpXG4gICAgICAgICAgICAgICAgLnNldERlc2MoXCJOdW1iZXIgb2Ygc291cmNlIGZpbGVzIHRvIHByb2Nlc3MgYXQgYSB0aW1lXCIpXG4gICAgICAgICAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciB0aGUgc291cmNlIGZpbGUgcHJvY2Vzc2luZyBjb3VudFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmdyb3VwQnlTaXplLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgdmFsdWUgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmdyb3VwQnlTaXplID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgdGV4dFNjYW5uZXIoKTogdm9pZCB7XG5cdFx0Y29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcblxuXHRcdGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cblx0XHRjb25zdCBmb2xkZXIgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiRm9sZGVyXCIpXG5cdFx0XHQuc2V0RGVzYyhcIkxvY2F0aW9uIG9mIHRleHQgZmlsZSB0byBzY2FuXCIpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHRcdFx0dGV4dFxuXHRcdFx0XHRcdC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHlvdXIgdGV4dCBmaWxlIHN0YXJ0IGZvbGRlclwiKVxuXHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5jb2RlU2Nhbm5lclNldHRpbmdzLmRpcilcblx0XHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5jb2RlU2Nhbm5lclNldHRpbmdzLmRpciA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHQpO1xuXHRcdGNvbnN0IHdvcmtpbmdGb2xkZXIgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiV29ya2luZyBmb2xkZXJcIilcblx0XHRcdC5zZXREZXNjKFwiTG9jYXRpb24gb2YgbWQgZmlsZXNcIilcblx0XHRcdC5hZGRUZXh0KCh0ZXh0KSA9PlxuXHRcdFx0XHR0ZXh0XG5cdFx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgeW91ciB3b3JraW5nIGZvbGRlciBuYW1lXCIpXG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLmNvZGVTY2FubmVyU2V0dGluZ3Mud29yaylcblx0XHRcdFx0XHQub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5jb2RlU2Nhbm5lclNldHRpbmdzLndvcmsgPSB2YWx1ZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdH0pLFxuXHRcdFx0KTtcblx0XHRjb25zdCBzdGFydExpbmUgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiU3RhcnRcIilcblx0XHRcdC5zZXREZXNjKFwiVGhlIHN0YXJ0IG9mIGxpbmUgdG8gZXh0cmFjdCB0byBtZCBmaWxlXCIpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHRcdFx0dGV4dFxuXHRcdFx0XHRcdC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHlvdXIgc3RhcnQgc3RyaW5nXCIpXG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLmNvZGVTY2FubmVyU2V0dGluZ3Muc3RhcnQpXG5cdFx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uY29kZVNjYW5uZXJTZXR0aW5ncy5zdGFydCA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHQpO1xuXHRcdGNvbnN0IGZvbGRlclN0cnVjdHVyZSA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoXCJGb2xkZXIgc3RydWN0dXJlXCIpXG5cdFx0XHQuc2V0RGVzYyhcIlRoZSBmb2xkZXIgc3RydWN0dXJlIGRlZmluaXRpb25cIilcblx0XHRcdC5hZGRUZXh0KCh0ZXh0KSA9PlxuXHRcdFx0XHR0ZXh0XG5cdFx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKFxuXHRcdFx0XHRcdFx0XCJFbnRlciB5b3VyIGRvdCBzZXBhcmF0ZWQgZm9sZGVyIHN0cnVjdHVyZSBkZWZpbml0aW9uXCIsXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5jb2RlU2Nhbm5lclNldHRpbmdzLnBhdGgpXG5cdFx0XHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uY29kZVNjYW5uZXJTZXR0aW5ncy5wYXRoID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR9KSxcblx0XHRcdCk7XG5cdFx0Y29uc3QgZXh0ZW5zaW9uID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZShcIkV4dGVuc2lvblwiKVxuXHRcdFx0LnNldERlc2MoXCJFeHRlbnNpb24gb2YgdGhlIHNvdXJjZSB0ZXh0IGZpbGVzIHRvIHNjYW5cIilcblx0XHRcdC5hZGRUZXh0KCh0ZXh0KSA9PlxuXHRcdFx0XHR0ZXh0XG5cdFx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgeW91ciB0ZXh0IGZpbGUgZXh0ZW5zaW9uXCIpXG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLmNvZGVTY2FubmVyU2V0dGluZ3MuZXh0ZW5zaW9uKVxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLmNvZGVTY2FubmVyU2V0dGluZ3MuZXh0ZW5zaW9uID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHR9KSxcblx0XHRcdCk7XG5cdFx0Y29uc3QgZGVzdGluYXRpb25FeHRlbnNpb24gPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKFwiRGVzdGluYXRpb24gZmlsZSBleHRlbnNpb25cIilcblx0XHRcdC5zZXREZXNjKFxuXHRcdFx0XHRcIkV4dGVuc2lvbiBvZiB0aGUgZGVzdGluYXRpb24gZmlsZXMgaW50byB3aGljaCBleHRyYWN0ZWQgdGV4dCBnb2VzXCIsXG5cdFx0XHQpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHRcdFx0dGV4dFxuXHRcdFx0XHRcdC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIHlvdXIgZGVzdGluYXRpb24gZmlsZSBleHRlbnNpb25cIilcblx0XHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uY29kZVNjYW5uZXJTZXR0aW5ncy5kZXN0RXh0ZW5zaW9uKVxuXHRcdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLmNvZGVTY2FubmVyU2V0dGluZ3MuZGVzdEV4dGVuc2lvbiA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHQpO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgU291cmNlU2Nhbm5lciBmcm9tICcuLi9tYWluJztcbmltcG9ydCB7IHN0YXRTeW5jLCByZWFkRmlsZVN5bmMsIGV4aXN0c1N5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcydcbmltcG9ydCB7IEZpbGVTeXN0ZW1BZGFwdGVyIH0gZnJvbSAnb2JzaWRpYW4nXG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJy4vVXRpbHMnXG5pbXBvcnQgeyBEb2NGb2xkZXJzIH0gZnJvbSAnLi9Eb2NGb2xkZXJzJztcblxuZXhwb3J0IGNsYXNzIFNjYW5Tb3VyY2Uge1xuXG4gICAgY29kZVNjYW5uZXI6IChhcmcwOiBzdHJpbmcpID0+IHN0cmluZztcblxuICAgIGFwcGxpY2F0aW9uUGF0aDogc3RyaW5nOyAgICAgICAgICAvLyBhcHBsaWNhdGlvbiBwYXRoXG4gICAgY29kZUV4dGVuc2lvbjogc3RyaW5nOyAgICAgICAgICAgIC8vIHRoZSBzb3VyY2UgZmlsZSBuYW1lIGV4dGVuc2lvblxuICAgIGRvY3VtZW50UGF0aDogc3RyaW5nOyAgICAgICAgICAgICAvLyBkb2N1bWVudCBwYXRoIGFicyBwYXRoXG4gICAgdGVzdFBhdGg6IHN0cmluZzsgICAgICAgICAgICAgICAgIC8vIHVuaXQgdGVzdCBjb2RlIHBhdGggXG4gICAgcmVsYXRpdmVEb2N1bWVudFBhdGg6IHN0cmluZzsgICAgIC8vIGRvY3VtZW50IHBhdGggYWJzIHJlbCBmcm9tIHZhdWx0IHJvb3RcbiAgICBncm91cEJ5U2l6ZTogbnVtYmVyOyAgICAgICAgICAgICAgLy8gbnVtYmVyIG9mIGRvY3VtZW50cyB0byBwcm9jZXNzIGF0IGEgdGltZSBcbiAgICBzbGVlcExlbmd0aDogbnVtYmVyOyAgICAgICAgICAgICAgLy8gbnVtYmVyIG9mIHNlY29uZHMgdG8gc2xlZXBcbiAgICBwaGFzZUNvdW50OiBudW1iZXIgPSAwOyAgICAgICAgICAgLy8gY3VycmVudCBwcm9jZXNzc2luZyBwaGFzZSBcblxuICAgIGFwcGxpY2F0aW9uRmlsZUxpc3RXaXRoRXh0ZW5zaW9uOiBBcnJheTxBcnJheTxzdHJpbmc+PjsgLy8gYWxsIGFwcGxpY2F0aW9uIHNvdXJjZSBmaWxlc1xuICAgIHRlc3RGaWxlTGlzdFdpdGhFeHRlbnNpb246IEFycmF5PEFycmF5PHN0cmluZz4+OyAgICAgICAgLy8gYWxsIHRlc3Qgc291cmNlIGZpbGVzXG4gICAgZG9jdW1lbnRGaWxlTGlzdFdpdGhFeHRlbnNpb246IEFycmF5PHN0cmluZz47ICAgICAgICAgICAvLyBhbGwgZG9jdW1lbnRzXG4gICAgc291cmNlQW5kRG9jdW1lbnRMaW5rID0gbmV3IFNldDxzdHJpbmc+O1xuXG4gICAgZnNhOiBGaWxlU3lzdGVtQWRhcHRlcjtcbiAgICB1dGlsczogVXRpbHM7XG5cbiAgICBkb2NGb2xkZXJzOiBEb2NGb2xkZXJzOyAgICAgICAgICAgIC8vIGRvY3VtZW50IGZvbGRlcnNcblxuICAgIGluaXQoYXBwOiBBcHAsIHBsdWdpbjogU291cmNlU2Nhbm5lciwgc2Nhbm5lcjogKGFyZzA6IHN0cmluZykgPT4gc3RyaW5nKSB7XG5cbiAgICAgICAgdGhpcy5jb2RlU2Nhbm5lciA9IHNjYW5uZXI7XG4gICAgICAgIHRoaXMuYXBwbGljYXRpb25QYXRoID0gcGx1Z2luLnNldHRpbmdzLmFwcGxpY2F0aW9uUGF0aDtcbiAgICAgICAgdGhpcy5jb2RlRXh0ZW5zaW9uID0gcGx1Z2luLnNldHRpbmdzLmFwcGxpY2F0aW9uRXh0ZW5zaW9uO1xuICAgICAgICB0aGlzLmRvY3VtZW50UGF0aCA9IHBsdWdpbi5zZXR0aW5ncy5kb2N1bWVudFBhdGg7XG4gICAgICAgIHRoaXMudGVzdFBhdGggPSBwbHVnaW4uc2V0dGluZ3MudW5pdFRlc3RQYXRoO1xuICAgICAgICB0aGlzLmdyb3VwQnlTaXplID0gcGx1Z2luLnNldHRpbmdzLmdyb3VwQnlTaXplO1xuICAgICAgICB0aGlzLnNsZWVwTGVuZ3RoID0gcGx1Z2luLnNldHRpbmdzLnNsZWVwTGVuZ3RoO1xuICAgICAgICB0aGlzLnV0aWxzID0gbmV3IFV0aWxzKGFwcCk7XG4gICAgICAgIHRoaXMuZnNhID0gYXBwLnZhdWx0LmFkYXB0ZXIgYXMgRmlsZVN5c3RlbUFkYXB0ZXI7XG5cbiAgICAgICAgcmV0dXJuIHNldEludGVydmFsKCgpID0+IHRoaXMucnVuKCksIHRoaXMuc2xlZXBMZW5ndGgpO1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gdGhlIGZvbGRlcnMgbWlnaHQgaGF2ZSBiZWVuIGRlbGV0ZWQgb3IgdGhpcyBpcyB0aGUgZmlyc3Qgc3RhcnQgb2YgdGhlIGFwcFxuICAgICAgICAvLyBzbyBjcmVhdGUgdGhlIGZvbGRlcnMgaWZmIHRoZXkgZG8gbm90IGV4aXN0XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZG9jRm9sZGVycyA9IHRoaXMudXRpbHMuY3JlYXRlRm9sZGVycyh0aGlzLmRvY3VtZW50UGF0aCk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIGRvIHdvcmsgaW4gcGhhc2VzXG4gICAgICAgIC8vIGdldCBhbGwgdGhlIGltcGxlbWVudGF0aW9uIGFuZCB0ZXN0IGZpbGVzIGludG8gYSBsaXN0IG9mIGNodW5rcyBhdCBtb3N0IGdyb3VwQnlTaXplXG4gICAgICAgIC8vXG4gICAgICAgIGlmICh0aGlzLnBoYXNlQ291bnQgPT0gMS4wKSB7XG4gICAgICAgICAgICBjb25zdCBpbXBGaWxlcyA9IHRoaXMudXRpbHMuZmlsdGVyRmlsZU5hbWVzQnlFeHRlbnNpb24oXG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlRXh0ZW5zaW9uLFxuICAgICAgICAgICAgICAgIHRoaXMudXRpbHMud2Fsa0luRm9sZGVyRnJvbURpcih0aGlzLmFwcGxpY2F0aW9uUGF0aCwgW10pKTtcblxuICAgICAgICAgICAgdGhpcy5hcHBsaWNhdGlvbkZpbGVMaXN0V2l0aEV4dGVuc2lvbiA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltcEZpbGVzLmxlbmd0aDsgaSArPSB0aGlzLmdyb3VwQnlTaXplKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBpbXBGaWxlcy5zbGljZShpLCBpICsgdGhpcy5ncm91cEJ5U2l6ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBsaWNhdGlvbkZpbGVMaXN0V2l0aEV4dGVuc2lvbi5wdXNoKGNodW5rKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdGVzdEZpbGVzID0gdGhpcy51dGlscy5maWx0ZXJGaWxlTmFtZXNCeUV4dGVuc2lvbihcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGVFeHRlbnNpb24sXG4gICAgICAgICAgICAgICAgdGhpcy51dGlscy53YWxrSW5Gb2xkZXJGcm9tRGlyKHRoaXMudGVzdFBhdGgsIFtdKSk7XG5cbiAgICAgICAgICAgIHRoaXMudGVzdEZpbGVMaXN0V2l0aEV4dGVuc2lvbiA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRlc3RGaWxlcy5sZW5ndGg7IGkgKz0gdGhpcy5ncm91cEJ5U2l6ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gdGVzdEZpbGVzLnNsaWNlKGksIGkgKyB0aGlzLmdyb3VwQnlTaXplKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRlc3RGaWxlTGlzdFdpdGhFeHRlbnNpb24ucHVzaChjaHVuayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gZ2V0IGxpc3Qgb2YgZG9jdW1lbnQgZmlsZXNcbiAgICAgICAgLy8gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5waGFzZUNvdW50ID09IDIuMCkge1xuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLnV0aWxzLmZpbHRlckZpbGVOYW1lc0J5RXh0ZW5zaW9uKFxuICAgICAgICAgICAgICAgICcubWQnLFxuICAgICAgICAgICAgICAgIHRoaXMudXRpbHMud2Fsa0luRm9sZGVyRnJvbURpcihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mc2EuZ2V0QmFzZVBhdGgoKSArIHRoaXMudXRpbHMuc2VwYXJhdG9yICsgdGhpcy5kb2NGb2xkZXJzLnNldHRpbmdzQ29tbWVudEZvbGRlciwgW11cbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRGaWxlTGlzdFdpdGhFeHRlbnNpb24gPSBmaWxlc1xuICAgICAgICAgICAgICAgIC5tYXAoZmlsZU5hbWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZU5hbWUucmVwbGFjZSh0aGlzLmZzYS5nZXRCYXNlUGF0aCgpICsgdGhpcy51dGlscy5zZXBhcmF0b3IsIFwiXCIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgdGhlIHNvdXJjZSBpZiB5b3VuZ2VyIHRoZW4gdGhlIGRvY3VtZW50IGZpbGUgT1IgZG9jdW1lbnQgZmlsZSBoYWQgdG8gYmUgY3JlYXRlZCB0aGVuXG4gICAgICAgIC8vICAgIGxvYWQgdGhlIGxpbmVzIGZyb20gdGhlIHNvdXJjZSBmaWxlIGFuZCBzY2FuIGZvciBjb21tZW50cy5cbiAgICAgICAgLy8gICAgd3JpdGUgY29tbWVudHMgb3V0IHRvIGRvY3VtZW50IGZpbGVcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBmaWxlcyBleGlzdCBiZWZvcmUgZ2V0dGluZyB0aGVpciBzdGF0IGluZm9ybWF0aW9uXG4gICAgICAgIC8vXG4gICAgICAgIGlmICh0aGlzLnBoYXNlQ291bnQgPT0gMy4wICYmIHRoaXMuYXBwbGljYXRpb25GaWxlTGlzdFdpdGhFeHRlbnNpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZmlsZXNUb0NoZWNrID0gdGhpcy5hcHBsaWNhdGlvbkZpbGVMaXN0V2l0aEV4dGVuc2lvbi5wb3AoKTtcbiAgICAgICAgICAgIGlmIChmaWxlc1RvQ2hlY2sgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZmlsZXNUb0NoZWNrLmZvckVhY2goc3JjRmlsZSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jdW1lbnROYW1lID0gdGhpcy5jcmVhdGVEb2NOYW1lRnJvbVNvdXJjZU5hbWUoc3JjRmlsZSwgdGhpcy5hcHBsaWNhdGlvblBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkb2N1bWVudE5hbWVBbmRQYXRoID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3RoaXMuZG9jdW1lbnRQYXRofSR7dGhpcy51dGlscy5zZXBhcmF0b3J9Y29tbWVudHMke3RoaXMudXRpbHMuc2VwYXJhdG9yfSR7ZG9jdW1lbnROYW1lfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvY0Z1bGxQYXRobmFtZSA9IGAke3RoaXMuZnNhLmdldEJhc2VQYXRoKCl9JHt0aGlzLnV0aWxzLnNlcGFyYXRvcn0ke2RvY3VtZW50TmFtZUFuZFBhdGh9YDtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZUFuZERvY3VtZW50TGluay5hZGQoZG9jdW1lbnROYW1lQW5kUGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb0FjdHVhbFNjYW5uaW5nKGRvY3VtZW50TmFtZUFuZFBhdGgsIHNyY0ZpbGUsIGRvY0Z1bGxQYXRobmFtZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB0aGlzLnBoYXNlQ291bnQgPSAyLjA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5waGFzZUNvdW50ID09IDQuMCAmJiB0aGlzLnRlc3RGaWxlTGlzdFdpdGhFeHRlbnNpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZmlsZXNUb0NoZWNrID0gdGhpcy50ZXN0RmlsZUxpc3RXaXRoRXh0ZW5zaW9uLnBvcCgpO1xuICAgICAgICAgICAgaWYgKGZpbGVzVG9DaGVjayAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBmaWxlc1RvQ2hlY2suZm9yRWFjaChzcmNGaWxlID0+IHtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXN0RG9jdW1lbnROYW1lID0gdGhpcy5jcmVhdGVEb2NOYW1lRnJvbVNvdXJjZU5hbWUoc3JjRmlsZSwgdGhpcy50ZXN0UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlc3REb2N1bWVudE5hbWVBbmRQYXRoID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3RoaXMuZG9jdW1lbnRQYXRofSR7dGhpcy51dGlscy5zZXBhcmF0b3J9dGVzdCBjb21tZW50cyR7dGhpcy51dGlscy5zZXBhcmF0b3J9JHt0ZXN0RG9jdW1lbnROYW1lfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvY0Z1bGxQYXRobmFtZSA9IGAke3RoaXMuZnNhLmdldEJhc2VQYXRoKCl9JHt0aGlzLnV0aWxzLnNlcGFyYXRvcn0ke3Rlc3REb2N1bWVudE5hbWVBbmRQYXRofWA7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb0FjdHVhbFNjYW5uaW5nKHRlc3REb2N1bWVudE5hbWVBbmRQYXRoLCBzcmNGaWxlLCBkb2NGdWxsUGF0aG5hbWUpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgdGhpcy5waGFzZUNvdW50ID0gNC4wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGhhc2VDb3VudCA9PSA1LjApIHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBldmVyeSBtZCBkb2N1bWVudCB0aGF0IGRvZXMgbm90IGhhdmUgYSBzb3VyY2UgZmlsZSBtdXN0IGJlIHJlbW92ZWRcbiAgICAgICAgICAgIC8vIHRoZSBzb3VyY2UgYW5kIGRvY3VtZW50IGxpbmsgaXMgdGhlIHNvdXJjZSBmaWxlIHRoYXQgc2hvdWxkIGJlIGluIHRoZSBcbiAgICAgICAgICAgIC8vIGRvY3VtZW50IGZpbGUgbGlzdC4gXG4gICAgICAgICAgICAvLyAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudEZpbGVMaXN0V2l0aEV4dGVuc2lvbi5mb3JFYWNoKGZpbGVOYW1lID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc291cmNlQW5kRG9jdW1lbnRMaW5rLmhhcyhmaWxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51dGlscy5mc2EucmVtb3ZlKGZpbGVOYW1lKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHRoaXMuc291cmNlQW5kRG9jdW1lbnRMaW5rLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLnBoYXNlQ291bnQgPSAtMS4wO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5waGFzZUNvdW50ICs9IDE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gdGhlIGZpbGUgc3lzdGVtIGZ1bGwgZG9jIG5hbWUgYW5kIHBhdGggc2NhbiB0aGUgc291cmNlIGZpbGUgYW5kIHBsYWNlIGRvY3VtZW50IFxuICAgICAqIGluIHRoZSBkb2N1bWVudCBuYW1lIGFuZCBwYXRoIGxvY2F0aW9uXG4gICAgICogQHBhcmFtIGRvY3VtZW50TmFtZUFuZFBhdGggdmF1bHQgcGF0aCBvZiB0aGUgbWQgZG9jdW1lbnRcbiAgICAgKiBAcGFyYW0gc3JjRmlsZSB0byBzY2FuIHNvdXJjZSBmaWxlIHRvIHNjYW5cbiAgICAgKiBAcGFyYW0gZG9jRnVsbFBhdGhuYW1lIGZpbGEgZG9jdW1lbnQgbmFtZSBhbmQgcGF0aCBmcm9tIHRoZSByb290IG9mIHRoZSBmaWxlIHN5c3RlbVxuICAgICAqL1xuICAgIHByaXZhdGUgZG9BY3R1YWxTY2FubmluZyhkb2N1bWVudE5hbWVBbmRQYXRoOiBzdHJpbmcsIHNyY0ZpbGU6IHN0cmluZywgZG9jRnVsbFBhdGhuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zb3VyY2VBbmREb2N1bWVudExpbmsuYWRkKGRvY3VtZW50TmFtZUFuZFBhdGgpO1xuXG4gICAgICAgIGNvbnN0IHNyY0ZpbGVFeGlzdHMgPSBleGlzdHNTeW5jKHNyY0ZpbGUpO1xuICAgICAgICBpZiAoIXNyY0ZpbGVFeGlzdHMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnVGVzdCBzb3VyY2UgZmlsZSBnb25lICcgKyBzcmNGaWxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHNyY1N0YXQgPSBzdGF0U3luYyhzcmNGaWxlKTtcblxuICAgICAgICAgICAgdmFyIGNyZWF0ZWRGaWxlID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBkb2NGaWxlRXhpc3RzID0gZXhpc3RzU3luYyhkb2NGdWxsUGF0aG5hbWUpO1xuICAgICAgICAgICAgdmFyIGRvY1N0YXQ6IGFueTtcbiAgICAgICAgICAgIHZhciBjcmVhdGVkRmlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRvY0ZpbGVFeGlzdHMpIHtcbiAgICAgICAgICAgICAgICBkb2NTdGF0ID0gc3RhdFN5bmMoZG9jRnVsbFBhdGhuYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhkb2NGdWxsUGF0aG5hbWUsIFwiXCIpO1xuICAgICAgICAgICAgICAgIGNyZWF0ZWRGaWxlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvY1N0YXQgPSBzdGF0U3luYyhkb2NGdWxsUGF0aG5hbWUpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIHNvdXJjZSBpcyBvbGRlciB0aGFuIHRoZSBkb2MgYXMgc2VlbiBmcm9tIDE5NzAgLT4gb253YXJkcyBPUlxuICAgICAgICAgICAgLy8gZG9jcyBoYXZlIGp1c3QgYmVlbiBjcmVhdGVkLlxuICAgICAgICAgICAgLy8gXG4gICAgICAgICAgICBpZiAoY3JlYXRlZEZpbGUgfHwgZG9jU3RhdC5tdGltZU1zIDwgc3JjU3RhdC5tdGltZU1zKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3JjTGluZXMgPSByZWFkRmlsZVN5bmMoc3JjRmlsZSwgeyBlbmNvZGluZzogJ3V0ZjgnLCBmbGFnOiAncicgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGFsbENvbW1lbnRzO1xuICAgICAgICAgICAgICAgIHZhciBjb21tZW50cyA9IFwiTk9ORVwiO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnRzID0gdGhpcy5jb2RlU2Nhbm5lcihzcmNMaW5lcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21tZW50cyAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbENvbW1lbnRzID0gY29tbWVudHMucmVwbGFjZUFsbCgvXFxuXFxzK1xcKi9nLCBcIlxcblwiKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgaW4gc2NhbiBmb3IgZmlsZSBcIiArIHNyY0ZpbGUpOyBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyQ29tbWVudCA9IGBbU291cmNlXShmaWxlOi8vJHtzcmNGaWxlfSlcXG5cXG4tLS1cXG5gO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZzYS53cml0ZShkb2N1bWVudE5hbWVBbmRQYXRoLCBoZWFkZXJDb21tZW50ICsgY29tbWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYWxsQ29tbWVudHMgPT0gXCJ1bnBhaXJlZCBzdXJyb2dhdGVzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBpbiBzY2FuIGZvciBmaWxlIFwiICsgc3JjRmlsZSk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJDb21tZW50ID0gYFtTb3VyY2VdKGZpbGU6Ly8ke3NyY0ZpbGV9KVxcblxcbi0tLVxcbmA7XG4gICAgICAgICAgICAgICAgdGhpcy5mc2Eud3JpdGUoZG9jdW1lbnROYW1lQW5kUGF0aCwgaGVhZGVyQ29tbWVudCArIGFsbENvbW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGRvY3VtZW50IGZpbGUgbmFtZSB1c2luZyB0aGUgc291cmNlIGZpbGUgbmFtZVxuICAgICAqIEBwYXJhbSBzb3VyY2VGaWxlIHRvIGNyZWF0ZSBhIGRvY3VtZW50IGZpbGUgZnJvbVxuICAgICAqIEByZXR1cm5zIHRoZSBkb2N1bWVudCBmaWxlXG4gICAgICovXG4gICAgY3JlYXRlRG9jTmFtZUZyb21Tb3VyY2VOYW1lKHNvdXJjZUZpbGU6IHN0cmluZywgYXBwbGljYXRpb25QYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgLy8gZ2V0IG9ubHkgdGhlIG5hbWUgb2YgdGhlIGZpbGVcbiAgICAgICAgdmFyIGZpbGVOYW1lID0gc291cmNlRmlsZVxuICAgICAgICAgICAgLnJlcGxhY2UoYXBwbGljYXRpb25QYXRoICsgdGhpcy51dGlscy5zZXBhcmF0b3IsICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UodGhpcy5jb2RlRXh0ZW5zaW9uLCAnLm1kJyk7XG4gICAgICAgIC8vIHJlcGxhY2UgYWxsIGFjY3VyZW5jZXNcbiAgICAgICAgd2hpbGUgKGZpbGVOYW1lLmNvbnRhaW5zKHRoaXMudXRpbHMuc2VwYXJhdG9yKSkge1xuICAgICAgICAgICAgZmlsZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKHRoaXMudXRpbHMuc2VwYXJhdG9yLCAnLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlTmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjcmVhdGUgYSBwYXRoIHRvIHRoZSBzb3VyY2UgZmlsZSByZWxhdGl2ZSB0byB0aGUgdmF1bHRcbiAgICAgKiBAcGFyYW0gc291cmNlRmlsZSB0aGUgc291cmNlIGNvZGUgZmlsZVxuICAgICAqIEBwYXJhbSBkb2N1bWVudFBhcnQgdGhlIGRvY3VtZW50IGZpbGVcbiAgICAgKiBAcmV0dXJucyB0aGUgcGF0aCB0byB0aGUgc291cmNlIHJlbGF0aXZlIHRvIHRoZSB2YXVsdFxuICAgICAqL1xuICAgIGNyZWF0ZVJlbGF0aXZlUGF0aChzb3VyY2VGaWxlOiBzdHJpbmcsIGRvY3VtZW50UGFydDogc3RyaW5nKSB7XG4gICAgICAgIHZhciBzb3VyY2VGaWxlUGFydHMgPSBzb3VyY2VGaWxlLnNwbGl0KHRoaXMudXRpbHMuc2VwYXJhdG9yKTtcbiAgICAgICAgdmFyIGRvY3VtZW50QW5kUGF0aFBhcnRzID0gYCR7dGhpcy51dGlscy5mc2EuZ2V0QmFzZVBhdGgoKX0vJHtkb2N1bWVudFBhcnR9YC5zcGxpdCgnLycpO1xuXG4gICAgICAgIHdoaWxlIChzb3VyY2VGaWxlUGFydHNbMF0gPT0gZG9jdW1lbnRBbmRQYXRoUGFydHNbMF0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbGVQYXJ0cyA9IHNvdXJjZUZpbGVQYXJ0cy5zbGljZSgxKTtcbiAgICAgICAgICAgIGRvY3VtZW50QW5kUGF0aFBhcnRzID0gZG9jdW1lbnRBbmRQYXRoUGFydHMuc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZ28gdXAgZnJvbSBjdXJyZW50IGZvbGRlciBkb2N1bWVudEFuZFBhdGhQYXJ0cyBsZW5ndGggLSAxXG4gICAgICAgIHJldHVybiBkb2N1bWVudEFuZFBhdGhQYXJ0cy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICF2YWx1ZS5lbmRzV2l0aCgnLm1kJylcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5tYXAodmFsdWUgPT4gJy4uJylcbiAgICAgICAgICAgIC5jb25jYXQoc291cmNlRmlsZVBhcnRzKS5qb2luKCcvJyk7XG5cblxuICAgIH1cbn0iLCAiaW1wb3J0IHsgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgc3RhdFN5bmMsIHJlYWRkaXJTeW5jLCBta2RpclN5bmMgfSBmcm9tICdmcydcbmltcG9ydCB7IEZpbGVTeXN0ZW1BZGFwdGVyIH0gZnJvbSAnb2JzaWRpYW4nXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpLnJlbW90ZVxuaW1wb3J0IHsgRG9jRm9sZGVycyB9IGZyb20gJy4vRG9jRm9sZGVycyc7XG5cbmV4cG9ydCBjbGFzcyBVdGlscyB7XG4gICAgYXBwOiBBcHA7XG4gICAgLy9cbiAgICAvLyBmaWxlIHN5c3RlbSBwYXRoIHNlcGFyYXRvclxuICAgIC8vXG4gICAgcHVibGljIHNlcGFyYXRvciA9ICcvJztcbiAgICAvL1xuICAgIC8vIG9ic2lkaWFuIGZpbGUgc3lzdGVtIGFkYXB0b3JcbiAgICAvL1xuICAgIGZzYSA6IEZpbGVTeXN0ZW1BZGFwdGVyO1xuICAgIC8vXG4gICAgLy8gcmVnZXhwIGZvciBmaW5kaW5nIG1hcmtlcnMgYW5kIGZpbGUgcGF0aCBleHByZXNzaW9uc1xuICAgIC8vIGVnIDogXkpJUkExMjM0LTEyMy10ZXN0LTAwMS1ibGEwMC04Ny16enowMC0wOFxuICAgIC8vICAgICAgIC0tLS0tLS0tLS0tLSBzdG9yeSBtYXJrZXIgIFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBmaWxlIGZvbGRlciBhbmQgY29tbWVudCBtYXJrZXJzXG4gICAgLy9cbiAgICBtYXJrZXJSZWdFeHAgPSAvXFxzXFxeW2EtekEtWl0rW2EtekEtWjAtOV0rXFwtWzAtOV0rKFxcLVthLXpBLVpdK1thLXpBLVowLTldK1xcLVswLTldKykqL2c7XG5cbiAgICBjb25zdHJ1Y3RvcihhcHAgOiBBcHApIHsgXG4gICAgICAgIHRoaXMuYXBwID0gYXBwO1xuICAgICAgICB0aGlzLmZzYSA9IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIgYXMgRmlsZVN5c3RlbUFkYXB0ZXI7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICAqIG1ha2Ugc3VyZSB0aGUgc2VwYXJhdG9yIHJlZ2V4IGRvZXMgbm90IGhhdmUgc2luZ2xlICdcXCdcbiAgICAgKi9cbiAgICB0b1ZhdWx0VHlwZVNlcGVyYXRvcigpIHsgaWYgKHRoaXMuc2VwYXJhdG9yID09ICdcXFxcJykge3JldHVybiAnLyd9IGVsc2Uge3JldHVybiAnLyd9fVxuXG4gICAgLyoqXG4gICAgICogUmVjdXJzaXZlIHdhbGsgdGhlIGZvbGRlciBpbiBhIG5vbiB2YXVsdCBsb2NhdGlvbi4gR2V0IGFsbCBmaWxlIG5hbWVzIGZyb21cbiAgICAgKiBkaXIgYW5kIGRvd253YXJkc1xuICAgICAqIEBwYXJhbSBkaXIgdG8gc2NhbiBmcm9tXG4gICAgICogQHBhcmFtIGZpbGVzIGxpc3Qgd2l0aCBmb2xkZXIgbmFtZXNcbiAgICAgKiBAcmV0dXJucyBmaWxlIEFycmF5XG4gICAgICovXG4gICAgd2Fsa0luRm9sZGVyRnJvbURpcihkaXIgOiBzdHJpbmcsIGZpbGVzIDogQXJyYXk8c3RyaW5nPikge1xuICAgICAgICBjb25zdCBmaWxlTGlzdCA9IHJlYWRkaXJTeW5jKGRpcilcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVMaXN0KSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IGAke2Rpcn0ke3RoaXMuc2VwYXJhdG9yfSR7ZmlsZX1gXG4gICAgICAgICAgICBpZiAoc3RhdFN5bmMobmFtZSkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMud2Fsa0luRm9sZGVyRnJvbURpcihuYW1lLCBmaWxlcylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChuYW1lKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlc1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbHRlciBmaWxlcyBieSBleHRlbnNpb24gdmFsdWVcbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9uIHRvIGZpbHRlciBieVxuICAgICAqIEBwYXJhbSBmaWxlcyB0byBmaWx0ZXIgYnkgXG4gICAgICogQHJldHVybnMgZmlsdGVyZWQgZmlsZSBuYW1lc1xuICAgICAqL1xuICAgIGZpbHRlckZpbGVOYW1lc0J5RXh0ZW5zaW9uKGV4dGVuc2lvbiA6IHN0cmluZywgZmlsZXMgOiBBcnJheTxzdHJpbmc+KSA6IEFycmF5PHN0cmluZz4ge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5PHN0cmluZz4oKTtcbiAgICAgICAgcmVzdWx0ID0gZmlsZXMuZmlsdGVyKGZpbGVOYW1lID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmaWxlTmFtZS5lbmRzV2l0aChleHRlbnNpb24pO1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGdldCBhbGwgdGhlIC5tZCBmaWxlcyBmcm9tIHRoZSBmb2xkZXIgcmVjdXJzaXZseVxuICAgICAqIEBwYXJhbSBmb2xkZXIgdG8gZ2V0IHRoZSBtZCBmaWxlIGZyb21cbiAgICAgKiBAcmV0dXJucyBsaXN0IG9mIG1kIGZpbGVzIGluIHRoZSBmb2xkZXJcbiAgICAgKi9cbiAgICBsaXN0TURGaWxlc0luVmF1bHQoZm9sZGVyIDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGNvbW1lbnRCYXNlUGF0aCA9IGAke3RoaXMuZnNhLmdldEJhc2VQYXRoKCl9JHt0aGlzLnNlcGFyYXRvcn0ke2ZvbGRlcn1gXG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlckZpbGVOYW1lc0J5RXh0ZW5zaW9uKFxuICAgICAgICAgICAgJy5tZCcsXG4gICAgICAgICAgICB0aGlzLndhbGtJbkZvbGRlckZyb21EaXIoY29tbWVudEJhc2VQYXRoLCBbXSkpXG4gICAgICAgICAgICAubWFwKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSB2YWx1ZS5yZXBsYWNlKGAke3RoaXMuZnNhLmdldEJhc2VQYXRoKCl9YCwgJycpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChmaWxlTmFtZS5jb250YWlucyhgXFxcXGApKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gZmlsZU5hbWUucmVwbGFjZShgJHt0aGlzLnNlcGFyYXRvcn1gLCcvJyk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsZU5hbWU7XG4gICAgICAgICAgICB9KTsgICAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIG1ha2VEaXJJblZhdWx0XG4gICAgICogTWFrZSBhIGZvbGRlciBwYXRoIGluIHRoZSB2YXVsdC4gRHJvcCB0aGUgZmlsZSBuYW1lICwga2VlcCB0aGUgcGF0aCBhbmQgY3JlYXRlIGl0LlxuICAgICAqIEBwYXJhbSBmc2FcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhBbmROYW1lXG4gICAgICovXG4gICAgbWFrZURpckluVmF1bHQoZmlsZVBhdGhBbmROYW1lIDogc3RyaW5nKSB7XG4gICAgICAgIHZhciBmaWxlUGF0aCA9IGZpbGVQYXRoQW5kTmFtZS5zcGxpdCh0aGlzLnRvVmF1bHRUeXBlU2VwZXJhdG9yKCkpO1xuICAgICAgICAvL1xuICAgICAgICAvLyBkcm9wIGZpbGUgbmFtZSBmcm9tIHBhdGggYW5kIG5hbWUgYW5kIHN0YXJ0IGZyb20gdGhlIHJvb3Qgb2YgdGhlIHZhdWx0XG4gICAgICAgIC8vXG4gICAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGguc2xpY2UoMCwgZmlsZVBhdGgubGVuZ3RoIC0gMSkuc2xpY2UoMSk7XG4gICAgICAgIGZpbGVQYXRoWzBdID0gYC8ke2ZpbGVQYXRoWzBdfWA7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIGNvbnN0cnVjdCBwYXRoIHN0ZXAgYnkgc3RlcCBcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGNvbnN0cnVjdGVkUGF0aCA6IHN0cmluZ1tdID0gW107XG4gICAgICAgIHdoaWxlIChmaWxlUGF0aC5sZW5ndGggPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RlZFBhdGgucHVzaCggZmlsZVBhdGhbMF0gKTtcbiAgICAgICAgICAgIHRoaXMuZnNhLm1rZGlyKGNvbnN0cnVjdGVkUGF0aC5qb2luKCcvJykpO1xuICAgICAgICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIG9yZGVyIHNldCBhbmQgcmV0dXJuIG9yZGVyZWQgc2V0XG4gICAgICogQHBhcmFtIHNldCB0byBvcmRlclxuICAgICAqL1xuICAgIHNvcnRTZXRPZlN0cmluZyhzZXQgOiBTZXQ8c3RyaW5nPikgOiBTZXQ8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHNvcnRlZEFycmF5ID0gQXJyYXkuZnJvbShzZXQpLnNvcnQoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTZXQ8c3RyaW5nPihzb3J0ZWRBcnJheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiAjIyBjcmVhdGVGb2xkZXJzXG4gICAgKiBDcmVhdGUgZm9sZGVyIGJlbG93IGRvY3VtZW50IHBhdGhcbiAgICAqXG4gICAgKiBAcGFyYW0gZG9jUGF0aCB0aGF0IHdhcyBzZXQgYnkgdXNlclxuICAgICogQHJldHVybiB0aGUgRG9jRm9sZGVyIGluc3RhbmNlXG4gICAgKi9cbiAgICBjcmVhdGVGb2xkZXJzKGRvY1BhdGggOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NCYXNlMSA9IGAke3RoaXMuZnNhLmdldEJhc2VQYXRoKCl9JHt0aGlzLnNlcGFyYXRvcn0ke2RvY1BhdGh9JHt0aGlzLnNlcGFyYXRvcn1gXG4gICAgICAgIGNvbnN0IHNldHRpbmdzU3RvcnlGb2xkZXIxID0gc2V0dGluZ3NCYXNlMSArICdzdG9yaWVzJztcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NTb2x1dGlvbkZvbGRlcjEgPSBzZXR0aW5nc0Jhc2UxICsgJ3NvbHV0aW9ucyc7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzTWFya2VyTWFwcGluZzEgPSBzZXR0aW5nc0Jhc2UxICsgJ21hcmtlcic7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzQ29tbWVudHNNYXBwaW5nMSA9IHNldHRpbmdzQmFzZTEgKyAnY29tbWVudHMnO1xuICAgICAgICBjb25zdCBzZXR0aW5nc1Rlc3RDb21tZW50c01hcHBpbmcxID0gc2V0dGluZ3NCYXNlMSArICd0ZXN0IGNvbW1lbnRzJyAgICAgICAgXG4gICAgICAgIGNvbnN0IHNldHRpbmdzVW5pdFRlc3RNYXBwaW5nMSA9IHNldHRpbmdzQmFzZTEgKyAndW5pdCB0ZXN0cycgICAgICAgIFxuICAgICAgICAvL1xuICAgICAgICAvLyBjcmVhdGUgZm9sZGVycyBpbiB2YXVsdFxuICAgICAgICAvL1xuICAgICAgICBta2RpclN5bmMoc2V0dGluZ3NTdG9yeUZvbGRlcjEsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBta2RpclN5bmMoc2V0dGluZ3NTb2x1dGlvbkZvbGRlcjEsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBta2RpclN5bmMoc2V0dGluZ3NNYXJrZXJNYXBwaW5nMSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIG1rZGlyU3luYyhzZXR0aW5nc0NvbW1lbnRzTWFwcGluZzEsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBta2RpclN5bmMoc2V0dGluZ3NUZXN0Q29tbWVudHNNYXBwaW5nMSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIG1rZGlyU3luYyhzZXR0aW5nc1VuaXRUZXN0TWFwcGluZzEsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIFxuICAgICAgICBjb25zdCBzZXR0aW5nc0Jhc2UgPSBgJHtkb2NQYXRofSR7dGhpcy5zZXBhcmF0b3J9YDtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NTdG9yeUZvbGRlciA9IHNldHRpbmdzQmFzZSArICdzdG9yaWVzJztcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NTb2x1dGlvbkZvbGRlciA9IHNldHRpbmdzQmFzZSArICdzb2x1dGlvbnMnO1xuICAgICAgICBjb25zdCBzZXR0aW5nc01hcmtlck1hcHBpbmcgPSBzZXR0aW5nc0Jhc2UgKyAnbWFya2VyJztcbiAgICAgICAgY29uc3Qgc2V0dGluZ3NDb21tZW50c01hcHBpbmcgPSBzZXR0aW5nc0Jhc2UgKyAnY29tbWVudHMnO1xuICAgICAgICBjb25zdCBzZXR0aW5nc1Rlc3RDb21tZW50c01hcHBpbmcgPSBzZXR0aW5nc0Jhc2UgKyAndGVzdCBjb21tZW50cyc7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzVW5pdFRlc3RNYXBwaW5nID0gc2V0dGluZ3NCYXNlICsgJ3VuaXQgdGVzdHMnO1xuXG4gICAgICAgIHJldHVybiBuZXcgRG9jRm9sZGVycyhcbiAgICAgICAgICAgIHNldHRpbmdzU3RvcnlGb2xkZXIsIFxuICAgICAgICAgICAgc2V0dGluZ3NTb2x1dGlvbkZvbGRlcixcbiAgICAgICAgICAgIHNldHRpbmdzTWFya2VyTWFwcGluZyxcbiAgICAgICAgICAgIHNldHRpbmdzQ29tbWVudHNNYXBwaW5nLFxuICAgICAgICAgICAgc2V0dGluZ3NUZXN0Q29tbWVudHNNYXBwaW5nLFxuICAgICAgICAgICAgc2V0dGluZ3NVbml0VGVzdE1hcHBpbmdcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG59IiwgImV4cG9ydCBjbGFzcyBEb2NGb2xkZXJzIHtcbiAgICBzZXR0aW5nc1N0b3J5Rm9sZGVyOiBzdHJpbmc7XG4gICAgc2V0dGluZ3NTb2x1dGlvbkZvbGRlcjogc3RyaW5nO1xuICAgIHNldHRpbmdzTWFya2VyRm9sZGVyOiBzdHJpbmc7XG4gICAgc2V0dGluZ3NDb21tZW50Rm9sZGVyOiBzdHJpbmc7XG4gICAgc2V0dGluZ3NUZXN0Q29tbWVudEZvbGRlcjogc3RyaW5nO1xuICAgIHNldHRpbmdzVW5pdFRlc3RGb2xkZXI6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHN0b3J5Rm9sZGVyOiBzdHJpbmcsIHNvbHV0aW9uRm9sZGVyOiBzdHJpbmcsIG1hcmtlck1hcHBpbmc6IHN0cmluZywgY29tbWVudE1hcHBpbmc6IHN0cmluZywgdGVzdENvbW1lbnRNYXBwaW5nOiBzdHJpbmcsXG4gICAgICAgIHNldHRpbmdzVW5pdFRlc3RNYXBwaW5nOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5nc1N0b3J5Rm9sZGVyID0gc3RvcnlGb2xkZXI7XG4gICAgICAgIHRoaXMuc2V0dGluZ3NTb2x1dGlvbkZvbGRlciA9IHNvbHV0aW9uRm9sZGVyO1xuICAgICAgICB0aGlzLnNldHRpbmdzTWFya2VyRm9sZGVyID0gbWFya2VyTWFwcGluZ1xuICAgICAgICB0aGlzLnNldHRpbmdzQ29tbWVudEZvbGRlciA9IGNvbW1lbnRNYXBwaW5nO1xuICAgICAgICB0aGlzLnNldHRpbmdzVGVzdENvbW1lbnRGb2xkZXIgPSB0ZXN0Q29tbWVudE1hcHBpbmc7XG4gICAgICAgIHRoaXMuc2V0dGluZ3NVbml0VGVzdEZvbGRlciA9IHNldHRpbmdzVW5pdFRlc3RNYXBwaW5nO1xuICAgIH1cbn0iLCAiaW1wb3J0IHsgQXBwLCBGaWxlU3lzdGVtQWRhcHRlciB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnLi9VdGlscydcbmltcG9ydCB7IERvY0ZvbGRlcnMgfSBmcm9tICcuL0RvY0ZvbGRlcnMnO1xuaW1wb3J0IHsgc3RhdFN5bmMsIHJlYWRkaXJTeW5jLCBta2RpclN5bmMgfSBmcm9tICdmcydcblxuZXhwb3J0IGNsYXNzIENyb3NzQ3V0dGluZ0NvbmNlcm5zIHtcbiAgICBwcml2YXRlIGZzYTogRmlsZVN5c3RlbUFkYXB0ZXI7XG4gICAgcHJpdmF0ZSBkb2NGb2xkZXJzOiBEb2NGb2xkZXJzO1xuICAgIHByaXZhdGUgdXRpbHM6IFV0aWxzO1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGRvY0ZvbGRlcnM6IERvY0ZvbGRlcnMpIHtcbiAgICAgICAgdGhpcy51dGlscyA9IG5ldyBVdGlscyhhcHApO1xuICAgICAgICB0aGlzLmZzYSA9IHRoaXMudXRpbHMuZnNhO1xuICAgICAgICB0aGlzLmRvY0ZvbGRlcnMgPSBkb2NGb2xkZXJzO1xuICAgIH1cblxuICAgIGdlbmVyYXRlQ3Jvc3NDdXR0aW5nQ29uY2VybnMoKSB7XG4gICAgICAgIGNvbnN0IGRvY3VtZW50VG9NYXJrZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+O1xuICAgICAgICBjb25zdCB0ZXN0RG9jdW1lbnRUb01hcmtlck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj47XG4gICAgICAgIGNvbnN0IHN0b3J5VG9NYXJrZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+O1xuICAgICAgICBjb25zdCB0ZXN0U3RvcnlUb01hcmtlck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj47XG4gICAgICAgIGNvbnN0IG1hcmtlclRvU3RvcnlNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgICAgICBjb25zdCBtYXJrZXJUb1Rlc3RTdG9yeU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IG1hcmtlclRvRG9jdW1lbnRNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgICAgICBjb25zdCBtYXJrZXJUb1Rlc3REb2N1bWVudE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICAgIC8vIGdldCBhbGwgdGhlIHNvbHV0aW9ucyBmaWxlcyB0byBkZWxldGVcbiAgICAgICAgLy9cbiAgICAgICAgY29uc3QgcHJvbWlzZTogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBuZXcgQXJyYXk8UHJvbWlzZTx2b2lkPj4oKTtcbiAgICAgICAgY29uc3Qgc29sdXRpb25GaWxlVG9EZWxldGUgPSB0aGlzLnV0aWxzLmxpc3RNREZpbGVzSW5WYXVsdCh0aGlzLmRvY0ZvbGRlcnMuc2V0dGluZ3NTb2x1dGlvbkZvbGRlcik7XG4gICAgICAgIHNvbHV0aW9uRmlsZVRvRGVsZXRlLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgICBwcm9taXNlLnB1c2godGhpcy5mc2EucmVtb3ZlKGZpbGUpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHdhaXQgZm9yIGFsbCBwcm9taXNlcyB0byBjb21wbGV0ZVxuICAgICAgICAvL1xuICAgICAgICBQcm9taXNlLmFsbFNldHRsZWQocHJvbWlzZSlcbiAgICAgICAgICAgIC50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIGNsZWFudXAgdGFyZ2V0IGZvbGRlcnMsIGJ5IHRoZSB0aW1lIHRoZSBmb2xkZXJzIGFyZSBnb3R0ZW4gXG4gICAgICAgICAgICAgICAgLy8gaW4gbmV4dCBsaW5lcyB0aGlzIGNsZWFudXAgaXMgZG9uZVxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgdGhpcy5mc2Eucm1kaXIodGhpcy5kb2NGb2xkZXJzLnNldHRpbmdzU29sdXRpb25Gb2xkZXIsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZnNhLm1rZGlyKHRoaXMuZG9jRm9sZGVycy5zZXR0aW5nc1NvbHV0aW9uRm9sZGVyKTtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIGdldCBsaXN0IG9mIG1kIGZpbGVzIGluIHRoZSBjb21tZW50IGFuZCB0ZXN0IGZvbGRlciBvZiB0aGUgZG9jdW1lbnRzXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCBjb21tZW50TURGaWxlcyA9IHRoaXMudXRpbHMubGlzdE1ERmlsZXNJblZhdWx0KHRoaXMuZG9jRm9sZGVycy5zZXR0aW5nc0NvbW1lbnRGb2xkZXIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRlc3RDb21tZW50TURGaWxlcyA9IHRoaXMudXRpbHMubGlzdE1ERmlsZXNJblZhdWx0KHRoaXMuZG9jRm9sZGVycy5zZXR0aW5nc1Rlc3RDb21tZW50Rm9sZGVyKTtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIGdldCBsaXN0IG9mIG1kIGZpbGVzIGluIHRoZSBzdG9yeSBmb2xkZXJcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0b3J5TURGaWxlcyA9IHRoaXMudXRpbHMubGlzdE1ERmlsZXNJblZhdWx0KHRoaXMuZG9jRm9sZGVycy5zZXR0aW5nc1N0b3J5Rm9sZGVyKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXN0U3RvcnlNREZpbGVzID0gdGhpcy51dGlscy5saXN0TURGaWxlc0luVmF1bHQodGhpcy5kb2NGb2xkZXJzLnNldHRpbmdzVW5pdFRlc3RGb2xkZXIpO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gcGljayB1cCBhbGwgbWFya2VycyBpbiB0aGUgZG9jIHN0cmluZyBkb2MgZmlsZSBieSBkb2MgZmlsZSBhbmQgYWdncmVnYXRlIHRoZSBtYXJrZXJzXG4gICAgICAgICAgICAgICAgLy8gYmVmb3JlIHByb2Nlc3NpbmcgdGhlbVxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgY29uc3QgYWxsUHJvbWlzZXMgPSBuZXcgQXJyYXk8UHJvbWlzZTx2b2lkPj4oKTtcbiAgICAgICAgICAgICAgICBjb21tZW50TURGaWxlcy5mb3JFYWNoKGNvbW1lbnRGaWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWxsUHJvbWlzZXMucHVzaCh0aGlzLmZzYS5yZWFkKGNvbW1lbnRGaWxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXJTZXQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdldCBhbGwgdGhlIG1hcmtlcnMgaW4gdGhlIHZhbHVlIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWFya2Vyc01hdGNoID0gdmFsdWUubWF0Y2hBbGwodGhpcy51dGlscy5tYXJrZXJSZWdFeHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LmZyb20obWFya2Vyc01hdGNoKS5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldC5hZGQobWFya2VyWzBdLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQgPSB0aGlzLnV0aWxzLnNvcnRTZXRPZlN0cmluZyhtYXJrZXJTZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50TmFtZSA9IGNvbW1lbnRGaWxlLnNwbGl0KCcvJykubGFzdCgpIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJUb0RvY3VtZW50TWFwLnNldChtYXJrZXIudHJpbSgpLCBkb2N1bWVudE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudE5hbWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50VG9NYXJrZXJNYXAuc2V0KGRvY3VtZW50TmFtZSwgbWFya2VyU2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgdGVzdENvbW1lbnRNREZpbGVzLmZvckVhY2goY29tbWVudEZpbGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhbGxQcm9taXNlcy5wdXNoKHRoaXMuZnNhLnJlYWQoY29tbWVudEZpbGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlclNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGFsbCB0aGUgbWFya2VycyBpbiB0aGUgdmFsdWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXJrZXJzTWF0Y2ggPSB2YWx1ZS5tYXRjaEFsbCh0aGlzLnV0aWxzLm1hcmtlclJlZ0V4cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbShtYXJrZXJzTWF0Y2gpLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0LmFkZChtYXJrZXJbMF0udHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldCA9IHRoaXMudXRpbHMuc29ydFNldE9mU3RyaW5nKG1hcmtlclNldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jdW1lbnROYW1lID0gY29tbWVudEZpbGUuc3BsaXQoJy8nKS5sYXN0KCkgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldC5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclRvVGVzdERvY3VtZW50TWFwLnNldChtYXJrZXIudHJpbSgpLCBkb2N1bWVudE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudE5hbWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3REb2N1bWVudFRvTWFya2VyTWFwLnNldChkb2N1bWVudE5hbWUsIG1hcmtlclNldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHN0b3J5TURGaWxlcy5mb3JFYWNoKHN0b3J5RmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFByb21pc2VzLnB1c2godGhpcy5mc2EucmVhZChzdG9yeUZpbGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlclNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGFsbCB0aGUgbWFya2VycyBpbiB0aGUgdmFsdWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXJrZXJzTWF0Y2ggPSB2YWx1ZS5tYXRjaEFsbCh0aGlzLnV0aWxzLm1hcmtlclJlZ0V4cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbShtYXJrZXJzTWF0Y2gpLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0LmFkZChtYXJrZXJbMF0udHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldCA9IHRoaXMudXRpbHMuc29ydFNldE9mU3RyaW5nKG1hcmtlclNldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jdW1lbnROYW1lID0gc3RvcnlGaWxlLnNwbGl0KCcvJykubGFzdCgpIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJUb1N0b3J5TWFwLnNldChtYXJrZXIudHJpbSgpLCBzdG9yeUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudE5hbWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3J5VG9NYXJrZXJNYXAuc2V0KGRvY3VtZW50TmFtZSwgbWFya2VyU2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgdGVzdFN0b3J5TURGaWxlcy5mb3JFYWNoKHN0b3J5RmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFByb21pc2VzLnB1c2godGhpcy5mc2EucmVhZChzdG9yeUZpbGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlclNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGFsbCB0aGUgbWFya2VycyBpbiB0aGUgdmFsdWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXJrZXJzTWF0Y2ggPSB2YWx1ZS5tYXRjaEFsbCh0aGlzLnV0aWxzLm1hcmtlclJlZ0V4cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbShtYXJrZXJzTWF0Y2gpLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0LmFkZChtYXJrZXJbMF0udHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldCA9IHRoaXMudXRpbHMuc29ydFNldE9mU3RyaW5nKG1hcmtlclNldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jdW1lbnROYW1lID0gc3RvcnlGaWxlLnNwbGl0KCcvJykubGFzdCgpIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJUb1Rlc3RTdG9yeU1hcC5zZXQodGhpcy5kcm9wUmlnaHRBbmRNa1N0cmluZyhtYXJrZXIudHJpbSgpLnNwbGl0KFwiLVwiKSwgNCwgXCItXCIpLCBzdG9yeUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudE5hbWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RTdG9yeVRvTWFya2VyTWFwLnNldChkb2N1bWVudE5hbWUsIG1hcmtlclNldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIFByb21pc2UuYWxsU2V0dGxlZChhbGxQcm9taXNlcylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbGxlY3QgYWxsIG1hcmtlcnMgaW4gb25lIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvcnQgdGhlbSB0aGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBncm91cCBieSBwYXRoL25hbWUubWQgZXhjbHVkaW5nIHRoZSBzZXEgbnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXN0T2ZNYXJrZXJzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVuaXRUZXN0TWFya2Vyczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbShkb2N1bWVudFRvTWFya2VyTWFwLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHNldE9mTWFya2VycyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWxMaXN0T2ZNYXJrZXJzOiBzdHJpbmdbXSA9IEFycmF5LmZyb20oc2V0T2ZNYXJrZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdE9mTWFya2VycyA9IGxpc3RPZk1hcmtlcnMuY29uY2F0KGxvYWxMaXN0T2ZNYXJrZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LmZyb20odGVzdERvY3VtZW50VG9NYXJrZXJNYXAudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goc2V0T2ZNYXJrZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hbExpc3RPZk1hcmtlcnM6IHN0cmluZ1tdID0gQXJyYXkuZnJvbShzZXRPZk1hcmtlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0VGVzdE1hcmtlcnMgPSB1bml0VGVzdE1hcmtlcnMuY29uY2F0KGxvYWxMaXN0T2ZNYXJrZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RPZk1hcmtlcnMuc29ydCgoYSwgYikgPT4gYS5sb2NhbGVDb21wYXJlKGIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdFRlc3RNYXJrZXJzLnNvcnQoKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbGxNYXJrZXJzID0gdGhpcy5ncm91cGVkTWFwKGxpc3RPZk1hcmtlcnMsIGkgPT4gdGhpcy5zb2x1dGlvbkRvY05hbWVGcm9tTWFya2VyKGkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbGxVbml0VGVzdE1hcmtlcnMgPSB0aGlzLmdyb3VwZWRVbml0VGVzdE1hcCh1bml0VGVzdE1hcmtlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbShhbGxNYXJrZXJzKS5mb3JFYWNoKChbc29sTmFtZSwgbWFya2Vyc10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWRTdHJpbmcgPSBgIyAke3RoaXMuZHJvcFJpZ2h0QW5kTWtTdHJpbmcoc29sTmFtZS5zcGxpdChcIi9cIiksIDEsIFwiIFwiKS50b1VwcGVyQ2FzZSgpfVxcbmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBidWlsZCBsaW5rIHRvIHN0b3J5LCBmaWx0ZXIgdGhlIHN0b3J5IG1hcmtlcnMgYXMgd2VsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlclRvU3Rvcnk6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKG1hcmtlclRvU3RvcnlNYXAuZW50cmllcygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoW2tleV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGxpdE1hcmtlciA9IGtleS5zcGxpdChcIi1cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hcmtlcnNbMF0uc3RhcnRzV2l0aCh0aGlzLmRyb3BSaWdodEFuZE1rU3RyaW5nKHNwbGl0TWFya2VyLCAxLCAnLScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0dXAgZGllIHN0b3J5IGxpbmtzIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyAnIyMgRnVuY3Rpb25hbCBSZXF1aXJlbWVudFxcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyVG9TdG9yeS5mb3JFYWNoKChzdG9yeSwgbWFya2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXJrZXJUb1N0b3J5TWFwLmdldChtYXJrZXIpICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArIGAhW1ske21hcmtlclRvU3RvcnlNYXAuZ2V0KG1hcmtlcil9IyR7bWFya2VyLnRyaW0oKX1dXVxcbmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZU1ha2VycyA9IEFycmF5LmZyb20obmV3IFNldChtYXJrZXJzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcXVlTWFrZXJzLmZvckVhY2goKG1hcmtlciwgc3RvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArICcjIyBJbXBsaW1lbnRhdGlvbiBTb2x1dGlvblxcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXJrZXJUb0RvY3VtZW50TWFwLmdldChtYXJrZXIpICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jdW1lbnQgPSBtYXJrZXJUb0RvY3VtZW50TWFwLmdldChtYXJrZXIpITtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyBgIVtbJHtkb2N1bWVudH0jJHttYXJrZXIudHJpbSgpfV1dXFxuYDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1bml0IHRlc3RzIGZvciB0aGUgZG9jdW1lbnQgZXhpcyB0aGVuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcmludCBvdXQgdGhlc2UgdW5pdCB0ZXN0cyAtIHRoZXJlIGJlIGRyYWdvbnMgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGxVbml0VGVzdE1hcmtlcnMuZ2V0KG1hcmtlcikgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWRTdHJpbmcgPSBtZFN0cmluZyArICcjIyMgVW5pdCBUZXN0IEltcGxlbWVudGF0aW9uXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxVbml0VGVzdE1hcmtlcnMuZ2V0KG1hcmtlcikhLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNUZXN0TWFya2VyKG1hcmtlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyBgIVtbJHttYXJrZXJUb1Rlc3REb2N1bWVudE1hcC5nZXQobWFya2VyKX0jJHttYXJrZXIudHJpbSgpfV1dXFxuYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgZm9sZGVyIHBhdGggaWYgcmVxdWlyZWQgYW5kIHdyaXRlIG91dCB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnV0aWxzLm1ha2VEaXJJblZhdWx0KHNvbE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnNhLndyaXRlKHNvbE5hbWUsIG1kU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdmFsdWVzIGRyb3AgdGhlIHJpZ2h0bW9zdCBudGggc3RyaW5nIGFuZCBqb2luIHVzaW5nIHRoZSBkZWxpbWl0ZXJcbiAgICAgKiBAcGFyYW0gbiBzdHJpbmcgdG8gZHJvcCBvbiB0aGUgcmlnaHRcbiAgICAgKiBAcGFyYW0gZGVsaW1pdGVyIHVzZWQgdG8gam9pbiBcbiAgICAgKiBAcmV0dXJucyByZXN1bHRpbmcgc3RyaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSBkcm9wUmlnaHRBbmRNa1N0cmluZyh2YWx1ZXM6IHN0cmluZ1tdLCBuOiBudW1iZXIsIGRlbGltaXRlcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlcy5zbGljZSgwLCB2YWx1ZXMubGVuZ3RoIC0gKG4pKS5qb2luKGRlbGltaXRlcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHZhbHVlcyBkcm9wIHRoZSBsZWZ0bW9zdCBudGggc3RyaW5nIGFuIHJldHVybiB0aGUgcmVzdWx0XG4gICAgICogQHBhcmFtIG4gc3RyaW5nIHRvIGRyb3Agb24gdGhlIHJpZ2h0XG4gICAgICogQHBhcmFtIGRlbGltaXRlciB1c2VkIHRvIGpvaW4gXG4gICAgICogQHJldHVybnMgcmVzdWx0aW5nIHN0cmluZ1xuICAgICAqL1xuICAgIHByaXZhdGUgZHJvcExlZnRBbmRNa1N0cmluZyh2YWx1ZXM6IHN0cmluZ1tdLCBuOiBudW1iZXIsIGRlbGltaXRlcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlcy5zbGljZShuLCB2YWx1ZXMubGVuZ3RoIC0gKG4pKS5qb2luKGRlbGltaXRlcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc3BsaXQgc29sTmFtZSBpbiBncm91cHMgb2YgMiBqb2luZWQgYnkgL1xuICAgICAqIEBwYXJhbSBzb2xOYW1lIHNvbHV0aW9uIG5hbWVcbiAgICAgKiBAcGFyYW0gbWFwcGluZyBtYXJrZXJTZXRcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFNvbHV0aW9uRmlsZU5hbWUoc29sTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWVQYXJ0cyA9IHNvbE5hbWUuc3BsaXQoXCItXCIpXG4gICAgICAgIHZhciBmaWxlTmFtZTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZmlsZU5hbWVQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgJSAyID09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PSBmaWxlTmFtZVBhcnRzLmxlbmd0aCAtIDIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUucHVzaChmaWxlTmFtZVBhcnRzW2ldKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5wdXNoKGZpbGVOYW1lUGFydHNbaV0gKyBcIi1cIiArIGZpbGVOYW1lUGFydHNbaSArIDFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGAvJHtmaWxlTmFtZS5qb2luKFwiL1wiKX1gXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGFrZSBhIG1hcmtlciBzdHJpbmcgYW5kIGNvbnZlcnQgaW50byBmaWxlIHBhdGggLyBmaWxlIG5hbWUubWQuIG9mIHRoZSBtYXJrZXIgXG4gICAgICogZXhjbHVkaW5nIHRoZSAtWzAtOV0rIGF0IHRoZSBlbmQsIGlzIGluIG1hcHBpbmcgdGhlbiB1c2UgdGhhdCBtYXBwaW5nIHZhbHVlLlxuICAgICAqIG1hcmtlcnMgaGF2ZSB0aGUgZm9sbGxvd2luZyBmb3JtYXQgOlxuICAgICAqIFxuICAgICAqIDEuIF5KSVJBMTIzNC0wMDEgPFxuICAgICAqIDIuIF5KSVJBMTIzNC0wMDEtc29sdXRpb24tMDAxXG4gICAgICogMy4gXkpJUkExMjM0LTAwMS1zb2x1dGlvbi0wMDEtdGVzdC0wMDFcbiAgICAgKiBcbiAgICAgKiAxIG1hcmtlciBjb252ZXJ0ZWQgdG8gZmlsZW5hbWVcbiAgICAgKiAyIG1hcmtlciBjb252ZXJ0ZWQgdG8gcGF0aCArIGZpbGVuYW1lXG4gICAgICogMyBtYXJrZXIgY29udmVydGVkIHRvIHBhdGggKyBmaWxlbmFubWUgd2hlcmUgLSBpZGVudGljYWwgdG8gMi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbWFya2VyIGluIGRvY3VtZW50IHN0cmluZ1xuICAgICAqIEByZXR1cm4gdGhlIG5hbWUgb2YgdGhlIHBhdGggYW5kIGZpbGUgbmFtZS5tZFxuICAgICAqL1xuICAgIHByaXZhdGUgc29sdXRpb25Eb2NOYW1lRnJvbU1hcmtlcihtYXJrZXI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGRvY05hbWUgPSB0aGlzLmdldFNvbHV0aW9uRmlsZU5hbWUobWFya2VyLnJlcGxhY2UoXCJeXCIsIFwiXCIpKTtcbiAgICAgICAgY29uc3Qgc29sdXRpb25OYW1lID0gYCR7ZG9jTmFtZX0ubWRgO1xuICAgICAgICByZXR1cm4gYC8ke3RoaXMuZG9jRm9sZGVycy5zZXR0aW5nc1NvbHV0aW9uRm9sZGVyfSR7c29sdXRpb25OYW1lfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR3JvdXAgYnkgdGhlIGxpc3QgYWNjb3JkaW5nIHRvIGEgZ2V0S2V5IGZ1bmN0aW9uLiBJdCB3aWxsIGJlIG9uZSBrZXkgXG4gICAgICogdG8gbWFueSBwb3RlbnRpYWwgdmFsdWVzXG4gICAgICogQHBhcmFtIGxpc3Qgb2YgZWxlbWVudHMgdG8gZ3JvdXAgYnlcbiAgICAgKiBAcGFyYW0gZ2V0S2V5IGdyb3VwIGJ5IGtleVxuICAgICAqIEByZXR1cm5zIHRoZSBncm91cGVkIGxpc3RcbiAgICAgKi9cbiAgICBwcml2YXRlIGdyb3VwZWRNYXAoYXJyYXk6IHN0cmluZ1tdLCBnZXRLZXk6IChpOiBzdHJpbmcpID0+IHN0cmluZyk6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPiB7XG4gICAgICAgIHJldHVybiBhcnJheS5yZWR1Y2UoKG1hcCwgY3VycmVudFZhbHVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBnZXRLZXkoY3VycmVudFZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKCFtYXAuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGtleSwgW10pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWFwLmdldChrZXkpICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG1hcD8uZ2V0KGtleSk/LnB1c2goY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSwgbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHcm91cCBieSB0aGUgbGlzdCBhY2NvcmRpbmcgdG8gYSBnZXRLZXkgZnVuY3Rpb24uIEl0IHdpbGwgYmUgb25lIGtleSBcbiAgICAgKiB0byBtYW55IHBvdGVudGlhbCB2YWx1ZXNcbiAgICAgKiBAcGFyYW0gbGlzdCBvZiBlbGVtZW50cyB0byBncm91cCBieSwgVGhlIGxpc3QgaW4gdGhpcyBjYXNlIHdpbGwgY29udGFpbiBzdHJpbmcgZm9ybWF0dGVkXG4gICAgICogYXMgSklSQTEyMzQtMDAxLXNvbHV0aW9uLTAwMS10ZXN0LTAwMS4gXG4gICAgICogQHBhcmFtIGdldEtleSBncm91cCBieSBrZXlcbiAgICAgKiBAcmV0dXJucyB0aGUgZ3JvdXBlZCBsaXN0LiBUaGUgTWFwPHNvbE5hbWUsIE1hcDxEb2N1bWVudCBNYXJrZXIgbWFya2VyIGxpbmssIExpc3Q8c3RyaW5nPihVbml0IHRlc3QgbGlua3MpPiA+XG4gICAgICovXG4gICAgcHJpdmF0ZSBncm91cGVkVW5pdFRlc3RNYXAoYXJyYXk6IHN0cmluZ1tdKTogTWFwPHN0cmluZywgc3RyaW5nW10+IHtcbiAgICAgICAgcmV0dXJuIGFycmF5LnJlZHVjZSgobWFwLCBjdXJyZW50VmFsdWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGN1cnJlbnRWYWx1ZS5zcGxpdChcIi1cIik7XG4gICAgICAgICAgICBjb25zdCBrZXlWYWx1ZSA9IHRoaXMuZHJvcFJpZ2h0QW5kTWtTdHJpbmcoa2V5LCAyLCBcIi1cIik7XG5cbiAgICAgICAgICAgIGlmICghbWFwLmhhcyhrZXlWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGtleVZhbHVlLCBbXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtYXAuZ2V0KGtleVZhbHVlKSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBtYXA/LmdldChrZXlWYWx1ZSk/LnB1c2goY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSwgbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpcyB0aGlzIGEgdGVzdCBtYXJrZXJcbiAgICAgKiBAcGFyYW0gbWFya2VyIHRvIGNoZWNrIGlzIGl0IGhhcyBsZWd0aCA2XG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1Rlc3RNYXJrZXIobWFya2VyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIG1hcmtlci5zcGxpdChcIi1cIikubGVuZ3RoID09IDhcbiAgICB9XG5cbn1cbiIsICJpbXBvcnQgeyBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJy4vVXRpbHMnXG5pbXBvcnQgeyBEb2NGb2xkZXJzIH0gZnJvbSAnLi9Eb2NGb2xkZXJzJztcblxuZXhwb3J0IGNsYXNzIE1hcmtlckdyb3VwTGlzdCB7XG5cbiAgICBtYXJrZXJGaWxlV2l0aFBhdGggOiBzdHJpbmc7XG4gICAgdXRpbHMgOiBVdGlscztcbiAgICBkb2NGb2xkZXJzIDogRG9jRm9sZGVycztcblxuICAgIGNvbnN0cnVjdG9yKGFwcCA6IEFwcCwgZG9jRm9sZGVycyA6IERvY0ZvbGRlcnMpIHtcbiAgICAgICAgdGhpcy5tYXJrZXJGaWxlV2l0aFBhdGggPSBgJHtkb2NGb2xkZXJzLnNldHRpbmdzTWFya2VyRm9sZGVyfS9tYXJrZXItdGFibGUubWRgXG4gICAgICAgIHRoaXMudXRpbHMgPSBuZXcgVXRpbHMoYXBwKTtcbiAgICAgICAgdGhpcy5kb2NGb2xkZXJzID0gZG9jRm9sZGVycztcbiAgICB9XG5cbiAgICBnZW5lcmF0ZU1ha2VyR3JvdXBMaXN0KCkge1xuICAgICAgICAvL1xuICAgICAgICAvLyBzb21lIGNvbnRhaW5lcnMgdG8gdXNlIGxhdGVyIG9uXG4gICAgICAgIC8vXG4gICAgICAgIGNvbnN0IG1hcmtlclRvRG9jdW1lbnRNYXAgPSBuZXcgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+KCk7XG4gICAgICAgIGNvbnN0IG1hcmtlclRvVGVzdERvY3VtZW50TWFwID0gbmV3IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PigpO1xuICAgICAgICAvL1xuICAgICAgICAvLyBnZXQgYWxsIHRoZSBkb2MgZmlsZXMgdG8gc2NhblxuICAgICAgICAvL1xuICAgICAgICBjb25zdCBjb21tZW50RmlsZXMgPSB0aGlzLnV0aWxzLmxpc3RNREZpbGVzSW5WYXVsdCh0aGlzLmRvY0ZvbGRlcnMuc2V0dGluZ3NDb21tZW50Rm9sZGVyKTtcbiAgICAgICAgY29uc3QgdGVzdENvbW1lbnRGaWxlcyA9IHRoaXMudXRpbHMubGlzdE1ERmlsZXNJblZhdWx0KHRoaXMuZG9jRm9sZGVycy5zZXR0aW5nc1Rlc3RDb21tZW50Rm9sZGVyKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gcGljayB1cCBhbGwgbWFya2VycyBpbiB0aGUgZG9jIHN0cmluZyBkb2MgZmlsZSBieSBkb2MgZmlsZSBhbmQgYWdncmVnYXRlIHRoZSBtYXJrZXJzXG4gICAgICAgIC8vIGJlZm9yZSBwcm9jZXNzaW5nIHRoZW1cbiAgICAgICAgLy9cbiAgICAgICAgY29uc3QgcHJvbWlzZTogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBuZXcgQXJyYXk8UHJvbWlzZTx2b2lkPj4oKTtcbiAgICAgICAgY29tbWVudEZpbGVzLmZvckVhY2goY29tbWVudEZpbGUgPT4ge1xuICAgICAgICAgICAgcHJvbWlzZS5wdXNoKHRoaXMudXRpbHMuZnNhLnJlYWQoY29tbWVudEZpbGUpXG4gICAgICAgICAgICAgICAgLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlclNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdldCBhbGwgdGhlIG1hcmtlcnMgaW4gdGhlIHZhbHVlIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hcmtlcnNNYXRjaCA9IHZhbHVlLm1hdGNoQWxsKHRoaXMudXRpbHMubWFya2VyUmVnRXhwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LmZyb20obWFya2Vyc01hdGNoKS5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0LmFkZChtYXJrZXJbMF0udHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQgPSB0aGlzLnV0aWxzLnNvcnRTZXRPZlN0cmluZyhtYXJrZXJTZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyU2V0LmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1hcmtlclRvRG9jdW1lbnRNYXAuaGFzKG1hcmtlci50cmltKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclRvRG9jdW1lbnRNYXAuc2V0KG1hcmtlciwgbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJUb0RvY3VtZW50TWFwLmdldChtYXJrZXIudHJpbSgpKT8uYWRkKGNvbW1lbnRGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pXG4gICAgICAgIHRlc3RDb21tZW50RmlsZXMuZm9yRWFjaChjb21tZW50RmlsZSA9PiB7XG4gICAgICAgICAgICBwcm9taXNlLnB1c2godGhpcy51dGlscy5mc2EucmVhZChjb21tZW50RmlsZSlcbiAgICAgICAgICAgICAgICAudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGFsbCB0aGUgbWFya2VycyBpbiB0aGUgdmFsdWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWFya2Vyc01hdGNoID0gdmFsdWUubWF0Y2hBbGwodGhpcy51dGlscy5tYXJrZXJSZWdFeHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuZnJvbShtYXJrZXJzTWF0Y2gpLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuYWRkKG1hcmtlclswXS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclNldCA9IHRoaXMudXRpbHMuc29ydFNldE9mU3RyaW5nKG1hcmtlclNldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJTZXQuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWFya2VyVG9UZXN0RG9jdW1lbnRNYXAuaGFzKG1hcmtlci50cmltKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlclRvVGVzdERvY3VtZW50TWFwLnNldChtYXJrZXIsIG5ldyBTZXQ8c3RyaW5nPigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyVG9UZXN0RG9jdW1lbnRNYXAuZ2V0KG1hcmtlci50cmltKCkpPy5hZGQoY29tbWVudEZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSlcbiAgICAgICAgUHJvbWlzZS5hbGxTZXR0bGVkKHByb21pc2UpXG4gICAgICAgICAgICAudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWxsTWFya2VycyA9IEFycmF5LmZyb20obWFya2VyVG9Eb2N1bWVudE1hcC5rZXlzKCkpLnNvcnQoKTtcblxuICAgICAgICAgICAgICAgIHZhciBtZFN0cmluZyA9IFwiQ29kZSBhbmQgQ29kZSBTdG9yeSBsaW5rc1xcblxcblwiO1xuICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyBgfG1hcmtlcnxkb2N1bWVudHxcXG5gO1xuICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyBgfC0tLS0tLXwtLS0tLS0tLXxcXG5gO1xuICAgICAgICAgICAgICAgIGFsbE1hcmtlcnMuZm9yRWFjaChtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkb2NOYW1lU2V0ID0gbWFya2VyVG9Eb2N1bWVudE1hcC5nZXQobWFya2VyKTtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGQgbWFya2VyIHRvIGRvYyBlbnRyeSBmcm9tIHRoZSBzZXQgb2YgZG9jdW1lbnQgbmFtZXMuXG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIGRvY05hbWVTZXQ/LmZvckVhY2goZG9jTmFtZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZFN0cmluZyA9IG1kU3RyaW5nICsgYHwke21hcmtlci5zdWJzdHJpbmcoMSl9fFtbJHtkb2NOYW1lfSMke21hcmtlcn1dXVxcbmA7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIGNvbnN0IGFsbFRlc3RNYXJrZXJzID0gQXJyYXkuZnJvbShtYXJrZXJUb1Rlc3REb2N1bWVudE1hcC5rZXlzKCkpLnNvcnQoKTtcblxuICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyBcIlxcblRlc3QgYW5kIFRlc3QgU3RvcnkgbGlua3NcXG5cXG5cIjtcbiAgICAgICAgICAgICAgICBtZFN0cmluZyA9IG1kU3RyaW5nICsgYHxtYXJrZXJ8ZG9jdW1lbnR8XFxuYDtcbiAgICAgICAgICAgICAgICBtZFN0cmluZyA9IG1kU3RyaW5nICsgYHwtLS0tLS18LS0tLS0tLS18XFxuYDtcbiAgICAgICAgICAgICAgICBhbGxUZXN0TWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvY05hbWVTZXQgPSBtYXJrZXJUb1Rlc3REb2N1bWVudE1hcC5nZXQobWFya2VyKTtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGQgbWFya2VyIHRvIHRlc3QgZG9jIGVudHJ5IGZyb20gdGhlIHNldCBvZiBkb2N1bWVudCBuYW1lcy5cbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgZG9jTmFtZVNldD8uZm9yRWFjaChkb2NOYW1lID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1kU3RyaW5nID0gbWRTdHJpbmcgKyBgfCR7bWFya2VyLnN1YnN0cmluZygxKX18W1ske2RvY05hbWV9IyR7bWFya2VyfV1dXFxuYDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnV0aWxzLmZzYS53cml0ZSh0aGlzLm1hcmtlckZpbGVXaXRoUGF0aCwgbWRTdHJpbmcpO1xuICAgICAgICAgICAgfSlcbiAgICB9XG59IiwgImxldCB3YXNtO1xuXG5jb25zdCBoZWFwID0gbmV3IEFycmF5KDEyOCkuZmlsbCh1bmRlZmluZWQpO1xuXG5oZWFwLnB1c2godW5kZWZpbmVkLCBudWxsLCB0cnVlLCBmYWxzZSk7XG5cbmZ1bmN0aW9uIGdldE9iamVjdChpZHgpIHsgcmV0dXJuIGhlYXBbaWR4XTsgfVxuXG5sZXQgV0FTTV9WRUNUT1JfTEVOID0gMDtcblxubGV0IGNhY2hlZFVpbnQ4TWVtb3J5MCA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldFVpbnQ4TWVtb3J5MCgpIHtcbiAgICBpZiAoY2FjaGVkVWludDhNZW1vcnkwID09PSBudWxsIHx8IGNhY2hlZFVpbnQ4TWVtb3J5MC5ieXRlTGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNhY2hlZFVpbnQ4TWVtb3J5MCA9IG5ldyBVaW50OEFycmF5KHdhc20ubWVtb3J5LmJ1ZmZlcik7XG4gICAgfVxuICAgIHJldHVybiBjYWNoZWRVaW50OE1lbW9yeTA7XG59XG5cbmNvbnN0IGNhY2hlZFRleHRFbmNvZGVyID0gKHR5cGVvZiBUZXh0RW5jb2RlciAhPT0gJ3VuZGVmaW5lZCcgPyBuZXcgVGV4dEVuY29kZXIoJ3V0Zi04JykgOiB7IGVuY29kZTogKCkgPT4geyB0aHJvdyBFcnJvcignVGV4dEVuY29kZXIgbm90IGF2YWlsYWJsZScpIH0gfSApO1xuXG5jb25zdCBlbmNvZGVTdHJpbmcgPSAodHlwZW9mIGNhY2hlZFRleHRFbmNvZGVyLmVuY29kZUludG8gPT09ICdmdW5jdGlvbidcbiAgICA/IGZ1bmN0aW9uIChhcmcsIHZpZXcpIHtcbiAgICByZXR1cm4gY2FjaGVkVGV4dEVuY29kZXIuZW5jb2RlSW50byhhcmcsIHZpZXcpO1xufVxuICAgIDogZnVuY3Rpb24gKGFyZywgdmlldykge1xuICAgIGNvbnN0IGJ1ZiA9IGNhY2hlZFRleHRFbmNvZGVyLmVuY29kZShhcmcpO1xuICAgIHZpZXcuc2V0KGJ1Zik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVhZDogYXJnLmxlbmd0aCxcbiAgICAgICAgd3JpdHRlbjogYnVmLmxlbmd0aFxuICAgIH07XG59KTtcblxuZnVuY3Rpb24gcGFzc1N0cmluZ1RvV2FzbTAoYXJnLCBtYWxsb2MsIHJlYWxsb2MpIHtcblxuICAgIGlmIChyZWFsbG9jID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgYnVmID0gY2FjaGVkVGV4dEVuY29kZXIuZW5jb2RlKGFyZyk7XG4gICAgICAgIGNvbnN0IHB0ciA9IG1hbGxvYyhidWYubGVuZ3RoLCAxKSA+Pj4gMDtcbiAgICAgICAgZ2V0VWludDhNZW1vcnkwKCkuc3ViYXJyYXkocHRyLCBwdHIgKyBidWYubGVuZ3RoKS5zZXQoYnVmKTtcbiAgICAgICAgV0FTTV9WRUNUT1JfTEVOID0gYnVmLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHB0cjtcbiAgICB9XG5cbiAgICBsZXQgbGVuID0gYXJnLmxlbmd0aDtcbiAgICBsZXQgcHRyID0gbWFsbG9jKGxlbiwgMSkgPj4+IDA7XG5cbiAgICBjb25zdCBtZW0gPSBnZXRVaW50OE1lbW9yeTAoKTtcblxuICAgIGxldCBvZmZzZXQgPSAwO1xuXG4gICAgZm9yICg7IG9mZnNldCA8IGxlbjsgb2Zmc2V0KyspIHtcbiAgICAgICAgY29uc3QgY29kZSA9IGFyZy5jaGFyQ29kZUF0KG9mZnNldCk7XG4gICAgICAgIGlmIChjb2RlID4gMHg3RikgYnJlYWs7XG4gICAgICAgIG1lbVtwdHIgKyBvZmZzZXRdID0gY29kZTtcbiAgICB9XG5cbiAgICBpZiAob2Zmc2V0ICE9PSBsZW4pIHtcbiAgICAgICAgaWYgKG9mZnNldCAhPT0gMCkge1xuICAgICAgICAgICAgYXJnID0gYXJnLnNsaWNlKG9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgcHRyID0gcmVhbGxvYyhwdHIsIGxlbiwgbGVuID0gb2Zmc2V0ICsgYXJnLmxlbmd0aCAqIDMsIDEpID4+PiAwO1xuICAgICAgICBjb25zdCB2aWV3ID0gZ2V0VWludDhNZW1vcnkwKCkuc3ViYXJyYXkocHRyICsgb2Zmc2V0LCBwdHIgKyBsZW4pO1xuICAgICAgICBjb25zdCByZXQgPSBlbmNvZGVTdHJpbmcoYXJnLCB2aWV3KTtcblxuICAgICAgICBvZmZzZXQgKz0gcmV0LndyaXR0ZW47XG4gICAgICAgIHB0ciA9IHJlYWxsb2MocHRyLCBsZW4sIG9mZnNldCwgMSkgPj4+IDA7XG4gICAgfVxuXG4gICAgV0FTTV9WRUNUT1JfTEVOID0gb2Zmc2V0O1xuICAgIHJldHVybiBwdHI7XG59XG5cbmZ1bmN0aW9uIGlzTGlrZU5vbmUoeCkge1xuICAgIHJldHVybiB4ID09PSB1bmRlZmluZWQgfHwgeCA9PT0gbnVsbDtcbn1cblxubGV0IGNhY2hlZEludDMyTWVtb3J5MCA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldEludDMyTWVtb3J5MCgpIHtcbiAgICBpZiAoY2FjaGVkSW50MzJNZW1vcnkwID09PSBudWxsIHx8IGNhY2hlZEludDMyTWVtb3J5MC5ieXRlTGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNhY2hlZEludDMyTWVtb3J5MCA9IG5ldyBJbnQzMkFycmF5KHdhc20ubWVtb3J5LmJ1ZmZlcik7XG4gICAgfVxuICAgIHJldHVybiBjYWNoZWRJbnQzMk1lbW9yeTA7XG59XG5cbmxldCBoZWFwX25leHQgPSBoZWFwLmxlbmd0aDtcblxuZnVuY3Rpb24gZHJvcE9iamVjdChpZHgpIHtcbiAgICBpZiAoaWR4IDwgMTMyKSByZXR1cm47XG4gICAgaGVhcFtpZHhdID0gaGVhcF9uZXh0O1xuICAgIGhlYXBfbmV4dCA9IGlkeDtcbn1cblxuZnVuY3Rpb24gdGFrZU9iamVjdChpZHgpIHtcbiAgICBjb25zdCByZXQgPSBnZXRPYmplY3QoaWR4KTtcbiAgICBkcm9wT2JqZWN0KGlkeCk7XG4gICAgcmV0dXJuIHJldDtcbn1cblxuY29uc3QgY2FjaGVkVGV4dERlY29kZXIgPSAodHlwZW9mIFRleHREZWNvZGVyICE9PSAndW5kZWZpbmVkJyA/IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnLCB7IGlnbm9yZUJPTTogdHJ1ZSwgZmF0YWw6IHRydWUgfSkgOiB7IGRlY29kZTogKCkgPT4geyB0aHJvdyBFcnJvcignVGV4dERlY29kZXIgbm90IGF2YWlsYWJsZScpIH0gfSApO1xuXG5pZiAodHlwZW9mIFRleHREZWNvZGVyICE9PSAndW5kZWZpbmVkJykgeyBjYWNoZWRUZXh0RGVjb2Rlci5kZWNvZGUoKTsgfTtcblxuZnVuY3Rpb24gZ2V0U3RyaW5nRnJvbVdhc20wKHB0ciwgbGVuKSB7XG4gICAgcHRyID0gcHRyID4+PiAwO1xuICAgIHJldHVybiBjYWNoZWRUZXh0RGVjb2Rlci5kZWNvZGUoZ2V0VWludDhNZW1vcnkwKCkuc3ViYXJyYXkocHRyLCBwdHIgKyBsZW4pKTtcbn1cblxuZnVuY3Rpb24gYWRkSGVhcE9iamVjdChvYmopIHtcbiAgICBpZiAoaGVhcF9uZXh0ID09PSBoZWFwLmxlbmd0aCkgaGVhcC5wdXNoKGhlYXAubGVuZ3RoICsgMSk7XG4gICAgY29uc3QgaWR4ID0gaGVhcF9uZXh0O1xuICAgIGhlYXBfbmV4dCA9IGhlYXBbaWR4XTtcblxuICAgIGhlYXBbaWR4XSA9IG9iajtcbiAgICByZXR1cm4gaWR4O1xufVxuLyoqXG4qIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiogQHJldHVybnMge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24gc2Nhbl9mb3JfY29tbWVudHMoc3RyKSB7XG4gICAgY29uc3QgcmV0ID0gd2FzbS5zY2FuX2Zvcl9jb21tZW50cyhhZGRIZWFwT2JqZWN0KHN0cikpO1xuICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIF9fd2JnX2xvYWQobW9kdWxlLCBpbXBvcnRzKSB7XG4gICAgaWYgKHR5cGVvZiBSZXNwb25zZSA9PT0gJ2Z1bmN0aW9uJyAmJiBtb2R1bGUgaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgICBpZiAodHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhtb2R1bGUsIGltcG9ydHMpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykgIT0gJ2FwcGxpY2F0aW9uL3dhc20nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcImBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ2AgZmFpbGVkIGJlY2F1c2UgeW91ciBzZXJ2ZXIgZG9lcyBub3Qgc2VydmUgd2FzbSB3aXRoIGBhcHBsaWNhdGlvbi93YXNtYCBNSU1FIHR5cGUuIEZhbGxpbmcgYmFjayB0byBgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVgIHdoaWNoIGlzIHNsb3dlci4gT3JpZ2luYWwgZXJyb3I6XFxuXCIsIGUpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBieXRlcyA9IGF3YWl0IG1vZHVsZS5hcnJheUJ1ZmZlcigpO1xuICAgICAgICByZXR1cm4gYXdhaXQgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYnl0ZXMsIGltcG9ydHMpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBhd2FpdCBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZShtb2R1bGUsIGltcG9ydHMpO1xuXG4gICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIFdlYkFzc2VtYmx5Lkluc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBpbnN0YW5jZSwgbW9kdWxlIH07XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gX193YmdfZ2V0X2ltcG9ydHMoKSB7XG4gICAgY29uc3QgaW1wb3J0cyA9IHt9O1xuICAgIGltcG9ydHMud2JnID0ge307XG4gICAgaW1wb3J0cy53YmcuX193YmluZGdlbl9zdHJpbmdfZ2V0ID0gZnVuY3Rpb24oYXJnMCwgYXJnMSkge1xuICAgICAgICBjb25zdCBvYmogPSBnZXRPYmplY3QoYXJnMSk7XG4gICAgICAgIGNvbnN0IHJldCA9IHR5cGVvZihvYmopID09PSAnc3RyaW5nJyA/IG9iaiA6IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIHB0cjEgPSBpc0xpa2VOb25lKHJldCkgPyAwIDogcGFzc1N0cmluZ1RvV2FzbTAocmV0LCB3YXNtLl9fd2JpbmRnZW5fbWFsbG9jLCB3YXNtLl9fd2JpbmRnZW5fcmVhbGxvYyk7XG4gICAgICAgIHZhciBsZW4xID0gV0FTTV9WRUNUT1JfTEVOO1xuICAgICAgICBnZXRJbnQzMk1lbW9yeTAoKVthcmcwIC8gNCArIDFdID0gbGVuMTtcbiAgICAgICAgZ2V0SW50MzJNZW1vcnkwKClbYXJnMCAvIDQgKyAwXSA9IHB0cjE7XG4gICAgfTtcbiAgICBpbXBvcnRzLndiZy5fX3diaW5kZ2VuX29iamVjdF9kcm9wX3JlZiA9IGZ1bmN0aW9uKGFyZzApIHtcbiAgICAgICAgdGFrZU9iamVjdChhcmcwKTtcbiAgICB9O1xuICAgIGltcG9ydHMud2JnLl9fd2JpbmRnZW5fc3RyaW5nX25ldyA9IGZ1bmN0aW9uKGFyZzAsIGFyZzEpIHtcbiAgICAgICAgY29uc3QgcmV0ID0gZ2V0U3RyaW5nRnJvbVdhc20wKGFyZzAsIGFyZzEpO1xuICAgICAgICByZXR1cm4gYWRkSGVhcE9iamVjdChyZXQpO1xuICAgIH07XG4gICAgaW1wb3J0cy53YmcuX193YmluZGdlbl90aHJvdyA9IGZ1bmN0aW9uKGFyZzAsIGFyZzEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGdldFN0cmluZ0Zyb21XYXNtMChhcmcwLCBhcmcxKSk7XG4gICAgfTtcblxuICAgIHJldHVybiBpbXBvcnRzO1xufVxuXG5mdW5jdGlvbiBfX3diZ19pbml0X21lbW9yeShpbXBvcnRzLCBtYXliZV9tZW1vcnkpIHtcblxufVxuXG5mdW5jdGlvbiBfX3diZ19maW5hbGl6ZV9pbml0KGluc3RhbmNlLCBtb2R1bGUpIHtcbiAgICB3YXNtID0gaW5zdGFuY2UuZXhwb3J0cztcbiAgICBfX3diZ19pbml0Ll9fd2JpbmRnZW5fd2FzbV9tb2R1bGUgPSBtb2R1bGU7XG4gICAgY2FjaGVkSW50MzJNZW1vcnkwID0gbnVsbDtcbiAgICBjYWNoZWRVaW50OE1lbW9yeTAgPSBudWxsO1xuXG5cbiAgICByZXR1cm4gd2FzbTtcbn1cblxuZnVuY3Rpb24gaW5pdFN5bmMobW9kdWxlKSB7XG4gICAgaWYgKHdhc20gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHdhc207XG5cbiAgICBjb25zdCBpbXBvcnRzID0gX193YmdfZ2V0X2ltcG9ydHMoKTtcblxuICAgIF9fd2JnX2luaXRfbWVtb3J5KGltcG9ydHMpO1xuXG4gICAgaWYgKCEobW9kdWxlIGluc3RhbmNlb2YgV2ViQXNzZW1ibHkuTW9kdWxlKSkge1xuICAgICAgICBtb2R1bGUgPSBuZXcgV2ViQXNzZW1ibHkuTW9kdWxlKG1vZHVsZSk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobW9kdWxlLCBpbXBvcnRzKTtcblxuICAgIHJldHVybiBfX3diZ19maW5hbGl6ZV9pbml0KGluc3RhbmNlLCBtb2R1bGUpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBfX3diZ19pbml0KGlucHV0KSB7XG4gICAgaWYgKHdhc20gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHdhc207XG5cbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpbnB1dCA9IG5ldyBVUkwoJ29ic2lkaWFuX3J1c3RfcGx1Z2luX2JnLndhc20nLCBpbXBvcnQubWV0YS51cmwpO1xuICAgIH1cbiAgICBjb25zdCBpbXBvcnRzID0gX193YmdfZ2V0X2ltcG9ydHMoKTtcblxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnIHx8ICh0eXBlb2YgUmVxdWVzdCA9PT0gJ2Z1bmN0aW9uJyAmJiBpbnB1dCBpbnN0YW5jZW9mIFJlcXVlc3QpIHx8ICh0eXBlb2YgVVJMID09PSAnZnVuY3Rpb24nICYmIGlucHV0IGluc3RhbmNlb2YgVVJMKSkge1xuICAgICAgICBpbnB1dCA9IGZldGNoKGlucHV0KTtcbiAgICB9XG5cbiAgICBfX3diZ19pbml0X21lbW9yeShpbXBvcnRzKTtcblxuICAgIGNvbnN0IHsgaW5zdGFuY2UsIG1vZHVsZSB9ID0gYXdhaXQgX193YmdfbG9hZChhd2FpdCBpbnB1dCwgaW1wb3J0cyk7XG5cbiAgICByZXR1cm4gX193YmdfZmluYWxpemVfaW5pdChpbnN0YW5jZSwgbW9kdWxlKTtcbn1cblxuZXhwb3J0IHsgaW5pdFN5bmMgfVxuZXhwb3J0IGRlZmF1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
