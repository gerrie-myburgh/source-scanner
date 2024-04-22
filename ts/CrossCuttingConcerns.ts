import { App, FileSystemAdapter } from 'obsidian';
import { Utils } from './Utils'
import { DocFolders } from './DocFolders';
import { statSync, readdirSync, mkdirSync } from 'fs'

export class CrossCuttingConcerns {
    private fsa: FileSystemAdapter;
    private docFolders: DocFolders;
    private utils: Utils;

    constructor(app: App, docFolders: DocFolders) {
        this.utils = new Utils(app);
        this.fsa = this.utils.fsa;
        this.docFolders = docFolders;
    }

    generateCrossCuttingConcerns() {
        const documentToMarkerMap = new Map<string, Set<string>>;
        const testDocumentToMarkerMap = new Map<string, Set<string>>;
        const storyToMarkerMap = new Map<string, Set<string>>;
        const testStoryToMarkerMap = new Map<string, Set<string>>;
        const markerToStoryMap = new Map<string, string>();
        const markerToTestStoryMap = new Map<string, string>();
        const markerToDocumentMap = new Map<string, string>();
        const markerToTestDocumentMap = new Map<string, string>();
        // get all the solutions files to delete
        //
        const promise: Array<Promise<void>> = new Array<Promise<void>>();
        const solutionFileToDelete = this.utils.listMDFilesInVault(this.docFolders.settingsSolutionFolder);
        solutionFileToDelete.forEach(file => {
            promise.push(this.fsa.remove(file));
        });
        //
        // wait for all promises to complete
        //
        Promise.allSettled(promise)
            .then(value => {
                //
                // cleanup target folders, by the time the folders are gotten 
                // in next lines this cleanup is done
                //
                this.fsa.rmdir(this.docFolders.settingsSolutionFolder, true);
                this.fsa.mkdir(this.docFolders.settingsSolutionFolder);
                //
                // get list of md files in the comment and test folder of the documents
                //
                const commentMDFiles = this.utils.listMDFilesInVault(this.docFolders.settingsCommentFolder);
                const testCommentMDFiles = this.utils.listMDFilesInVault(this.docFolders.settingsTestCommentFolder);
                //
                // get list of md files in the story folder
                //
                const storyMDFiles = this.utils.listMDFilesInVault(this.docFolders.settingsStoryFolder);
                const testStoryMDFiles = this.utils.listMDFilesInVault(this.docFolders.settingsUnitTestFolder);
                //
                // pick up all markers in the doc string doc file by doc file and aggregate the markers
                // before processing them
                //
                const allPromises = new Array<Promise<void>>();
                commentMDFiles.forEach(commentFile => {
                    allPromises.push(this.fsa.read(commentFile)
                        .then(value => {
                            var markerSet = new Set<string>();
                            //
                            // get all the markers in the value string
                            //
                            const markersMatch = value.matchAll(this.utils.markerRegExp);
                            Array.from(markersMatch).forEach(marker => {
                                markerSet.add(marker[0].trim());
                            })
                            markerSet = this.utils.sortSetOfString(markerSet);
                            const documentName = commentFile.split('/').last() as string;
                            markerSet.forEach(marker => {
                                markerToDocumentMap.set(marker.trim(), documentName);
                            });
                            if (documentName != undefined) {
                                documentToMarkerMap.set(documentName, markerSet)
                            }
                        }))
                })
                testCommentMDFiles.forEach(commentFile => {
                    allPromises.push(this.fsa.read(commentFile)
                        .then(value => {
                            var markerSet = new Set<string>();
                            //
                            // get all the markers in the value string
                            //
                            const markersMatch = value.matchAll(this.utils.markerRegExp);
                            Array.from(markersMatch).forEach(marker => {
                                markerSet.add(marker[0].trim());
                            })
                            markerSet = this.utils.sortSetOfString(markerSet);
                            const documentName = commentFile.split('/').last() as string;
                            markerSet.forEach(marker => {
                                markerToTestDocumentMap.set(marker.trim(), documentName);
                            });
                            if (documentName != undefined) {
                                testDocumentToMarkerMap.set(documentName, markerSet)
                            }
                        }))
                })
                storyMDFiles.forEach(storyFile => {
                    allPromises.push(this.fsa.read(storyFile)
                        .then(value => {
                            var markerSet = new Set<string>();
                            //
                            // get all the markers in the value string
                            //
                            const markersMatch = value.matchAll(this.utils.markerRegExp);
                            Array.from(markersMatch).forEach(marker => {
                                markerSet.add(marker[0].trim());
                            })
                            markerSet = this.utils.sortSetOfString(markerSet);
                            const documentName = storyFile.split('/').last() as string;
                            markerSet.forEach(marker => {
                                markerToStoryMap.set(marker.trim(), storyFile);
                            });
                            if (documentName != undefined) {
                                storyToMarkerMap.set(documentName, markerSet)
                            }
                        }))
                })
                testStoryMDFiles.forEach(storyFile => {
                    allPromises.push(this.fsa.read(storyFile)
                        .then(value => {
                            var markerSet = new Set<string>();
                            //
                            // get all the markers in the value string
                            //
                            const markersMatch = value.matchAll(this.utils.markerRegExp);
                            Array.from(markersMatch).forEach(marker => {
                                markerSet.add(marker[0].trim());
                            })
                            markerSet = this.utils.sortSetOfString(markerSet);
                            const documentName = storyFile.split('/').last() as string;
                            markerSet.forEach(marker => {
                                markerToTestStoryMap.set(this.dropRightAndMkString(marker.trim().split("-"), 4, "-"), storyFile);
                            });
                            if (documentName != undefined) {
                                testStoryToMarkerMap.set(documentName, markerSet)
                            }
                        }))
                })
                Promise.allSettled(allPromises)
                    .then(value => {
                        //
                        // collect all markers in one list
                        // sort them them
                        // group by path/name.md excluding the seq number
                        // 
                        var listOfMarkers: string[] = [];
                        var unitTestMarkers: string[] = [];

                        Array.from(documentToMarkerMap.values())
                            .forEach(setOfMarkers => {
                                const loalListOfMarkers: string[] = Array.from(setOfMarkers);
                                listOfMarkers = listOfMarkers.concat(loalListOfMarkers);
                            });
                        Array.from(testDocumentToMarkerMap.values())
                            .forEach(setOfMarkers => {
                                const loalListOfMarkers: string[] = Array.from(setOfMarkers);
                                unitTestMarkers = unitTestMarkers.concat(loalListOfMarkers);
                            });
                        listOfMarkers.sort((a, b) => a.localeCompare(b))
                        unitTestMarkers.sort((a, b) => a.localeCompare(b))
                        var allMarkers = this.groupedMap(listOfMarkers, i => this.solutionDocNameFromMarker(i));
                        var allUnitTestMarkers = this.groupedUnitTestMap(unitTestMarkers);
                        Array.from(allMarkers).forEach(([solName, markers]) => {
                            var mdString = `# ${this.dropRightAndMkString(solName.split("/"), 1, " ").toUpperCase()}\n`;
                            //
                            // build link to story, filter the story markers as well
                            //
                            var markerToStory: Map<string, string> = new Map(
                                Array.from(markerToStoryMap.entries())
                                    .filter(([key]) => {
                                        const splitMarker = key.split("-");
                                        return markers[0].startsWith(this.dropRightAndMkString(splitMarker, 1, '-'));
                                    }
                                    ));
                            //
                            // setup die story links first
                            //                                      
                            mdString = mdString + '## Functional Requirement\n';
                            markerToStory.forEach((story, marker) => {
                                if (markerToStoryMap.get(marker) != undefined) {
                                    mdString = mdString + `![[${markerToStoryMap.get(marker)}#${marker.trim()}]]\n`;
                                }
                            });

                            const uniqueMakers = Array.from(new Set(markers));
                            uniqueMakers.forEach((marker, story) => {
                                mdString = mdString + '## Implimentation Solution\n';
                                if (markerToDocumentMap.get(marker) != undefined) {
                                    const document = markerToDocumentMap.get(marker)!;
                                    mdString = mdString + `![[${document}#${marker.trim()}]]\n`;

                                    //
                                    // if the unit tests for the document exis then
                                    // print out these unit tests - there be dragons here
                                    //
                                    if (allUnitTestMarkers.get(marker) != undefined) {
                                        mdString = mdString + '### Unit Test Implementation\n';
                                        allUnitTestMarkers.get(marker)!.forEach(marker => {
                                            if (this.isTestMarker(marker)) {
                                                mdString = mdString + `![[${markerToTestDocumentMap.get(marker)}#${marker.trim()}]]\n`;
                                            }
                                        });
                                    }
                                }
                            });

                            //
                            // create the folder path if required and write out text
                            //
                            this.utils.makeDirInVault(solName);
                            this.fsa.write(solName, mdString);
                        })
                    })
            });
    }

