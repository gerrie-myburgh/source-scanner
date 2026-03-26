import {
	App,
	Editor,
	FileSystemAdapter,
	MarkdownView,
	Modal,
	PluginManifest,
	Plugin,
	PluginSettingTab,
	Notice
} from 'obsidian';

import { ScannerSettingsTab } from "./ts/SettingsTab";
import { ScanSource } from './ts/ScanSource'
import { CrossCuttingConcerns } from './ts/CrossCuttingConcerns';
import { MarkerGroupList } from './ts/MarkerGroupList';
import { Utils } from './ts/Utils'
import { spawn, spawnSync } from "child_process";
import { existsSync } from "fs";

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

	dir: string;
	work: string;
	start: string;
	path: string;
	extension: string;
	destExtension: string;

}

const DEFAULT_SETTINGS: MyPluginSettings = {
	documentPath: 'UNKNOWN',
	applicationExtension: '.java',
	unitTestPath: "UNKNOWN",
	sleepLength: 0.0,
	applicationPath: 'UNKNOWN',
	groupBySize: 0.0,

	dir: "UNKNOWN",
	work: "UNKNOWN",
	start: "UNKNOWN",
	path: "UNKNOWN",
	extension: "UNKNOWN",
	destExtension: "UNKNOWN",
}

const VERSION = "1.0.1";

export class VersionSelectionModal extends Modal {
	private static currentModal: VersionSelectionModal | null = null;
	private resolvePromise: ((value: string) => void) | null = null;
	private rejectPromise: (() => void) | null = null;
	private selectedVersion: string = 'version1';

	private constructor(app: App) {
		super(app);
	}

