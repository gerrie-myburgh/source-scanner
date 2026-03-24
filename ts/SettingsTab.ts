import { App, PluginSettingTab, Setting } from "obsidian";
import SourceScanner from "../main";
import { Utils } from "./Utils";
const electron = require('electron').remote 
const dialog = electron.dialog

export class ScannerSettingsTab extends PluginSettingTab {
	plugin: SourceScanner;

	constructor(app: App, plugin: SourceScanner) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
        //
        //bus Make sure that the scanner is switched off before allowing 
        //bus user to update the settings. ^settings-01
        //
        if (this.plugin.intervalHandle) {
            new Setting(containerEl)
                .setName("Scanner is running")
                .setDesc("Please shutdown the scanner before updating the settings");
        } else {

            var appPathSetting = new Setting(containerEl);

            appPathSetting
                .setName("Application Path")
                .setDesc(`Application workspace: ${this.plugin.settings.applicationPath}`)
                .addButton(button =>
                    button
                        .setButtonText("SELECT APPLICATION PATH")
                        .onClick((cb : MouseEvent) =>
                            {
                                dialog.showOpenDialog({properties: ['openDirectory'] })
                                .then(async (result: { canceled: any; filePaths: string[]; }) => {
                                    console.log(result.canceled)
                                    console.log(result.filePaths)
                                    this.plugin.settings.applicationPath = result.filePaths[0];
                                    appPathSetting.setDesc(`Application workspace: ${this.plugin.settings.applicationPath}`)
                                    await this.plugin.saveSettings();
                                  }).catch((err: any) => {
                                    console.log(err)
                                  });
                            }
                        ));

            var testPathSetting = new Setting(containerEl);

            testPathSetting
                .setName("Test Path")
                .setDesc(`Test workspace: ${this.plugin.settings.unitTestPath}`)
                .addButton(button =>
                    button
                        .setButtonText("SELECT UNIT TEST PATH")
                        .onClick((cb : MouseEvent) =>
                            {
                                dialog.showOpenDialog({properties: ['openDirectory'] })
                                .then(async (result: { canceled: any; filePaths: string[]; }) => {
                                    console.log(result.canceled)
                                    console.log(result.filePaths)
                                    this.plugin.settings.unitTestPath = result.filePaths[0];
                                    testPathSetting.setDesc(`Test workspace: ${this.plugin.settings.unitTestPath}`)
                                    await this.plugin.saveSettings();
                                  }).catch((err: any) => {
                                    console.log(err)
                                  });
                            }
                        ));
            

            new Setting(containerEl)
                .setName("Documentation Path")
                .setDesc("Path to document workspace relative from vault")
                .addText(text => text
                        .setPlaceholder("Enter the documentation path")
                        .setValue(this.plugin.settings.documentPath)
                        .onChange(async value =>
                            {
                                this.plugin.settings.documentPath = value;
                                await this.plugin.saveSettings();
                            }
                        )
                        );
                
            new Setting(containerEl)
                .setName("Application type")
                .setDesc("Type of application")
                .addDropdown(dropDown => 
                        dropDown
                            .addOption('.java', 'java')
                            .addOption('.rs', 'rust')
                            .addOption('.c', 'c')
                            .addOption('.c++', 'c++')
                            .addOption('.cpp', 'cpp')
                            .addOption('.cxx', 'cxx')
                            .addOption('.ts', 'typescript')
                            .setValue(this.plugin.settings.applicationExtension)
                            .onChange(async (value) =>	{
                                this.plugin.settings.applicationExtension = value;
                                await this.plugin.saveSettings();
                            })
                    );

            new Setting(containerEl)
                .setName("Activation interval")
                .setDesc("Activation interval in ms")
                .addText(text => text
                        .setPlaceholder("Enter the activation interval")
                        .setValue(this.plugin.settings.sleepLength.toString())
                        .onChange(async value =>
                            {
                                this.plugin.settings.sleepLength = parseInt(value);
                                await this.plugin.saveSettings()
                            }
                        )
                        );

            new Setting(containerEl)
                .setName("Number of source files to process")
                .setDesc("Number of source files to process at a time")
                .addText(text => text
                        .setPlaceholder("Enter the source file processing count")
                        .setValue(this.plugin.settings.groupBySize.toString())
                        .onChange(async value =>
                            {
                                this.plugin.settings.groupBySize = parseInt(value);
                                await this.plugin.saveSettings()
                            }
                        )
                        );
            }
    }
}

export class CodeScannerTab extends PluginSettingTab {
	plugin: SourceScanner;

	constructor(app: App, plugin: SourceScanner) {
		super(app, plugin);
		this.plugin = plugin;
		this.app = app;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Folder")
			.setDesc("Location of text file to scan")
			.addText((text) =>
				text
					.setPlaceholder("Enter your text file start folder")
					.setValue(this.plugin.codeScannerSettings.dir)
					.onChange(async (value) => {
						this.plugin.codeScannerSettings.dir = value;
						await this.plugin.saveSettings();
					}),
			);
		new Setting(containerEl)
			.setName("Working folder")
			.setDesc("Location of md files")
			.addText((text) =>
				text
					.setPlaceholder("Enter your working folder name")
					.setValue(this.plugin.codeScannerSettings.work)
					.onChange(async (value) => {
						this.plugin.codeScannerSettings.work = value;
						await this.plugin.saveSettings();
					}),
			);
		new Setting(containerEl)
			.setName("Start")
			.setDesc("The start of line to extract to md file")
			.addText((text) =>
				text
					.setPlaceholder("Enter your start string")
					.setValue(this.plugin.codeScannerSettings.start)
					.onChange(async (value) => {
						this.plugin.codeScannerSettings.start = value;
						await this.plugin.saveSettings();
					}),
			);
		new Setting(containerEl)
			.setName("Folder structure")
			.setDesc("The folder structure definition")
			.addText((text) =>
				text
					.setPlaceholder(
						"Enter your dot separated folder structure definition",
					)
					.setValue(this.plugin.codeScannerSettings.path)
					.onChange(async (value) => {
						this.plugin.codeScannerSettings.path = value;
						await this.plugin.saveSettings();
					}),
			);
		new Setting(containerEl)
			.setName("Extension")
			.setDesc("Extension of the source text files to scan")
			.addText((text) =>
				text
					.setPlaceholder("Enter your text file extension")
					.setValue(this.plugin.codeScannerSettings.extension)
					.onChange(async (value) => {
						this.plugin.codeScannerSettings.extension = value;
						await this.plugin.saveSettings();
					}),
			);
		new Setting(containerEl)
			.setName("Destination file extension")
			.setDesc(
				"Extension of the destination files into which extracted text goes",
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your destination file extension")
					.setValue(this.plugin.codeScannerSettings.destExtension)
					.onChange(async (value) => {
						this.plugin.codeScannerSettings.destExtension = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}