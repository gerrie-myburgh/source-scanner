import { App } from 'obsidian';
import SourceScanner from '../main';
import { statSync, readFileSync, existsSync, writeFileSync } from 'fs'
import { FileSystemAdapter } from 'obsidian'
import { Utils } from './Utils'
import { DocFolders } from './DocFolders';

export class ScanSource {

    codeScanner: (arg0: string) => string;

    applicationPath: string;          // application path
    codeExtension: string;            // the source file name extension
    documentPath: string;             // document path abs path
    testPath: string;                 // unit test code path 
    relativeDocumentPath: string;     // document path abs rel from vault root
    groupBySize: number;              // number of documents to process at a time 
    sleepLength: number;              // number of seconds to sleep
    phaseCount: number = 0;           // current processsing phase 

    applicationFileListWithExtension: Array<Array<string>>; // all application source files
    testFileListWithExtension: Array<Array<string>>;        // all test source files
    documentFileListWithExtension: Array<string>;           // all documents
    sourceAndDocumentLink = new Set<string>;

    fsa: FileSystemAdapter;
    utils: Utils;

    docFolders: DocFolders;            // document folders

    init(app: App, plugin: SourceScanner, scanner: (arg0: string) => string) {

        this.codeScanner = scanner;
        this.applicationPath = plugin.settings.applicationPath;
        this.codeExtension = plugin.settings.applicationExtension;
        this.documentPath = plugin.settings.documentPath;
        this.testPath = plugin.settings.unitTestPath;
        this.groupBySize = plugin.settings.groupBySize;
        this.sleepLength = plugin.settings.sleepLength;
        this.utils = new Utils(app);
        this.fsa = app.vault.adapter as FileSystemAdapter;

        return setInterval(() => this.run(), this.sleepLength);
    }

    run() {
        //
        // the folders might have been deleted or this is the first start of the app
        // so create the folders iff they do not exist
        //
        this.docFolders = this.utils.createFolders(this.documentPath);
        //
        // do work in phases
        // get all the implementation and test files into a list of chunks at most groupBySize
        //
        if (this.phaseCount == 1.0) {
            const impFiles = this.utils.filterFileNamesByExtension(
                this.codeExtension,
                this.utils.walkInFolderFromDir(this.applicationPath, []));

            this.applicationFileListWithExtension = [];

            for (let i = 0; i < impFiles.length; i += this.groupBySize) {
                const chunk = impFiles.slice(i, i + this.groupBySize);
                this.applicationFileListWithExtension.push(chunk);
            }

            const testFiles = this.utils.filterFileNamesByExtension(
                this.codeExtension,
                this.utils.walkInFolderFromDir(this.testPath, []));

            this.testFileListWithExtension = [];

            for (let i = 0; i < testFiles.length; i += this.groupBySize) {
                const chunk = testFiles.slice(i, i + this.groupBySize);
                this.testFileListWithExtension.push(chunk);
            }
        }
        //
        // get list of document files
        //        
        if (this.phaseCount == 2.0) {
            const files = this.utils.filterFileNamesByExtension(
                '.md',
                this.utils.walkInFolderFromDir(
                    this.fsa.getBasePath() + this.utils.separator + this.docFolders.settingsCommentFolder, []
                ));
            this.documentFileListWithExtension = files
                .map(fileName => {
                    return fileName.replace(this.fsa.getBasePath() + this.utils.separator, "");
                })
        }
        //
        // if the source if younger then the document file OR document file had to be created then
        //    load the lines from the source file and scan for comments.
        //    write comments out to document file
        // Make sure the files exist before getting their stat information
        //
        if (this.phaseCount == 3.0 && this.applicationFileListWithExtension.length > 0) {
            const filesToCheck = this.applicationFileListWithExtension.pop();
            if (filesToCheck != undefined) {
                filesToCheck.forEach(srcFile => {

                    const documentName = this.createDocNameFromSourceName(srcFile, this.applicationPath);
                    const documentNameAndPath =
                        `${this.documentPath}${this.utils.separator}comments${this.utils.separator}${documentName}`;
                    const docFullPathname = `${this.fsa.getBasePath()}${this.utils.separator}${documentNameAndPath}`;

                    this.sourceAndDocumentLink.add(documentNameAndPath);

                    this.doActualScanning(documentNameAndPath, srcFile, docFullPathname);
                })
                this.phaseCount = 2.0;
            }
        }

        if (this.phaseCount == 4.0 && this.testFileListWithExtension.length > 0) {
            const filesToCheck = this.testFileListWithExtension.pop();
            if (filesToCheck != undefined) {
                filesToCheck.forEach(srcFile => {

                    const testDocumentName = this.createDocNameFromSourceName(srcFile, this.testPath);
                    const testDocumentNameAndPath =
                        `${this.documentPath}${this.utils.separator}test comments${this.utils.separator}${testDocumentName}`;
                    const docFullPathname = `${this.fsa.getBasePath()}${this.utils.separator}${testDocumentNameAndPath}`;

                    this.doActualScanning(testDocumentNameAndPath, srcFile, docFullPathname);
                })
                this.phaseCount = 4.0;
            }
        }

        if (this.phaseCount == 5.0) {
            //
            // every md document that does not have a source file must be removed
            // the source and document link is the source file that should be in the 
            // document file list. 
            //            
            this.documentFileListWithExtension.forEach(fileName => {
                if (!this.sourceAndDocumentLink.has(fileName)) {
                    this.utils.fsa.remove(fileName)
                }
            })

            this.sourceAndDocumentLink.clear();
            this.phaseCount = -1.0;
        }

        this.phaseCount += 1;
    }

