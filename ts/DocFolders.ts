export class DocFolders {
    settingsStoryFolder: string;
    settingsSolutionFolder: string;
    settingsMarkerFolder: string;
    settingsCommentFolder: string;
    settingsTestCommentFolder: string;
    settingsUnitTestFolder: string;

    constructor(storyFolder: string, solutionFolder: string, markerMapping: string, commentMapping: string, testCommentMapping: string,
        settingsUnitTestMapping: string) {
        this.settingsStoryFolder = storyFolder;
        this.settingsSolutionFolder = solutionFolder;
        this.settingsMarkerFolder = markerMapping
        this.settingsCommentFolder = commentMapping;
        this.settingsTestCommentFolder = testCommentMapping;
        this.settingsUnitTestFolder = settingsUnitTestMapping;
    }
}