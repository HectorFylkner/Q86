CREATE TABLE `assistance_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_uid` text NOT NULL,
	`concept_id` text NOT NULL,
	`misconception_id` text,
	`learning_attempt_id` integer,
	`question_attempt_id` integer,
	`session_item_id` integer,
	`kind` text NOT NULL,
	`hint_level` integer,
	`details` text DEFAULT '{}' NOT NULL,
	`occurred_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`learning_attempt_id`) REFERENCES `concept_learning_attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_item_id`) REFERENCES `session_items`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "assistance_event_kind_check" CHECK("assistance_events"."kind" in ('hint_opened', 'hint_applied', 'worked_solution_revealed', 'tutor_intervention')),
	CONSTRAINT "assistance_event_subject_check" CHECK("assistance_events"."learning_attempt_id" is not null or "assistance_events"."question_attempt_id" is not null or "assistance_events"."session_item_id" is not null),
	CONSTRAINT "assistance_event_hint_level_check" CHECK("assistance_events"."hint_level" is null or "assistance_events"."hint_level" between 1 and 5)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assistance_event_uid_idx` ON `assistance_events` (`event_uid`);--> statement-breakpoint
CREATE INDEX `assistance_concept_time_idx` ON `assistance_events` (`concept_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `assistance_learning_attempt_idx` ON `assistance_events` (`learning_attempt_id`);--> statement-breakpoint
CREATE INDEX `assistance_question_attempt_idx` ON `assistance_events` (`question_attempt_id`);--> statement-breakpoint
CREATE TABLE `concept_certification_transitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transition_uid` text NOT NULL,
	`concept_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`from_status` text NOT NULL,
	`to_status` text NOT NULL,
	`event_type` text NOT NULL,
	`evidence_session_id` integer,
	`evidence` text DEFAULT '{}' NOT NULL,
	`occurred_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`evidence_session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "concept_certification_sequence_check" CHECK("concept_certification_transitions"."sequence" >= 0),
	CONSTRAINT "concept_certification_from_status_check" CHECK("concept_certification_transitions"."from_status" in ('unproven', 'accuracy_proven', 'certified', 'recertification_required', 'recertifying')),
	CONSTRAINT "concept_certification_to_status_check" CHECK("concept_certification_transitions"."to_status" in ('unproven', 'accuracy_proven', 'certified', 'recertification_required', 'recertifying')),
	CONSTRAINT "concept_certification_event_type_check" CHECK("concept_certification_transitions"."event_type" in ('accuracy_passed', 'timed_transfer_passed', 'stale', 'evidence_slipped', 'recertification_started', 'recertification_passed', 'recertification_failed'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `concept_certification_transition_uid_idx` ON `concept_certification_transitions` (`transition_uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `concept_certification_sequence_idx` ON `concept_certification_transitions` (`concept_id`,`sequence`);--> statement-breakpoint
CREATE INDEX `concept_certification_time_idx` ON `concept_certification_transitions` (`concept_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `concept_learning_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attempt_uid` text NOT NULL,
	`session_id` integer,
	`concept_id` text NOT NULL,
	`item_uid` text NOT NULL,
	`item_content_version` integer NOT NULL,
	`item_kind` text NOT NULL,
	`original_answer` text,
	`original_method` text,
	`declared_unknown` integer DEFAULT false NOT NULL,
	`highest_hint_level` integer DEFAULT 0 NOT NULL,
	`correction` text,
	`final_answer` text,
	`initial_correct` integer NOT NULL,
	`final_correct` integer NOT NULL,
	`time_seconds` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "concept_learning_item_version_check" CHECK("concept_learning_attempts"."item_content_version" >= 1),
	CONSTRAINT "concept_learning_item_kind_check" CHECK("concept_learning_attempts"."item_kind" in ('example', 'check')),
	CONSTRAINT "concept_learning_original_commitment_check" CHECK("concept_learning_attempts"."declared_unknown" = 1 or ("concept_learning_attempts"."original_answer" is not null and length(trim("concept_learning_attempts"."original_answer")) > 0)),
	CONSTRAINT "concept_learning_unknown_correctness_check" CHECK(not ("concept_learning_attempts"."declared_unknown" = 1 and "concept_learning_attempts"."initial_correct" = 1)),
	CONSTRAINT "concept_learning_hint_level_check" CHECK("concept_learning_attempts"."highest_hint_level" between 0 and 5),
	CONSTRAINT "concept_learning_final_answer_check" CHECK("concept_learning_attempts"."final_correct" = 0 or ("concept_learning_attempts"."final_answer" is not null and length(trim("concept_learning_attempts"."final_answer")) > 0)),
	CONSTRAINT "concept_learning_time_check" CHECK("concept_learning_attempts"."time_seconds" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `concept_learning_attempt_uid_idx` ON `concept_learning_attempts` (`attempt_uid`);--> statement-breakpoint
CREATE INDEX `concept_learning_item_idx` ON `concept_learning_attempts` (`concept_id`,`item_uid`,`created_at`);--> statement-breakpoint
CREATE INDEX `concept_learning_session_idx` ON `concept_learning_attempts` (`session_id`);--> statement-breakpoint
CREATE TABLE `concept_remediations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`remediation_uid` text NOT NULL,
	`concept_id` text NOT NULL,
	`misconception_id` text,
	`source_question_attempt_id` integer,
	`source_learning_attempt_id` integer,
	`source_certification_transition_id` integer,
	`trigger` text NOT NULL,
	`action_type` text NOT NULL,
	`action_target_id` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`priority` integer DEFAULT 3 NOT NULL,
	`rationale_md` text NOT NULL,
	`due_at` integer,
	`resolved_at` integer,
	`resolution_evidence` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`source_question_attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_learning_attempt_id`) REFERENCES `concept_learning_attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_certification_transition_id`) REFERENCES `concept_certification_transitions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "concept_remediation_trigger_check" CHECK("concept_remediations"."trigger" in ('wrong', 'slow', 'hinted', 'low_confidence', 'changed_from_correct', 'retention_slip', 'stale', 'manual')),
	CONSTRAINT "concept_remediation_action_check" CHECK("concept_remediations"."action_type" in ('review_concept', 'review_misconception', 'retry_check', 'targeted_practice', 'retrieval_card', 'recertify_concept')),
	CONSTRAINT "concept_remediation_status_check" CHECK("concept_remediations"."status" in ('open', 'in_progress', 'resolved', 'dismissed')),
	CONSTRAINT "concept_remediation_priority_check" CHECK("concept_remediations"."priority" between 1 and 5),
	CONSTRAINT "concept_remediation_source_check" CHECK("concept_remediations"."trigger" = 'manual' or "concept_remediations"."source_question_attempt_id" is not null or "concept_remediations"."source_learning_attempt_id" is not null or "concept_remediations"."source_certification_transition_id" is not null),
	CONSTRAINT "concept_remediation_resolution_check" CHECK((("concept_remediations"."status" in ('resolved', 'dismissed')) and "concept_remediations"."resolved_at" is not null)
        or (("concept_remediations"."status" in ('open', 'in_progress')) and "concept_remediations"."resolved_at" is null))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `concept_remediation_uid_idx` ON `concept_remediations` (`remediation_uid`);--> statement-breakpoint
CREATE INDEX `concept_remediation_queue_idx` ON `concept_remediations` (`status`,`due_at`,`priority`);--> statement-breakpoint
CREATE INDEX `concept_remediation_concept_idx` ON `concept_remediations` (`concept_id`,`status`);--> statement-breakpoint
CREATE TABLE `distractor_misconception_mappings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`question_uid` text NOT NULL,
	`question_content_version` integer NOT NULL,
	`canonical_choice_index` integer NOT NULL,
	`concept_id` text NOT NULL,
	`misconception_id` text NOT NULL,
	`mapping_version` integer NOT NULL,
	`editorial_state` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "distractor_choice_index_check" CHECK("distractor_misconception_mappings"."canonical_choice_index" between 0 and 4),
	CONSTRAINT "distractor_question_content_version_check" CHECK("distractor_misconception_mappings"."question_content_version" >= 1),
	CONSTRAINT "distractor_mapping_version_check" CHECK("distractor_misconception_mappings"."mapping_version" >= 1),
	CONSTRAINT "distractor_editorial_state_check" CHECK("distractor_misconception_mappings"."editorial_state" in ('draft', 'reviewed', 'approved', 'retired'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `distractor_misconception_version_idx` ON `distractor_misconception_mappings` (`question_uid`,`question_content_version`,`canonical_choice_index`,`mapping_version`);--> statement-breakpoint
CREATE INDEX `distractor_misconception_idx` ON `distractor_misconception_mappings` (`misconception_id`);--> statement-breakpoint
CREATE TABLE `question_concept_mappings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`question_uid` text NOT NULL,
	`question_content_version` integer NOT NULL,
	`concept_id` text NOT NULL,
	`role` text NOT NULL,
	`archetype_id` text NOT NULL,
	`surface_form_id` text NOT NULL,
	`mapping_version` integer NOT NULL,
	`editorial_state` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "question_concept_content_version_check" CHECK("question_concept_mappings"."question_content_version" >= 1),
	CONSTRAINT "question_concept_mapping_version_check" CHECK("question_concept_mappings"."mapping_version" >= 1),
	CONSTRAINT "question_concept_role_check" CHECK("question_concept_mappings"."role" in ('primary', 'secondary')),
	CONSTRAINT "question_concept_editorial_state_check" CHECK("question_concept_mappings"."editorial_state" in ('draft', 'reviewed', 'approved', 'retired'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_concept_mapping_version_idx` ON `question_concept_mappings` (`question_uid`,`question_content_version`,`concept_id`,`mapping_version`);--> statement-breakpoint
CREATE UNIQUE INDEX `question_concept_primary_version_idx` ON `question_concept_mappings` (`question_uid`,`question_content_version`,`mapping_version`) WHERE "question_concept_mappings"."role" = 'primary';--> statement-breakpoint
CREATE INDEX `question_concept_concept_idx` ON `question_concept_mappings` (`concept_id`,`editorial_state`);--> statement-breakpoint
CREATE TABLE `session_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`position` integer NOT NULL,
	`question_id` integer NOT NULL,
	`question_uid` text NOT NULL,
	`question_content_version` integer NOT NULL,
	`blueprint_slot` text NOT NULL,
	`choice_order_algorithm` text NOT NULL,
	`display_to_canonical` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "session_items_position_check" CHECK("session_items"."position" >= 0),
	CONSTRAINT "session_items_content_version_check" CHECK("session_items"."question_content_version" >= 1),
	CONSTRAINT "session_items_choice_order_check" CHECK(json_valid("session_items"."display_to_canonical")
        and json_array_length("session_items"."display_to_canonical") = 5
        and json_extract("session_items"."display_to_canonical", '$[0]') between 0 and 4
        and json_extract("session_items"."display_to_canonical", '$[1]') between 0 and 4
        and json_extract("session_items"."display_to_canonical", '$[2]') between 0 and 4
        and json_extract("session_items"."display_to_canonical", '$[3]') between 0 and 4
        and json_extract("session_items"."display_to_canonical", '$[4]') between 0 and 4
        and json_extract("session_items"."display_to_canonical", '$[0]') != json_extract("session_items"."display_to_canonical", '$[1]')
        and json_extract("session_items"."display_to_canonical", '$[0]') != json_extract("session_items"."display_to_canonical", '$[2]')
        and json_extract("session_items"."display_to_canonical", '$[0]') != json_extract("session_items"."display_to_canonical", '$[3]')
        and json_extract("session_items"."display_to_canonical", '$[0]') != json_extract("session_items"."display_to_canonical", '$[4]')
        and json_extract("session_items"."display_to_canonical", '$[1]') != json_extract("session_items"."display_to_canonical", '$[2]')
        and json_extract("session_items"."display_to_canonical", '$[1]') != json_extract("session_items"."display_to_canonical", '$[3]')
        and json_extract("session_items"."display_to_canonical", '$[1]') != json_extract("session_items"."display_to_canonical", '$[4]')
        and json_extract("session_items"."display_to_canonical", '$[2]') != json_extract("session_items"."display_to_canonical", '$[3]')
        and json_extract("session_items"."display_to_canonical", '$[2]') != json_extract("session_items"."display_to_canonical", '$[4]')
        and json_extract("session_items"."display_to_canonical", '$[3]') != json_extract("session_items"."display_to_canonical", '$[4]'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_items_position_idx` ON `session_items` (`session_id`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_items_question_idx` ON `session_items` (`session_id`,`question_uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_items_blueprint_slot_idx` ON `session_items` (`session_id`,`blueprint_slot`);--> statement-breakpoint
ALTER TABLE `attempts` ADD `error_concept_id` text;--> statement-breakpoint
ALTER TABLE `attempts` ADD `misconception_id` text;--> statement-breakpoint
CREATE INDEX `attempts_error_concept_idx` ON `attempts` (`error_concept_id`);--> statement-breakpoint
CREATE INDEX `attempts_misconception_idx` ON `attempts` (`misconception_id`);--> statement-breakpoint
CREATE TRIGGER `question_concept_identity_insert`
BEFORE INSERT ON `question_concept_mappings`
WHEN NOT EXISTS (
  SELECT 1 FROM `questions` q
  WHERE q.`id` = NEW.`question_id`
    AND q.`uid` = NEW.`question_uid`
    AND (
      q.`content_version` = NEW.`question_content_version`
      OR EXISTS (
        SELECT 1 FROM `question_revisions` qr
        WHERE qr.`question_id` = q.`id`
          AND qr.`content_version` = NEW.`question_content_version`
      )
    )
)
BEGIN
  SELECT RAISE(ABORT, 'question concept mapping identity/version mismatch');
END;--> statement-breakpoint
CREATE TRIGGER `question_concept_identity_update`
BEFORE UPDATE OF `question_id`, `question_uid`, `question_content_version`
ON `question_concept_mappings`
WHEN NOT EXISTS (
  SELECT 1 FROM `questions` q
  WHERE q.`id` = NEW.`question_id`
    AND q.`uid` = NEW.`question_uid`
    AND (
      q.`content_version` = NEW.`question_content_version`
      OR EXISTS (
        SELECT 1 FROM `question_revisions` qr
        WHERE qr.`question_id` = q.`id`
          AND qr.`content_version` = NEW.`question_content_version`
      )
    )
)
BEGIN
  SELECT RAISE(ABORT, 'question concept mapping identity/version mismatch');
END;--> statement-breakpoint
CREATE TRIGGER `distractor_misconception_integrity_insert`
BEFORE INSERT ON `distractor_misconception_mappings`
WHEN NOT EXISTS (
  SELECT 1 FROM `questions` q
  WHERE q.`id` = NEW.`question_id`
    AND q.`uid` = NEW.`question_uid`
    AND q.`correct_index` != NEW.`canonical_choice_index`
    AND (
      q.`content_version` = NEW.`question_content_version`
      OR EXISTS (
        SELECT 1 FROM `question_revisions` qr
        WHERE qr.`question_id` = q.`id`
          AND qr.`content_version` = NEW.`question_content_version`
      )
    )
)
OR NOT EXISTS (
  SELECT 1 FROM `question_concept_mappings` qcm
  WHERE qcm.`question_id` = NEW.`question_id`
    AND qcm.`question_uid` = NEW.`question_uid`
    AND qcm.`question_content_version` = NEW.`question_content_version`
    AND qcm.`concept_id` = NEW.`concept_id`
    AND qcm.`mapping_version` = NEW.`mapping_version`
)
BEGIN
  SELECT RAISE(ABORT, 'distractor mapping is not a valid mapped-question distractor');
END;--> statement-breakpoint
CREATE TRIGGER `distractor_misconception_integrity_update`
BEFORE UPDATE OF `question_id`, `question_uid`, `question_content_version`, `canonical_choice_index`, `concept_id`, `mapping_version`
ON `distractor_misconception_mappings`
WHEN NOT EXISTS (
  SELECT 1 FROM `questions` q
  WHERE q.`id` = NEW.`question_id`
    AND q.`uid` = NEW.`question_uid`
    AND q.`correct_index` != NEW.`canonical_choice_index`
    AND (
      q.`content_version` = NEW.`question_content_version`
      OR EXISTS (
        SELECT 1 FROM `question_revisions` qr
        WHERE qr.`question_id` = q.`id`
          AND qr.`content_version` = NEW.`question_content_version`
      )
    )
)
OR NOT EXISTS (
  SELECT 1 FROM `question_concept_mappings` qcm
  WHERE qcm.`question_id` = NEW.`question_id`
    AND qcm.`question_uid` = NEW.`question_uid`
    AND qcm.`question_content_version` = NEW.`question_content_version`
    AND qcm.`concept_id` = NEW.`concept_id`
    AND qcm.`mapping_version` = NEW.`mapping_version`
)
BEGIN
  SELECT RAISE(ABORT, 'distractor mapping is not a valid mapped-question distractor');
END;--> statement-breakpoint
CREATE TRIGGER `session_item_identity_insert`
BEFORE INSERT ON `session_items`
WHEN NOT EXISTS (
  SELECT 1 FROM `questions` q
  WHERE q.`id` = NEW.`question_id`
    AND q.`uid` = NEW.`question_uid`
    AND (
      q.`content_version` = NEW.`question_content_version`
      OR EXISTS (
        SELECT 1 FROM `question_revisions` qr
        WHERE qr.`question_id` = q.`id`
          AND qr.`content_version` = NEW.`question_content_version`
      )
    )
)
BEGIN
  SELECT RAISE(ABORT, 'session item identity/version mismatch');
END;--> statement-breakpoint
CREATE TRIGGER `session_item_immutable_update`
BEFORE UPDATE ON `session_items`
BEGIN
  SELECT RAISE(ABORT, 'session items are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `session_item_immutable_delete`
BEFORE DELETE ON `session_items`
BEGIN
  SELECT RAISE(ABORT, 'session items are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `concept_learning_attempt_immutable_update`
BEFORE UPDATE ON `concept_learning_attempts`
BEGIN
  SELECT RAISE(ABORT, 'concept learning attempts are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `concept_learning_attempt_immutable_delete`
BEFORE DELETE ON `concept_learning_attempts`
BEGIN
  SELECT RAISE(ABORT, 'concept learning attempts are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `assistance_event_immutable_update`
BEFORE UPDATE ON `assistance_events`
BEGIN
  SELECT RAISE(ABORT, 'assistance events are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `assistance_event_immutable_delete`
BEFORE DELETE ON `assistance_events`
BEGIN
  SELECT RAISE(ABORT, 'assistance events are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `concept_certification_chain_insert`
BEFORE INSERT ON `concept_certification_transitions`
WHEN (
  NEW.`sequence` = 0
  AND (
    NEW.`from_status` != 'unproven'
    OR EXISTS (
      SELECT 1 FROM `concept_certification_transitions` cct
      WHERE cct.`concept_id` = NEW.`concept_id`
    )
  )
)
OR (
  NEW.`sequence` > 0
  AND NOT EXISTS (
    SELECT 1 FROM `concept_certification_transitions` cct
    WHERE cct.`concept_id` = NEW.`concept_id`
      AND cct.`sequence` = NEW.`sequence` - 1
      AND cct.`to_status` = NEW.`from_status`
  )
)
BEGIN
  SELECT RAISE(ABORT, 'concept certification transition is not contiguous');
END;--> statement-breakpoint
CREATE TRIGGER `concept_certification_immutable_update`
BEFORE UPDATE ON `concept_certification_transitions`
BEGIN
  SELECT RAISE(ABORT, 'concept certification transitions are append-only');
END;--> statement-breakpoint
CREATE TRIGGER `concept_certification_immutable_delete`
BEFORE DELETE ON `concept_certification_transitions`
BEGIN
  SELECT RAISE(ABORT, 'concept certification transitions are append-only');
END;