    /**
     * Given the file system full doc name and path scan the source file and place document 
     * in the document name and path location
     * @param documentNameAndPath vault path of the md document
     * @param srcFile to scan source file to scan
     * @param docFullPathname fila document name and path from the root of the file system
     */
    private doActualScanning(documentNameAndPath: string, srcFile: string, docFullPathname: string) {
        this.sourceAndDocumentLink.add(documentNameAndPath);

        const srcFileExists = existsSync(srcFile);
        if (!srcFileExists) {
            console.info('Test source file gone ' + srcFile);
        } else {
            const srcStat = statSync(srcFile);

            var createdFile = false;
            const docFileExists = existsSync(docFullPathname);
            var docStat: any;
            var createdFile = false;
            if (docFileExists) {
                docStat = statSync(docFullPathname);
            } else {
                writeFileSync(docFullPathname, "");
                createdFile = true;
            }
            docStat = statSync(docFullPathname);
            //
            // source is older than the doc as seen from 1970 -> onwards OR
            // docs have just been created.
            // 
            if (createdFile || docStat.mtimeMs < srcStat.mtimeMs) {
                const srcLines = readFileSync(srcFile, { encoding: 'utf8', flag: 'r' });
                var allComments;
                var comments = "NONE";
                try {
                    comments = this.codeScanner(srcLines);
                    if (comments != undefined) {
                        allComments = comments.replaceAll(/\n\s+\*/g, "\n")
                    }
                } catch (exception) {
                    console.log("Error in scan for file " + srcFile); 
                    const headerComment = `[Source](file://${srcFile})\n\n---\n`;
                    this.fsa.write(documentNameAndPath, headerComment + comments);
                }
                if (allComments == "unpaired surrogates") {
                    console.log("Error in scan for file " + srcFile); 
                }
                const headerComment = `[Source](file://${srcFile})\n\n---\n`;
                this.fsa.write(documentNameAndPath, headerComment + allComments);
            }
        }
    }

    /**
     * Create a document file name using the source file name
     * @param sourceFile to create a document file from
     * @returns the document file
     */
    createDocNameFromSourceName(sourceFile: string, applicationPath: string) {
        // get only the name of the file
        var fileName = sourceFile
            .replace(applicationPath + this.utils.separator, '')
            .replace(this.codeExtension, '.md');
        // replace all accurences
        while (fileName.contains(this.utils.separator)) {
            fileName = fileName.replace(this.utils.separator, '.');
        }
        return fileName;
    }

    /**
     * create a path to the source file relative to the vault
     * @param sourceFile the source code file
     * @param documentPart the document file
     * @returns the path to the source relative to the vault
     */
    createRelativePath(sourceFile: string, documentPart: string) {
        var sourceFileParts = sourceFile.split(this.utils.separator);
        var documentAndPathParts = `${this.utils.fsa.getBasePath()}/${documentPart}`.split('/');

        while (sourceFileParts[0] == documentAndPathParts[0]) {
            sourceFileParts = sourceFileParts.slice(1);
            documentAndPathParts = documentAndPathParts.slice(1);
        }
        // go up from current folder documentAndPathParts length - 1
        return documentAndPathParts.filter(value => {
            return !value.endsWith('.md')
        })
            .map(value => '..')
            .concat(sourceFileParts).join('/');


    }
}