    /**
     * 
     * @param values drop the rightmost nth string and join using the delimiter
     * @param n string to drop on the right
     * @param delimiter used to join 
     * @returns resulting string
     */
    private dropRightAndMkString(values: string[], n: number, delimiter: string): string {
        return values.slice(0, values.length - (n)).join(delimiter);
    }

    /**
     * 
     * @param values drop the leftmost nth string an return the result
     * @param n string to drop on the right
     * @param delimiter used to join 
     * @returns resulting string
     */
    private dropLeftAndMkString(values: string[], n: number, delimiter: string): string {
        return values.slice(n, values.length - (n)).join(delimiter);
    }

    /**
     * split solName in groups of 2 joined by /
     * @param solName solution name
     * @param mapping markerSet
     */
    private getSolutionFileName(solName: string): string {
        const fileNameParts = solName.split("-")
        var fileName: string[] = [];
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
        return `/${fileName.join("/")}`
    }

    /**
     * Take a marker string and convert into file path / file name.md. of the marker 
     * excluding the -[0-9]+ at the end, is in mapping then use that mapping value.
     * markers have the folllowing format :
     * 
     * 1. ^JIRA1234-001 <
     * 2. ^JIRA1234-001-solution-001
     * 3. ^JIRA1234-001-solution-001-test-001
     * 
     * 1 marker converted to filename
     * 2 marker converted to path + filename
     * 3 marker converted to path + filenanme where - identical to 2.
     * 
     * @param marker in document string
     * @return the name of the path and file name.md
     */
    private solutionDocNameFromMarker(marker: string): string {
        const docName = this.getSolutionFileName(marker.replace("^", ""));
        const solutionName = `${docName}.md`;
        return `/${this.docFolders.settingsSolutionFolder}${solutionName}`;
    }

