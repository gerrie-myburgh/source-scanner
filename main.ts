import { App, Editor, MarkdownView, Modal, PluginManifest, Plugin, Notice } from 'obsidian';
import { ScannerSettingsTab } from "./ts/ScannerSettingsTab";
import { ScanSource } from './ts/ScanSource'
import { CrossCuttingConcerns } from './ts/CrossCuttingConcerns';
import { MarkerGroupList } from './ts/MarkerGroupList';
import { Utils } from './ts/Utils'

import * as lexer_plugin from "./pkg/obsidian_rust_plugin.js";
import * as lexer_wasm from './pkg/obsidian_rust_plugin_bg.wasm';

import * as fs from 'fs'

interface MyPluginSettings {
	documentPath: string;
	applicationExtension: string;
	sleepLength: number;
	applicationPath: string;
	unitTestPath: string;
	groupBySize: number;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	documentPath: 'UNKNOWN',
	applicationExtension: '.java',
	unitTestPath: "UNKNOWN",
	sleepLength: 0.0,
	applicationPath: 'UNKNOWN',
	groupBySize: 0.0,
}

export default class SourceScanner extends Plugin {
	app: App;
	settings: MyPluginSettings;
	intervalHandle: any = undefined;
	scanSource = new ScanSource();
	utils: Utils;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.app = app;
		this.utils = new Utils(app);
	}

	async onload() {

		await this.loadSettings();

		var sbItem = this.addStatusBarItem()
		sbItem.setText("Comment scanner OFF")

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			'view',
			'Comment Scanner TS', (evt: MouseEvent) => {
				// Called when the user clicks the icon.
				if (this.intervalHandle == undefined) {
					sbItem.setText('Comment scanner ON')
					this.intervalHandle = this.scanSource.init(this.app, this, lexer_plugin.scan_for_comments);
				} else {
					sbItem.setText('Comment scanner OFF')
					clearInterval(this.intervalHandle);
					this.intervalHandle = undefined;
				}
			});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// 
		this.addCommand({
			id: 'source-scanner-solution-files',
			name: 'Create solution files',
			callback: () => {
				if (this.settings.documentPath == 'UNKNOWN') {
					const notice = new Notice('Please configure solution scanner portion before using it.', 0.0);
				} else {
					const docFolders = this.utils.createFolders(this.settings.documentPath);
					const crossCuttingConcerns = new CrossCuttingConcerns(this.app, docFolders);
					crossCuttingConcerns.generateCrossCuttingConcerns();
				}
			}
		});

		// 
		this.addCommand({
			id: 'source-scanner-marker-table',
			name: 'Create marker table',
			callback: () => {
				const docFolders = this.utils.createFolders(this.settings.documentPath);
				const markerGroupList = new MarkerGroupList(this.app, docFolders);
				markerGroupList.generateMakerGroupList();
			}
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});


		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ScannerSettingsTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		
		await lexer_plugin.default(Promise.resolve(lexer_wasm.default));

	}

	onunload() {
		if (this.intervalHandle != undefined) {
			clearInterval(this.intervalHandle);
			this.intervalHandle = undefined;
	    }
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	} 
}

class SampleModal extends Modal { 
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

