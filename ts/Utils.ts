import { App } from 'obsidian';
import { statSync, readdirSync, mkdirSync } from 'fs'
import { FileSystemAdapter } from 'obsidian'
const path = require('path').remote
import { DocFolders } from './DocFolders';

export class Utils {
    app: App;
    //
    // file system path separator
    //
    public separator = '/';
    //
    // obsidian file system adaptor
    //
    fsa : FileSystemAdapter;
    //
    // regexp for finding markers and file path expressions
    // eg : ^JIRA1234-123-test-001-bla00-87-zzz00-08
    //       ------------ story marker  
    //                    -------------------------- file folder and comment markers
    //
    markerRegExp = /\s\^[a-zA-Z]+[a-zA-Z0-9]+\-[0-9]+(\-[a-zA-Z]+[a-zA-Z0-9]+\-[0-9]+)*/g;

    constructor(app : App) { 
        this.app = app;
        this.fsa = this.app.vault.adapter as FileSystemAdapter;
    }

    /** 
     * make sure the separator regex does not have single '\'
     */
    toVaultTypeSeperator() { if (this.separator == '\\') {return '/'} else {return '/'}}

    /**
     * Recursive walk the folder in a non vault location. Get all file names from
     * dir and downwards
     * @param dir to scan from
     * @param files list with folder names
     * @returns file Array
     */
    walkInFolderFromDir(dir : string, files : Array<string>) {
        const fileList = readdirSync(dir)
        for (const file of fileList) {
            var name = `${dir}${this.separator}${file}`
            if (statSync(name).isDirectory()) {
                this.walkInFolderFromDir(name, files)
            } else {
                files.push(name)
            }
        }
        return files
    }

    /**
     * Filter files by extension value
     * @param extension to filter by
     * @param files to filter by 
     * @returns filtered file names
     */
    filterFileNamesByExtension(extension : string, files : Array<string>) : Array<string> {
        var result = new Array<string>();
        result = files.filter(fileName => {
            return fileName.endsWith(extension);
        })
        return result;
    }

    /**
     * get all the .md files from the folder recursivly
     * @param folder to get the md file from
     * @returns list of md files in the folder
     */
    listMDFilesInVault(folder : string) {
        const commentBasePath = `${this.fsa.getBasePath()}${this.separator}${folder}`
        return this.filterFileNamesByExtension(
            '.md',
            this.walkInFolderFromDir(commentBasePath, []))
            .map(value => {
                var fileName = value.replace(`${this.fsa.getBasePath()}`, '');
                while (fileName.contains(`\\`)) {
                    fileName = fileName.replace(`${this.separator}`,'/'); 
                }
                return fileName;
            });        
    }

    /**
     * ## makeDirInVault
     * Make a folder path in the vault. Drop the file name , keep the path and create it.
     * @param fsa
     * @param filePathAndName
     */
    makeDirInVault(filePathAndName : string) {
        var filePath = filePathAndName.split(this.toVaultTypeSeperator());
        //
        // drop file name from path and name and start from the root of the vault
        //
        filePath = filePath.slice(0, filePath.length - 1).slice(1);
        filePath[0] = `/${filePath[0]}`;
        //
        // construct path step by step 
        //
        var constructedPath : string[] = [];
        while (filePath.length > 0)
        {
            constructedPath.push( filePath[0] );
            this.fsa.mkdir(constructedPath.join('/'));
            filePath = filePath.slice(1);
        }
    }

    /**
     * order set and return ordered set
     * @param set to order
     */
    sortSetOfString(set : Set<string>) : Set<string> {
        const sortedArray = Array.from(set).sort();
        return new Set<string>(sortedArray);
    }

    /**
    * ## createFolders
    * Create folder below document path
    *
    * @param docPath that was set by user
    * @return the DocFolder instance
    */
    createFolders(docPath : string) {
        const settingsBase1 = `${this.fsa.getBasePath()}${this.separator}${docPath}${this.separator}`
        const settingsStoryFolder1 = settingsBase1 + 'stories';
        const settingsSolutionFolder1 = settingsBase1 + 'solutions';
        const settingsMarkerMapping1 = settingsBase1 + 'marker';
        const settingsCommentsMapping1 = settingsBase1 + 'comments';
        const settingsTestCommentsMapping1 = settingsBase1 + 'test comments'        
        const settingsUnitTestMapping1 = settingsBase1 + 'unit tests'        
        //
        // create folders in vault
        //
        mkdirSync(settingsStoryFolder1, { recursive: true });
        mkdirSync(settingsSolutionFolder1, { recursive: true });
        mkdirSync(settingsMarkerMapping1, { recursive: true });
        mkdirSync(settingsCommentsMapping1, { recursive: true });
        mkdirSync(settingsTestCommentsMapping1, { recursive: true });
        mkdirSync(settingsUnitTestMapping1, { recursive: true });
    
        const settingsBase = `${docPath}${this.separator}`;
        const settingsStoryFolder = settingsBase + 'stories';
        const settingsSolutionFolder = settingsBase + 'solutions';
        const settingsMarkerMapping = settingsBase + 'marker';
        const settingsCommentsMapping = settingsBase + 'comments';
        const settingsTestCommentsMapping = settingsBase + 'test comments';
        const settingsUnitTestMapping = settingsBase + 'unit tests';

        return new DocFolders(
            settingsStoryFolder, 
            settingsSolutionFolder,
            settingsMarkerMapping,
            settingsCommentsMapping,
            settingsTestCommentsMapping,
            settingsUnitTestMapping
            );
    }

}