    /**
     * Group by the list according to a getKey function. It will be one key 
     * to many potential values
     * @param list of elements to group by
     * @param getKey group by key
     * @returns the grouped list
     */
    private groupedMap(array: string[], getKey: (i: string) => string): Map<string, string[]> {
        return array.reduce((map, currentValue) => {
            const key = getKey(currentValue);

            if (!map.has(key)) {
                map.set(key, []);
            }

            if (map.get(key) != undefined) {
                map?.get(key)?.push(currentValue);
            }

            return map;
        }, new Map<string, string[]>());
    }

    /**
     * Group by the list according to a getKey function. It will be one key 
     * to many potential values
     * @param list of elements to group by, The list in this case will contain string formatted
     * as JIRA1234-001-solution-001-test-001. 
     * @param getKey group by key
     * @returns the grouped list. The Map<solName, Map<Document Marker marker link, List<string>(Unit test links)> >
     */
    private groupedUnitTestMap(array: string[]): Map<string, string[]> {
        return array.reduce((map, currentValue) => {
            const key = currentValue.split("-");
            const keyValue = this.dropRightAndMkString(key, 2, "-");

            if (!map.has(keyValue)) {
                map.set(keyValue, []);
            }

            if (map.get(keyValue) != undefined) {
                map?.get(keyValue)?.push(currentValue);
            }

            return map;
        }, new Map<string, string[]>());
    }

    /**
     * is this a test marker
     * @param marker to check is it has legth 6
     * @returns 
     */
    private isTestMarker(marker: string): boolean {
        return marker.split("-").length == 6
    }

}
