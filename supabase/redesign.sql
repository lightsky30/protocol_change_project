-- ============================================================================
-- 개편 마이그레이션: "읽으면 사라지는 한 통의 쪽지" → "모두의 응원이 쌓이는 벽"
--
-- 이 내용은 Supabase MCP 를 통해 원격 프로젝트(xfjcprxzbvpapyfynrvm)에 이미
-- 적용 완료되었습니다. 아래는 적용된 그대로의 기록 / 재현용 스크립트입니다.
-- (SQL Editor 에 다시 실행해도 안전하도록 idempotent 하게 작성)
-- ============================================================================

-- 1) "테이블 전체에 행이 하나만" 강제하던 유니크 인덱스를 제거합니다.
--    secret_notes_single_waiting_note 는 UNIQUE INDEX ON ((true)) 형태라
--    행을 1개로 묶어 "한 번에 하나만 대기" 동작을 만들던 장본인이었습니다.
DROP INDEX IF EXISTS public.secret_notes_single_waiting_note;

-- 2) 모두가 벽의 모든 메모를 읽도록 SELECT 를 허용합니다.
--    (가) 테이블 권한: 기존 설계는 읽기를 SECURITY DEFINER RPC 로만 하도록
--         anon 의 SELECT 권한을 빼놨기 때문에 GRANT 가 반드시 필요합니다.
GRANT SELECT ON public.secret_notes TO anon, authenticated;

--    (나) RLS 정책: 어떤 행을 볼 수 있는지(=전부) 정의합니다.
DROP POLICY IF EXISTS "Public can read all notes" ON public.secret_notes;
CREATE POLICY "Public can read all notes"
  ON public.secret_notes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- (참고) 글쓰기 정책은 이미 존재합니다 — "Anyone can leave a note" (INSERT, anon):
--   WITH CHECK: mood 비어있지 않음 AND message 비어있지 않음 AND length(message) <= 200
-- UPDATE / DELETE 정책은 의도적으로 두지 않습니다 → 벽의 메모는 수정·삭제 불가.

-- 3) 더 이상 쓰지 않는 삭제형 RPC 를 제거합니다.
--    (보안 어드바이저가 anon 실행 가능한 SECURITY DEFINER 함수로 경고하던 대상)
DROP FUNCTION IF EXISTS public.claim_oldest_secret_note();
