import { createClient, SearchOptions, Error as LdapError, SearchCallbackResponse } from "ldapjs";
import {
	LDAPSearchSettingTab,
	DEFAULT_SETTINGS,
	LDAPSearchSettings,
} from "./settings";
import { Notice, Plugin } from "obsidian";
import { LDAPModal } from "./modal";

import { renderString } from "nunjucks";

export default class LDAPSearch extends Plugin {
	settings: LDAPSearchSettings;

	async onload() {
		await this.loadSettings();
		console.log("LDAP search plugin started");

		this.addCommand({
			id: "ldap-contact-lookup",
			name: "LDAP contact lookup",
			callback: () => {
				this.ldapsearch();
			},
		});

		this.addSettingTab(new LDAPSearchSettingTab(this.app, this));
	}

	async ldapsearch() {
		const client = createClient({
			url: [`ldap://${this.settings.server}:${this.settings.port}`],
		});
		client.bind(this.settings.login, this.settings.password, (err) => {
			if (err) {
				new Notice(`LDAP Bind Error: ${err.message}`);
				console.error("Bind ERROR", err);
			}
		});

		new LDAPModal(this.app, (username) => {
			const fields = this.settings.fields.split(",");
			if (this.settings.photoFlag && !fields.contains(this.settings.photoField)){
				fields.push(this.settings.photoField);
			}

			const opts: SearchOptions = {
				filter: `(sAMAccountname=${username})`, //TODO: Move to settings
				scope: "sub",
				attributes: fields,
			};

			client.search(
				this.settings.baseDN,
				opts,
				(err: LdapError, res: SearchCallbackResponse) => {
					res.on("searchEntry", async (entry) => {
						console.log("Entry finded");
						const myMap: Map<string, string> = new Map<
							string,
							string
						>();
						entry.attributes.forEach(async (element) => {
							if (element.type !== this.settings.photoField) {
								myMap.set(element.type, element.vals[0]);
							}
						});
						if (this.settings.photoFlag) {
							entry.attributes.forEach(async (element) => {
								if (element.type === this.settings.photoField) {
									await app.vault.adapter.writeBinary(`${this.settings.photoPath}/${renderString(this.settings.photoNameTemplate, Object.fromEntries(myMap))}`,
									element.buffers[0]
								);
								}
							});
						}
						console.log(`${this.settings.path}/${renderString(this.settings.fileNameTempalte, Object.fromEntries(myMap))}`);
						await app.vault.adapter.write(`${this.settings.path}/${renderString(this.settings.fileNameTempalte, Object.fromEntries(myMap))}`,
						renderString(
							this.settings.template,
							Object.fromEntries(myMap)
						))
					});
					res.on("error", (err) => {
						new Notice(`LDAP Error: ${err.message}`);
						console.error("error: " + err);
					});
				}
			);
			console.log("LDAP finish");
		}).open();
	}

	onunload() {
		console.log("LDAP Exit");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
