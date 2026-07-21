import type { Client } from "@libsql/client";

/**
 * Guarded mirror of drizzle/0006_concept_evidence.sql for databases created
 * with `db:push` before Q86 had a migration ledger. Every statement is safe to
 * repeat; identity/history columns are added only after PRAGMA inspection.
 */
export async function evolveConceptEvidenceSchema(client: Client): Promise<void> {
  const attemptColumns = await client.execute("pragma table_info('attempts')");
  const attemptColumnNames = new Set(
    attemptColumns.rows.map((row) => String(row.name)),
  );
  if (!attemptColumnNames.has("error_concept_id")) {
    await client.execute("alter table attempts add column error_concept_id text");
  }
  if (!attemptColumnNames.has("misconception_id")) {
    await client.execute("alter table attempts add column misconception_id text");
  }

  for (const statement of CONCEPT_EVIDENCE_DDL) {
    await client.execute(statement);
  }
}

const CONCEPT_EVIDENCE_DDL = [
  `create index if not exists attempts_error_concept_idx
    on attempts (error_concept_id)`,
  `create index if not exists attempts_misconception_idx
    on attempts (misconception_id)`,
  `create table if not exists question_concept_mappings (
    id integer primary key autoincrement not null,
    question_id integer not null,
    question_uid text not null,
    question_content_version integer not null,
    concept_id text not null,
    role text not null,
    archetype_id text not null,
    surface_form_id text not null,
    mapping_version integer not null,
    editorial_state text not null,
    created_at integer default (unixepoch() * 1000) not null,
    foreign key (question_id) references questions(id),
    constraint question_concept_content_version_check
      check(question_content_version >= 1),
    constraint question_concept_mapping_version_check
      check(mapping_version >= 1),
    constraint question_concept_role_check
      check(role in ('primary', 'secondary')),
    constraint question_concept_editorial_state_check
      check(editorial_state in ('draft', 'reviewed', 'approved', 'retired'))
  )`,
  `create unique index if not exists question_concept_mapping_version_idx
    on question_concept_mappings
      (question_uid, question_content_version, concept_id, mapping_version)`,
  `create unique index if not exists question_concept_primary_version_idx
    on question_concept_mappings
      (question_uid, question_content_version, mapping_version)
    where role = 'primary'`,
  `create index if not exists question_concept_concept_idx
    on question_concept_mappings (concept_id, editorial_state)`,
  `create table if not exists distractor_misconception_mappings (
    id integer primary key autoincrement not null,
    question_id integer not null,
    question_uid text not null,
    question_content_version integer not null,
    canonical_choice_index integer not null,
    concept_id text not null,
    misconception_id text not null,
    mapping_version integer not null,
    editorial_state text not null,
    created_at integer default (unixepoch() * 1000) not null,
    foreign key (question_id) references questions(id),
    constraint distractor_choice_index_check
      check(canonical_choice_index between 0 and 4),
    constraint distractor_question_content_version_check
      check(question_content_version >= 1),
    constraint distractor_mapping_version_check
      check(mapping_version >= 1),
    constraint distractor_editorial_state_check
      check(editorial_state in ('draft', 'reviewed', 'approved', 'retired'))
  )`,
  `create unique index if not exists distractor_misconception_version_idx
    on distractor_misconception_mappings
      (question_uid, question_content_version, canonical_choice_index, mapping_version)`,
  `create index if not exists distractor_misconception_idx
    on distractor_misconception_mappings (misconception_id)`,
  `create table if not exists session_items (
    id integer primary key autoincrement not null,
    session_id integer not null,
    position integer not null,
    question_id integer not null,
    question_uid text not null,
    question_content_version integer not null,
    blueprint_slot text not null,
    choice_order_algorithm text not null,
    display_to_canonical text not null,
    created_at integer default (unixepoch() * 1000) not null,
    foreign key (session_id) references sessions(id),
    foreign key (question_id) references questions(id),
    constraint session_items_position_check check(position >= 0),
    constraint session_items_content_version_check
      check(question_content_version >= 1),
    constraint session_items_choice_order_check check(
      json_valid(display_to_canonical)
      and json_array_length(display_to_canonical) = 5
      and json_extract(display_to_canonical, '$[0]') between 0 and 4
      and json_extract(display_to_canonical, '$[1]') between 0 and 4
      and json_extract(display_to_canonical, '$[2]') between 0 and 4
      and json_extract(display_to_canonical, '$[3]') between 0 and 4
      and json_extract(display_to_canonical, '$[4]') between 0 and 4
      and json_extract(display_to_canonical, '$[0]') != json_extract(display_to_canonical, '$[1]')
      and json_extract(display_to_canonical, '$[0]') != json_extract(display_to_canonical, '$[2]')
      and json_extract(display_to_canonical, '$[0]') != json_extract(display_to_canonical, '$[3]')
      and json_extract(display_to_canonical, '$[0]') != json_extract(display_to_canonical, '$[4]')
      and json_extract(display_to_canonical, '$[1]') != json_extract(display_to_canonical, '$[2]')
      and json_extract(display_to_canonical, '$[1]') != json_extract(display_to_canonical, '$[3]')
      and json_extract(display_to_canonical, '$[1]') != json_extract(display_to_canonical, '$[4]')
      and json_extract(display_to_canonical, '$[2]') != json_extract(display_to_canonical, '$[3]')
      and json_extract(display_to_canonical, '$[2]') != json_extract(display_to_canonical, '$[4]')
      and json_extract(display_to_canonical, '$[3]') != json_extract(display_to_canonical, '$[4]')
    )
  )`,
  `create unique index if not exists session_items_position_idx
    on session_items (session_id, position)`,
  `create unique index if not exists session_items_question_idx
    on session_items (session_id, question_uid)`,
  `create unique index if not exists session_items_blueprint_slot_idx
    on session_items (session_id, blueprint_slot)`,
  `create table if not exists concept_learning_attempts (
    id integer primary key autoincrement not null,
    attempt_uid text not null,
    session_id integer,
    concept_id text not null,
    item_uid text not null,
    item_content_version integer not null,
    item_kind text not null,
    original_answer text,
    original_method text,
    declared_unknown integer default false not null,
    highest_hint_level integer default 0 not null,
    correction text,
    final_answer text,
    initial_correct integer not null,
    final_correct integer not null,
    time_seconds real not null,
    created_at integer default (unixepoch() * 1000) not null,
    foreign key (session_id) references sessions(id),
    constraint concept_learning_item_version_check
      check(item_content_version >= 1),
    constraint concept_learning_item_kind_check
      check(item_kind in ('example', 'check')),
    constraint concept_learning_original_commitment_check
      check(declared_unknown = 1 or
        (original_answer is not null and length(trim(original_answer)) > 0)),
    constraint concept_learning_unknown_correctness_check
      check(not (declared_unknown = 1 and initial_correct = 1)),
    constraint concept_learning_hint_level_check
      check(highest_hint_level between 0 and 5),
    constraint concept_learning_final_answer_check
      check(final_correct = 0 or
        (final_answer is not null and length(trim(final_answer)) > 0)),
    constraint concept_learning_time_check check(time_seconds >= 0)
  )`,
  `create unique index if not exists concept_learning_attempt_uid_idx
    on concept_learning_attempts (attempt_uid)`,
  `create index if not exists concept_learning_item_idx
    on concept_learning_attempts (concept_id, item_uid, created_at)`,
  `create index if not exists concept_learning_session_idx
    on concept_learning_attempts (session_id)`,
  `create table if not exists assistance_events (
    id integer primary key autoincrement not null,
    event_uid text not null,
    concept_id text not null,
    misconception_id text,
    learning_attempt_id integer,
    question_attempt_id integer,
    session_item_id integer,
    kind text not null,
    hint_level integer,
    details text default '{}' not null,
    occurred_at integer default (unixepoch() * 1000) not null,
    foreign key (learning_attempt_id) references concept_learning_attempts(id),
    foreign key (question_attempt_id) references attempts(id),
    foreign key (session_item_id) references session_items(id),
    constraint assistance_event_kind_check
      check(kind in ('hint_opened', 'hint_applied', 'worked_solution_revealed', 'tutor_intervention')),
    constraint assistance_event_subject_check
      check(learning_attempt_id is not null or question_attempt_id is not null
        or session_item_id is not null),
    constraint assistance_event_hint_level_check
      check(hint_level is null or hint_level between 1 and 5)
  )`,
  `create unique index if not exists assistance_event_uid_idx
    on assistance_events (event_uid)`,
  `create index if not exists assistance_concept_time_idx
    on assistance_events (concept_id, occurred_at)`,
  `create index if not exists assistance_learning_attempt_idx
    on assistance_events (learning_attempt_id)`,
  `create index if not exists assistance_question_attempt_idx
    on assistance_events (question_attempt_id)`,
  `create table if not exists concept_certification_transitions (
    id integer primary key autoincrement not null,
    transition_uid text not null,
    concept_id text not null,
    sequence integer not null,
    from_status text not null,
    to_status text not null,
    event_type text not null,
    evidence_session_id integer,
    evidence text default '{}' not null,
    occurred_at integer default (unixepoch() * 1000) not null,
    foreign key (evidence_session_id) references sessions(id),
    constraint concept_certification_sequence_check check(sequence >= 0),
    constraint concept_certification_from_status_check check(from_status in
      ('unproven', 'accuracy_proven', 'certified', 'recertification_required', 'recertifying')),
    constraint concept_certification_to_status_check check(to_status in
      ('unproven', 'accuracy_proven', 'certified', 'recertification_required', 'recertifying')),
    constraint concept_certification_event_type_check check(event_type in
      ('accuracy_passed', 'timed_transfer_passed', 'stale', 'evidence_slipped',
       'recertification_started', 'recertification_passed', 'recertification_failed'))
  )`,
  `create unique index if not exists concept_certification_transition_uid_idx
    on concept_certification_transitions (transition_uid)`,
  `create unique index if not exists concept_certification_sequence_idx
    on concept_certification_transitions (concept_id, sequence)`,
  `create index if not exists concept_certification_time_idx
    on concept_certification_transitions (concept_id, occurred_at)`,
  `create table if not exists concept_remediations (
    id integer primary key autoincrement not null,
    remediation_uid text not null,
    concept_id text not null,
    misconception_id text,
    source_question_attempt_id integer,
    source_learning_attempt_id integer,
    source_certification_transition_id integer,
    trigger text not null,
    action_type text not null,
    action_target_id text not null,
    status text default 'open' not null,
    priority integer default 3 not null,
    rationale_md text not null,
    due_at integer,
    resolved_at integer,
    resolution_evidence text,
    created_at integer default (unixepoch() * 1000) not null,
    updated_at integer default (unixepoch() * 1000) not null,
    foreign key (source_question_attempt_id) references attempts(id),
    foreign key (source_learning_attempt_id) references concept_learning_attempts(id),
    foreign key (source_certification_transition_id)
      references concept_certification_transitions(id),
    constraint concept_remediation_trigger_check check(trigger in
      ('wrong', 'slow', 'hinted', 'low_confidence', 'changed_from_correct',
       'retention_slip', 'stale', 'manual')),
    constraint concept_remediation_action_check check(action_type in
      ('review_concept', 'review_misconception', 'retry_check',
       'targeted_practice', 'retrieval_card', 'recertify_concept')),
    constraint concept_remediation_status_check
      check(status in ('open', 'in_progress', 'resolved', 'dismissed')),
    constraint concept_remediation_priority_check check(priority between 1 and 5),
    constraint concept_remediation_source_check check(trigger = 'manual'
      or source_question_attempt_id is not null
      or source_learning_attempt_id is not null
      or source_certification_transition_id is not null),
    constraint concept_remediation_resolution_check check(
      (status in ('resolved', 'dismissed') and resolved_at is not null)
      or (status in ('open', 'in_progress') and resolved_at is null)
    )
  )`,
  `create unique index if not exists concept_remediation_uid_idx
    on concept_remediations (remediation_uid)`,
  `create index if not exists concept_remediation_queue_idx
    on concept_remediations (status, due_at, priority)`,
  `create index if not exists concept_remediation_concept_idx
    on concept_remediations (concept_id, status)`,
  `create trigger if not exists question_concept_identity_insert
    before insert on question_concept_mappings
    when not exists (
      select 1 from questions q
      where q.id = new.question_id and q.uid = new.question_uid
        and (q.content_version = new.question_content_version or exists (
          select 1 from question_revisions qr
          where qr.question_id = q.id
            and qr.content_version = new.question_content_version
        ))
    )
    begin
      select raise(abort, 'question concept mapping identity/version mismatch');
    end`,
  `create trigger if not exists question_concept_identity_update
    before update of question_id, question_uid, question_content_version
    on question_concept_mappings
    when not exists (
      select 1 from questions q
      where q.id = new.question_id and q.uid = new.question_uid
        and (q.content_version = new.question_content_version or exists (
          select 1 from question_revisions qr
          where qr.question_id = q.id
            and qr.content_version = new.question_content_version
        ))
    )
    begin
      select raise(abort, 'question concept mapping identity/version mismatch');
    end`,
  `create trigger if not exists distractor_misconception_integrity_insert
    before insert on distractor_misconception_mappings
    when not exists (
      select 1 from questions q
      where q.id = new.question_id and q.uid = new.question_uid
        and q.correct_index != new.canonical_choice_index
        and (q.content_version = new.question_content_version or exists (
          select 1 from question_revisions qr
          where qr.question_id = q.id
            and qr.content_version = new.question_content_version
        ))
    ) or not exists (
      select 1 from question_concept_mappings qcm
      where qcm.question_id = new.question_id
        and qcm.question_uid = new.question_uid
        and qcm.question_content_version = new.question_content_version
        and qcm.concept_id = new.concept_id
        and qcm.mapping_version = new.mapping_version
    )
    begin
      select raise(abort,
        'distractor mapping is not a valid mapped-question distractor');
    end`,
  `create trigger if not exists distractor_misconception_integrity_update
    before update of question_id, question_uid, question_content_version,
      canonical_choice_index, concept_id, mapping_version
    on distractor_misconception_mappings
    when not exists (
      select 1 from questions q
      where q.id = new.question_id and q.uid = new.question_uid
        and q.correct_index != new.canonical_choice_index
        and (q.content_version = new.question_content_version or exists (
          select 1 from question_revisions qr
          where qr.question_id = q.id
            and qr.content_version = new.question_content_version
        ))
    ) or not exists (
      select 1 from question_concept_mappings qcm
      where qcm.question_id = new.question_id
        and qcm.question_uid = new.question_uid
        and qcm.question_content_version = new.question_content_version
        and qcm.concept_id = new.concept_id
        and qcm.mapping_version = new.mapping_version
    )
    begin
      select raise(abort,
        'distractor mapping is not a valid mapped-question distractor');
    end`,
  `create trigger if not exists session_item_identity_insert
    before insert on session_items
    when not exists (
      select 1 from questions q
      where q.id = new.question_id and q.uid = new.question_uid
        and (q.content_version = new.question_content_version or exists (
          select 1 from question_revisions qr
          where qr.question_id = q.id
            and qr.content_version = new.question_content_version
        ))
    )
    begin
      select raise(abort, 'session item identity/version mismatch');
    end`,
  `create trigger if not exists session_item_immutable_update
    before update on session_items
    begin select raise(abort, 'session items are immutable'); end`,
  `create trigger if not exists session_item_immutable_delete
    before delete on session_items
    begin select raise(abort, 'session items are immutable'); end`,
  `create trigger if not exists concept_learning_attempt_immutable_update
    before update on concept_learning_attempts
    begin select raise(abort, 'concept learning attempts are immutable'); end`,
  `create trigger if not exists concept_learning_attempt_immutable_delete
    before delete on concept_learning_attempts
    begin select raise(abort, 'concept learning attempts are immutable'); end`,
  `create trigger if not exists assistance_event_immutable_update
    before update on assistance_events
    begin select raise(abort, 'assistance events are immutable'); end`,
  `create trigger if not exists assistance_event_immutable_delete
    before delete on assistance_events
    begin select raise(abort, 'assistance events are immutable'); end`,
  `create trigger if not exists concept_certification_chain_insert
    before insert on concept_certification_transitions
    when (
      new.sequence = 0 and (
        new.from_status != 'unproven' or exists (
          select 1 from concept_certification_transitions cct
          where cct.concept_id = new.concept_id
        )
      )
    ) or (
      new.sequence > 0 and not exists (
        select 1 from concept_certification_transitions cct
        where cct.concept_id = new.concept_id
          and cct.sequence = new.sequence - 1
          and cct.to_status = new.from_status
      )
    )
    begin
      select raise(abort,
        'concept certification transition is not contiguous');
    end`,
  `create trigger if not exists concept_certification_immutable_update
    before update on concept_certification_transitions
    begin
      select raise(abort, 'concept certification transitions are append-only');
    end`,
  `create trigger if not exists concept_certification_immutable_delete
    before delete on concept_certification_transitions
    begin
      select raise(abort, 'concept certification transitions are append-only');
    end`,
] as const;
