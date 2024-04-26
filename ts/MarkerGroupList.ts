import { App } from 'obsidian';
import { Utils } from './Utils'
import { DocFolders } from './DocFolders';

export class MarkerGroupList {

    markerFileWithPath : string;
    utils : Utils;
    docFolders : DocFolders;

    constructor(app : App, docFolders : DocFolders) {
        this.markerFileWithPath = `${docFolders.settingsMarkerFolder}/marker-table.md`
        this.utils = new Utils(app);
        this.docFolders = docFolders;
    }

    generateMakerGroupList() {
        //
        // some containers to use later on
        //
        const markerToDocumentMap = new Map<string, Set<string>>();
        const markerToTestDocumentMap = new Map<string, Set<string>>();
        //
        // get all the doc files to scan
        //
        const commentFiles = this.utils.listMDFilesInVault(this.docFolders.settingsCommentFolder);
        const testCommentFiles = this.utils.listMDFilesInVault(this.docFolders.settingsTestCommentFolder);
        //
        // pick up all markers in the doc string doc file by doc file and aggregate the markers
        // before processing them
        //
        const promise: Array<Promise<void>> = new Array<Promise<void>>();
        commentFiles.forEach(commentFile => {
            promise.push(this.utils.fsa.read(commentFile)
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
                        markerSet.forEach(marker => {
                            if (!markerToDocumentMap.has(marker.trim())) {
                                markerToDocumentMap.set(marker, new Set<string>());
                            }
                            markerToDocumentMap.get(marker.trim())?.add(commentFile);
                        });
                    }));
        })
        testCommentFiles.forEach(commentFile => {
            promise.push(this.utils.fsa.read(commentFile)
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
                        markerSet.forEach(marker => {
                            if (!markerToTestDocumentMap.has(marker.trim())) {
                                markerToTestDocumentMap.set(marker, new Set<string>());
                            }
                            markerToTestDocumentMap.get(marker.trim())?.add(commentFile);
                        });
                    }));
        })
        Promise.allSettled(promise)
            .then(value => {
                const allMarkers = Array.from(markerToDocumentMap.keys()).sort();

                var mdString = "Code and Code Story links\n\n";
                mdString = mdString + `|marker|document|\n`;
                mdString = mdString + `|------|--------|\n`;
                allMarkers.forEach(marker => {
                    const docNameSet = markerToDocumentMap.get(marker);
                    //
                    // build marker to doc entry from the set of document names.
                    //
                    docNameSet?.forEach(docName => {
                        mdString = mdString + `|${marker.substring(1)}|[[${docName}#${marker}]]\n`;
                    })
                })

                const allTestMarkers = Array.from(markerToTestDocumentMap.keys()).sort();

                mdString = mdString + "\nTest and Test Story links\n\n";
                mdString = mdString + `|marker|document|\n`;
                mdString = mdString + `|------|--------|\n`;
                allTestMarkers.forEach(marker => {
                    const docNameSet = markerToTestDocumentMap.get(marker);
                    //
                    // build marker to test doc entry from the set of document names.
                    //
                    docNameSet?.forEach(docName => {
                        mdString = mdString + `|${marker.substring(1)}|[[${docName}#${marker}]]\n`;
                    })
                })                
                this.utils.fsa.write(this.markerFileWithPath, mdString);
            })
    }
}