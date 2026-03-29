export class DocFolders {
    settingsStoryFolder: string;
    settingsSolutionFolder: string;
    settingsMarkerFolder: string;
    settingsCommentFolder: string;
    settingsTestCommentFolder: string;
    settingsUnitTestFolder: string;

    /**
     * Creates a new DocFolders instance with folder paths for documentation organization
     * @param storyFolder - Path for story documents
     * @param solutionFolder - Path for solution documents
     * @param markerMapping - Path for marker mapping documents
     * @param commentMapping - Path for comment documents
     * @param testCommentMapping - Path for test comment documents
     * @param settingsUnitTestMapping - Path for unit test documents
     */
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
