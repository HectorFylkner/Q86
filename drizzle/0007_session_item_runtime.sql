DROP TRIGGER IF EXISTS `session_item_identity_insert`;--> statement-breakpoint
CREATE TRIGGER `session_item_identity_insert`
BEFORE INSERT ON `session_items`
WHEN NOT EXISTS (
  SELECT 1 FROM `questions` q
  WHERE q.`id` = NEW.`question_id`
    AND (
      q.`uid` = NEW.`question_uid`
      OR (
        q.`uid` IS NULL
        AND NEW.`question_uid` =
          'db:' || q.`id` || ':v' || NEW.`question_content_version` || ':f' || q.`format`
      )
    )
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
END;
