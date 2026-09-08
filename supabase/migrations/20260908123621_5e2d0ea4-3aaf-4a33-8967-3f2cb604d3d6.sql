UPDATE public.quiz_questions q
SET options = (
      SELECT jsonb_agg(jsonb_build_object('text', elem))
      FROM jsonb_array_elements_text(q.options) elem
    ),
    correct_answer = COALESCE((
      SELECT to_jsonb(idx - 1)
      FROM jsonb_array_elements_text(q.options) WITH ORDINALITY AS t(val, idx)
      WHERE q.correct_answer IS NOT NULL
        AND lower(btrim(t.val)) = lower(btrim(q.correct_answer #>> '{}'))
      LIMIT 1
    ), q.correct_answer)
WHERE jsonb_typeof(q.options) = 'array'
  AND jsonb_array_length(q.options) > 0
  AND jsonb_typeof(q.options -> 0) = 'string';