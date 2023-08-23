import { App, PluginSettingTab, Setting } from "obsidian";
import LDAPSearch from "./main";

export interface LDAPSearchSettings {
	server: string;
	port: string;
	login: string;
	password: string;
	baseDN: string;
	fileNameTempalte: string;
	template: string;
	fields: string;
	path: string;
	photoPath: string;
	photoFlag: boolean;
	photoNameTemplate: string;
	photoField: string;
}

export const DEFAULT_SETTINGS: LDAPSearchSettings = {
	server: "",
	port: "389",
	login: "",
	password: "",
	baseDN: "",
	fileNameTempalte: "",
	template: "",
	fields: "",
	path: "",
	photoFlag: false,
	photoPath: "",
	photoNameTemplate: "",
	photoField: "thumbnailPhoto"
};

export class LDAPSearchSettingTab extends PluginSettingTab {
	plugin: LDAPSearch;

	constructor(app: App, plugin: LDAPSearch) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "LDAP Search settings." });

		new Setting(containerEl).setName("Login").
		setDesc("Login or BindDN for LDAP server auth").
		addText((text) =>
			text
				.setValue(this.plugin.settings.login)
				.onChange(async (value) => {
					this.plugin.settings.login = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl).setName("Password").
		setDesc("Password for LDAP server auth").
		addText((text) =>
			text
				.setValue(this.plugin.settings.password)
				.onChange(async (value) => {
					this.plugin.settings.password = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl).setName("Host").
		setDesc("LDAP server host").
		addText((text) =>
			text
				.setValue(this.plugin.settings.server)
				.onChange(async (value) => {
					this.plugin.settings.server = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl).setName("Port").
		setDesc("LDAP server port").
		addText((text) =>
			text
				.setValue(this.plugin.settings.port)
				.setPlaceholder("389")
				.onChange(async (value) => {
					this.plugin.settings.port = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl).setName("BaseDN").
		setDesc(createFragment((fragment) => {
			fragment.append(
				"Base object for search. See details ",
				fragment.createEl("a", {
					text: "here",
					href: "https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol#Search_and_compare",
				})
			);
		})).
		addText((text) =>
			text
				.setValue(this.plugin.settings.baseDN)
				.onChange(async (value) => {
					this.plugin.settings.baseDN = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl).setName("Fields").
		setDesc("Comma-separated list of fields to be retrieved from LDAP").
		addText((text) =>
			text
				.setValue(this.plugin.settings.fields)
				.onChange(async (value) => {
					this.plugin.settings.fields = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl).setName("Target folder").
		setDesc("Folder where the contact page will be saved").
		addText((text) => {
			text
				.setValue(this.plugin.settings.path)
				.setPlaceholder("/people")
				.onChange(async (value) => {
					this.plugin.settings.path = value;
					await this.plugin.saveSettings();
				})
		});

		new Setting(containerEl).setName("File name template").
		setDesc(createFragment((fragment) => {
			fragment.append(
				"Template for filling with fields received from LDAP. You can use ",
				fragment.createEl("a", {
					text: "Nunjucks",
					href: "https://mozilla.github.io/nunjucks/templating.html",
				}),
				" library specifications"
			);
		})).
		addText((text)=>{
			text
				.setValue(this.plugin.settings.fileNameTempalte)
				.setPlaceholder("{{ sn }} {{ givenName }}.md")
				.onChange(async (value) => {
					this.plugin.settings.fileNameTempalte = value;
					await this.plugin.saveSettings();
				})
		})

		new Setting(containerEl).setName("Page template").
		setDesc(createFragment((fragment) => {
			fragment.append(
				"Template for filling with fields received from LDAP. You can use ",
				fragment.createEl("a", {
					text: "Nunjucks",
					href: "https://mozilla.github.io/nunjucks/templating.html",
				}),
				" library specifications"
			);
		})).
		addTextArea((text) => {
			text
				.setValue(this.plugin.settings.template)
				.onChange(async (value) => {
					this.plugin.settings.template = value;
					await this.plugin.saveSettings();
				})
			text.inputEl.setAttr("rows", 25);
			text.inputEl.setAttr("cols", 50);
			}
		);

		containerEl.createEl("h5", {
			text: "Advanced Settings",
		});

		new Setting(containerEl)
		.setName("Store photo")
		.setDesc("Enable or disable saving photo from ldap")
		.addToggle((toggle) => {
			toggle.setValue(this.plugin.settings.photoFlag)
			.onChange(async (value) => {
				this.plugin.settings.photoFlag = value;
				await this.plugin.saveSettings();
			})
		})

		new Setting(containerEl)
		.setName("Photo LDAP fields")
		.setDesc("LDAP fields contains photo")
		.addText((text)=>{
			text.setValue(this.plugin.settings.photoField)
			.onChange(async (value) => {
				this.plugin.settings.photoField = value;
				await this.plugin.saveSettings();
			})
		})
		

		new Setting(containerEl)
		.setName("Target folder")
		.setDesc("Folder where the contact photo will be saved")
		.addText((text) => {
			text.setValue(this.plugin.settings.photoPath)
			.onChange(async (value) => {
				this.plugin.settings.photoPath = value;
				await this.plugin.saveSettings();
			})
		});

		new Setting(containerEl)
		.setName("Photo file name template")
		.setDesc(createFragment((fragment)=>{
			fragment.append(
				"Template for photo file name. You can use the same fields as in the page template. The ",
				fragment.createEl("a", {
					text: "Nunjucks",
					href: "https://mozilla.github.io/nunjucks/templating.html",
				}),
				" library is used"
			)
		}))
		.addText((text)=>{
			text.setValue(this.plugin.settings.photoNameTemplate)
			.onChange(async (value) => {
				this.plugin.settings.photoNameTemplate = value;
				await this.plugin.saveSettings();
			})
		})
	}
}
