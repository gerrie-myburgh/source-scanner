import { 
	App, 
	Editor, 
	FileSystemAdapter,
	MarkdownView, 
	Modal, 
	PluginManifest, 
	Plugin, 
	PluginSettingTab,
	Notice } from 'obsidian';

import { ScannerSettingsTab } from "./ts/SettingsTab";
import { CodeScannerTab } from './ts/SettingsTab';
import { ScanSource } from './ts/ScanSource'
import { CrossCuttingConcerns } from './ts/CrossCuttingConcerns';
import { MarkerGroupList } from './ts/MarkerGroupList';
import { Utils } from './ts/Utils'
import { spawn, spawnSync } from "child_process";
import { existsSync } from "fs";

import * as lexer_plugin from "./pkg/obsidian_rust_plugin.js";
import * as lexer_wasm from './pkg/obsidian_rust_plugin_bg.wasm';

import * as fs from 'fs'

interface CodeScannerSettings {
	dir: string;
	work: string;
	start: string;
	path: string;
	extension: string;
	destExtension: string;
}

const CODE_SCANNER_DEFAULT_SETTINGS: CodeScannerSettings = {
	dir: "UNKNOWN",
	work: "UNKNOWN",
	start: "UNKNOWN",
	path: "UNKNOWN",
	extension: "UNKNOWN",
	destExtension: "UNKNOWN",
};

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

const VERSION = "1.0.1";

export default class SourceScanner extends Plugin {
	app: App;
	codeScannerSettings: CodeScannerSettings;
	settings: MyPluginSettings;
	intervalHandle: any = undefined;
	scanSource = new ScanSource();
	utils: Utils;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.app = app;
		this.utils = new Utils(app);
	}

		private getPlatformPathAndName(): [boolean, string?, string?] {
		const platform = process.platform; // e.g., 'darwin', 'win32', 'linux'
		const adapter = this.app.vault.adapter;

		let executablePath = "";
		let workFolder = "";
		if (adapter instanceof FileSystemAdapter) {
			if (platform === "win32") {
				const basePath =
					adapter.getBasePath() +
					"\\" +
					this.app.vault.configDir +
					"\\plugins\\code-scanner-ver2";
				executablePath = basePath + "\\get-comments.exe";
				if (this.codeScannerSettings.work.startsWith("\\")) {
					workFolder = this.codeScannerSettings.work;
				} else {
					workFolder = "\\" + this.codeScannerSettings.work;
				}
			} else if (platform === "darwin") {
				const basePath =
					adapter.getBasePath() +
					"/" +
					this.app.vault.configDir +
					"/plugins/code-scanner-ver2";
				executablePath = basePath + "/get-comments-macos";
				if (this.codeScannerSettings.work.startsWith("/")) {
					workFolder = this.codeScannerSettings.work;
				} else {
					workFolder = "/" + this.codeScannerSettings.work;
				}
			} else if (platform === "linux") {
				const basePath =
					adapter.getBasePath() +
					"/" +
					this.app.vault.configDir +
					"/plugins/code-scanner-ver2";
				executablePath = basePath + "/get-comments-linux";
				if (this.codeScannerSettings.work.startsWith("/")) {
					workFolder = this.codeScannerSettings.work;
				} else {
					workFolder = "/" + this.codeScannerSettings.work;
				}
			} else {
				new InfoModal(
					this.app,
					"Unsupported Platform",
					`Unsupported platform: ${platform}`,
				).open();
				return [false];
			}
			return [true, executablePath, workFolder];
		}
		return [false];
	}

	private async checkCLIVersion(): Promise<void> {
		const parameters = ["-ver"];
		const path = this.getPlatformPathAndName();

		if (path[0]) {
			const executablePath = path[1] as string;
			// Check if executable exists
			if (!existsSync(executablePath)) {
				new InfoModal(
					this.app,
					"Executable Not Found",
					`Executable not found: ${executablePath}`,
				).open();
				console.error(`Executable not found: ${executablePath}`);
			}

			// Now spawn the process
			const result = spawnSync(executablePath, parameters);

			const version = String(result.stdout).trim();
			if (version != VERSION) {
				const modal = new InfoModal(
					this.app,
					"CLI Version mismatch - plugin version is [" +
						VERSION +
						"]",
					`CLI Version: ` + version,
				);
				modal.open();
				await modal.getResult();
				throw new Error("Version mismatch");
			}
		}
	}

	private async triggerScan() {
		if (this.codeScannerSettings.dir == "UNKNOWN") {
			new InfoModal(
				this.app,
				"Configuration Required",
				"Please configure plugin before using",
			).open();
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
			this.codeScannerSettings.destExtension,
		];

		await this.checkCLIVersion()
			.then((data) => {
				const path = this.getPlatformPathAndName();

				if (path[0]) {
					const executablePath = path[1] as string;
					const workFolder = path[2] as string;
					// Check if executable exists
					if (!existsSync(executablePath)) {
						new InfoModal(
							this.app,
							"Executable Not Found",
							`Executable not found: ${executablePath}`,
						).open();
						console.error(
							`Executable not found: ${executablePath}`,
						);
						return;
					}

					if (adapter instanceof FileSystemAdapter) {
						// Now spawn the process
						const workPath = adapter.getBasePath() + workFolder;
						const child = spawn(
							executablePath,
							parameters.concat(["-work", workPath]),
						);

						child.stdout.on("data", (data) => {
							new InfoModal(
								this.app,
								"Process Error",
								`Error: ${data}`,
							).open();
						});

						child.stderr.on("data", (data) => {
							console.error(`stderr: ${data}`);
							new InfoModal(
								this.app,
								"Process Error",
								`Error: ${data}`,
							).open();
						});

						child.on("error", (error) => {
							console.error(`Failed to start process: ${error}`);
							new InfoModal(
								this.app,
								"Process Failed",
								`Failed to start process: ${error.message}`,
							).open();
						});

						child.on("close", (code) => {
							if (code === 0) {
								new InfoModal(
									this.app,
									"Scan Complete",
									"Scan completed successfully",
								).open();
							} else {
								new InfoModal(
									this.app,
									"Scan Failed",
									`Scan failed with exit code ${code}`,
								).open();
							}
						});
					}
				}
			})
			.catch((err) => console.warn("scan code"));
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
class InfoModal extends Modal {
	private resolvePromise: (value: string | null) => void;
	private promise: Promise<string | null>;

	constructor(
		app: App,
		public title: string,
		public message: string,
	) {
		super(app);
		// Create a promise that resolves when modal closes
		this.promise = new Promise((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	onOpen() {
		const { contentEl } = this;

		// Add title
		contentEl.createEl("h2", { text: this.title });

		// Add message
		contentEl.createEl("p", { text: this.message });

		// Add OK button
		const buttonContainer = contentEl.createDiv({
			cls: "modal-button-container",
		});
		const okButton = buttonContainer.createEl("button", { text: "OK" });
		okButton.addEventListener("click", () => {
			this.close();
		});

		// Close on Enter key
		this.scope.register([], "Enter", () => {
			this.close();
			return false;
		});
	}

	// Method to await the result
	getResult(): Promise<string | null> {
		return this.promise;
	}	

}

