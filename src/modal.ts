import { App, Modal, Setting } from "obsidian";

export class LDAPModal extends Modal {
	username: string;
	onSubmit: (username: string) => void;

	constructor(app: App, onSubmit: (username: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Enter search term" });
		new Setting(contentEl).setName("Search term").addText((text) =>
			text.onChange((value) => {
				this.username = value;
			})
		);
		new Setting(contentEl)
		.addButton((btn) =>
			btn
			.setButtonText("Submit")
			.setCta()
			.onClick(() => {
				this.close();
				this.onSubmit(this.username);
			}));
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
