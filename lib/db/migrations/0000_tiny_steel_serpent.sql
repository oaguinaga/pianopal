CREATE TABLE `chord` (
	`id` text PRIMARY KEY NOT NULL,
	`root` text NOT NULL,
	`type` text NOT NULL,
	`notes` text NOT NULL,
	`midi` text,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorite` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer NOT NULL,
	`item_type` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scale` (
	`id` text PRIMARY KEY NOT NULL,
	`root` text NOT NULL,
	`type` text NOT NULL,
	`notes` text NOT NULL,
	`midi` text,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `setting` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`notation_mode` text DEFAULT 'letter',
	`keyboard_layout` text DEFAULT 'qwerty',
	`show_note_colors` integer DEFAULT true,
	`note_colors` text,
	`updated_at` integer NOT NULL
);