	static async selectVersion(app: App): Promise<string> {
		// Close any existing modal
		if (VersionSelectionModal.currentModal) {
			VersionSelectionModal.currentModal.close();
		}

		const modal = new VersionSelectionModal(app);
		VersionSelectionModal.currentModal = modal;

		return new Promise((resolve, reject) => {
			modal.resolvePromise = resolve;
			modal.rejectPromise = reject;
			modal.open();
		});
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Select Version' });

		// Create container for radio buttons
		const radioContainer = contentEl.createDiv();
		radioContainer.style.marginBottom = '20px';

		// Version 1 radio
		const version1Container = radioContainer.createDiv();
		version1Container.style.marginBottom = '10px';

		const version1Radio = version1Container.createEl('input', {
			type: 'radio',
			value: 'version1',
			attr: { id: 'version1' }
		});
		version1Container.createEl('label', { text: ' Version1', attr: { for: 'version1' } });

		// Version 2 radio
		const version2Container = radioContainer.createDiv();
		version2Container.style.marginBottom = '10px';

		const version2Radio = version2Container.createEl('input', {
			type: 'radio',
			value: 'version2',
			attr: { id: 'version2' }
		});
		version2Container.createEl('label', { text: ' Version2', attr: { for: 'version2' } });

		// Set default selection
		version1Radio.checked = true;

		// Add event listeners
		version1Radio.addEventListener('change', () => {
			if (version1Radio.checked) this.selectedVersion = 'version1';
		});

		version2Radio.addEventListener('change', () => {
			if (version2Radio.checked) this.selectedVersion = 'version2';
		});

		// Button container
		const buttonContainer = contentEl.createDiv();
		buttonContainer.style.display = 'flex';
		buttonContainer.style.gap = '10px';
		buttonContainer.style.justifyContent = 'flex-end';
		buttonContainer.style.marginTop = '20px';

		// Cancel button
		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelBtn.addEventListener('click', () => {
			this.close();
			if (this.rejectPromise) this.rejectPromise();
		});

		// Submit button
		const submitBtn = buttonContainer.createEl('button', {
			text: 'Submit',
			cls: 'mod-cta'
		});
		submitBtn.addEventListener('click', () => {
			this.close();
			if (this.resolvePromise) this.resolvePromise(this.selectedVersion);
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		VersionSelectionModal.currentModal = null;
	}
}

export default class SourceScanner extends Plugin {
	app: App;
	settings: CodeScannerSettings;
	settings: MyPluginSettings;
	intervalHandle: any = undefined;
	scanSource = new ScanSource();
	utils: Utils;
	version: string;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.app = app;
		this.utils = new Utils(app);
	}

	/**
	 * Checks if an executable exists at the given path.
	 * @param executablePath The path to the executable to check
	 * @returns true if the executable exists, false otherwise
	 */
	private checkExecutableExists(executablePath: string): boolean {
		return existsSync(executablePath);
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
				if (this.settings.work.startsWith("\\")) {
					workFolder = this.settings.work;
				} else {
					workFolder = "\\" + this.settings.work;
				}
			} else if (platform === "darwin") {
				const basePath =
					adapter.getBasePath() +
					"/" +
					this.app.vault.configDir +
					"/plugins/code-scanner-ver2";
				executablePath = basePath + "/get-comments-macos";
				if (this.settings.work.startsWith("/")) {
					workFolder = this.settings.work;
				} else {
					workFolder = "/" + this.settings.work;
				}
			} else if (platform === "linux") {
				const basePath =
					adapter.getBasePath() +
					"/" +
					this.app.vault.configDir +
					"/plugins/code-scanner-ver2";
				executablePath = basePath + "/get-comments-linux";
				if (this.settings.work.startsWith("/")) {
					workFolder = this.settings.work;
				} else {
					workFolder = "/" + this.settings.work;
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
			if (!this.checkExecutableExists(executablePath)) {
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
		if (this.settings.dir == "UNKNOWN") {
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
			this.settings.dir,
			"-start",
			this.settings.start,
			"-path",
			this.settings.path,
			"-ext",
			this.settings.extension,
			"-dest",
			this.settings.destExtension,
		];

		await this.checkCLIVersion()
			.then((data) => {
				const path = this.getPlatformPathAndName();

				if (path[0]) {
					const executablePath = path[1] as string;
					const workFolder = path[2] as string;
					// Check if executable exists
					if (!this.checkExecutableExists(executablePath)) {
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

	async handleVersionSelection(): Promise<string> {
		try {
			const selectedVersion = await VersionSelectionModal.selectVersion(app);
			console.log('Selected:', selectedVersion);
			return selectedVersion;
		} catch (error) {
			console.log('User cancelled');
		}
		return "cancel";
	}

	async onload() {
		await this.loadSettings();

		const path = this.getPlatformPathAndName();
		var version = "";
		if (path[0]) {
			const executablePath = path[1] as string;
			// Check if executable exists
			if (!this.checkExecutableExists(executablePath)) {
				version = "version1";
			}
		}
		if (version === "") {
			version = await this.handleVersionSelection();
		}
		if (version === "cancel") {
			version = "version1"
		}
		this.version = version;

		if (version === "version1") {
			// This adds a settings tab so the user can configure various aspects of the plugin
			// In your main plugin file or command callback

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

			// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
			// Using this function will automatically remove the event listener when this plugin is disabled.
			this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
				console.log('click', evt);
			});

			// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
			this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

			await lexer_plugin.default(Promise.resolve(lexer_wasm.default));
		} else {
			// make sure that the cli exist in the correct place and the versions match
			await this.loadSettings();
			// This creates an icon in the left ribbon.
			this.addRibbonIcon(
				"eye",
				"Scan text files for comment lines",
				async (_evt: MouseEvent) => {
					await this.triggerScan();
				},
			);

			// Add a command to trigger the scan from keyboard
			this.addCommand({
				id: "scan-text-files",
				name: "Scan text files for comment lines",
				callback: async () => {
					await this.triggerScan();
				},
			});

			// This adds a settings tab so the user can configure various aspects of the plugin
			this.addSettingTab(new ScannerSettingsTab(this.app, this, "version2"));
		}
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
