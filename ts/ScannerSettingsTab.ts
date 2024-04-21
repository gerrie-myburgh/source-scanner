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
                .setDesc("Type of application (.java .js etc)")
                .addDropdown(dropDown => 
                        dropDown
                            .addOption('.java', 'java')
                            .setValue('.java')
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