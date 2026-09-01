import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { Editor as TinyMceReactEditor } from '@tinymce/tinymce-react'
import type { Editor as TinyMCEEditor } from 'tinymce'
import { ImagePlus, Images } from 'lucide-react'
import { uploadR2MediaFile } from '@/services/r2MediaService'
import { cn } from '@/shared/lib/cn'
import { sourceToEditorHtml } from '@/shared/lib/tipBody'
import {
  IMAGE_SLOTS,
  bodyImageBlock,
  ensureBodyImageBlocks,
  replaceImageSlot,
  type ImageSlot,
} from '@/shared/lib/tipImagePlaceholder'
import { insertImageAtCaret, isolateImagesFromText, selectPlaceholderSlot } from './tipWysiwyg/insertTinyImage'
import { findEnclosingPlaceholder } from './tipWysiwyg/placeholderDom'
import './tipWysiwyg/tinymceSetup'

const ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'

const TINY_CONTENT_STYLE = `
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");
html, body { background: #ffffff !important; }
body {
  font-family: 'Pretendard', -apple-system, sans-serif;
  font-size: 18px;
  line-height: 1.8;
  color: #1e293b;
  background: #ffffff !important;
}
p { margin: 0 0 20px 0 !important; font-size: 18px; line-height: 1.8; color: #1e293b; position: static !important; }
p:empty, p:has(br:only-child) {
  margin: 0 !important;
  padding: 0 !important;
  height: 0 !important;
  line-height: 0 !important;
}
h2 { margin: 36px 0 16px 0 !important; line-height: 1.4; }
img {
  display: block !important;
  float: none !important;
  position: static !important;
  z-index: auto !important;
  max-width: 100% !important;
  height: auto !important;
  margin: 24px auto !important;
  clear: both !important;
  vertical-align: top !important;
}
p.doolia-body-image, div.doolia-body-image, .doolia-body-image {
  display: block !important;
  width: 100% !important;
  margin: 36px 0 !important;
  position: static !important;
  height: auto !important;
  float: none !important;
  clear: both !important;
}
.doolia-body-image img {
  margin: 0 auto !important;
}
div[style*="ecfdf5"],
div[style*="ECFDF5"],
div[style*="f0fdf4"],
div[style*="d1fae5"],
div[style*="a7f3d0"],
aside.tip-parent-summary,
.tip-parent-summary {
  position: static !important;
  overflow: visible !important;
  height: auto !important;
  max-height: none !important;
}
div[style*="height: 16px"]:has(img),
div[style*="height:16px"]:has(img),
div[style*="height: 24px"]:has(img),
div[style*="height:24px"]:has(img),
div[style*="height: 32px"]:has(img),
div[style*="height:32px"]:has(img) {
  height: auto !important;
}
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #e5e7eb; padding: 0.55rem 0.8rem; vertical-align: top; }
`

export type TipWysiwygEditorHandle = {
  insertImage: (url: string, slot?: number) => boolean
  selectSlot: (slot: number) => boolean
}

type TipWysiwygEditorProps = {
  value: string
  onChange: (html: string) => void
  onOpenLibrary: () => void
  initialMode?: 'html' | 'visual'
}

export const TipWysiwygEditor = forwardRef<TipWysiwygEditorHandle, TipWysiwygEditorProps>(
  function TipWysiwygEditor({ value, onChange, onOpenLibrary, initialMode = 'html' }, ref) {
    const fileRef = useRef<HTMLInputElement>(null)
    const editorRef = useRef<TinyMCEEditor | null>(null)
    const pendingFileRef = useRef<((file: File | null) => void) | null>(null)
    const attachRef = useRef<() => void>(() => undefined)
    const libraryRef = useRef(onOpenLibrary)
    const modeRef = useRef<'html' | 'visual'>(initialMode)
    const [mode, setMode] = useState<'html' | 'visual'>(initialMode)
    const [htmlDraft, setHtmlDraft] = useState(() => (initialMode === 'visual' ? sourceToEditorHtml(value) : value))
    const [uploading, setUploading] = useState(false)
    const [note, setNote] = useState('')

    modeRef.current = mode
    libraryRef.current = onOpenLibrary

    const pickFile = useCallback(() => {
      return new Promise<File | null>((resolve) => {
        pendingFileRef.current = resolve
        fileRef.current?.click()
      })
    }, [])

    const applyHtml = useCallback(
      (next: string, message?: string) => {
        setHtmlDraft(next)
        onChange(next)
        if (message) setNote(message)
      },
      [onChange],
    )

    const insertIntoEditor = useCallback(
      (url: string, slot?: number) => {
        const editor = editorRef.current
        if (modeRef.current === 'visual' && editor) {
          const ok = insertImageAtCaret(editor, url, slot)
          applyHtml(editor.getContent(), '커서 위치에 사진을 넣었습니다.')
          return ok
        }
        if (slot) {
          const replaced = replaceImageSlot(htmlDraft, slot, url)
          if (!replaced.ok) {
            setNote(replaced.error)
            return false
          }
          applyHtml(replaced.next, `${slot}번 자리표시자를 이미지로 교체했습니다. 기본 글쓰기 모드에서 확인해 주세요.`)
          return true
        }
        applyHtml(`${htmlDraft.trim()}\n${bodyImageBlock(url)}`, 'HTML 모드라 본문 끝에 이미지를 넣었습니다. 글쓰기 모드에서 위치를 옮겨 주세요.')
        return true
      },
      [applyHtml, htmlDraft],
    )

    const pickAndUploadImage = useCallback(async () => {
      const file = await pickFile()
      if (!file) return null
      setUploading(true)
      setNote('')
      try {
        const uploaded = await uploadR2MediaFile(file)
        return uploaded.url
      } catch (error) {
        setNote(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
        return null
      } finally {
        setUploading(false)
        if (fileRef.current) fileRef.current.value = ''
      }
    }, [pickFile])

    const attachFromToolbar = useCallback(async () => {
      const url = await pickAndUploadImage()
      if (url) insertIntoEditor(url)
    }, [insertIntoEditor, pickAndUploadImage])

    attachRef.current = () => {
      void attachFromToolbar()
    }

    useImperativeHandle(
      ref,
      () => ({
        insertImage: (url: string, slot?: number) => insertIntoEditor(url, slot),
        selectSlot: (slot: number) => {
          const editor = editorRef.current
          if (modeRef.current === 'visual' && editor) {
            const ok = selectPlaceholderSlot(editor, slot)
            setNote(
              ok
                ? `${slot}번 박스를 선택했습니다. 📷 사진 첨부를 누르면 이 자리가 사진으로 바뀝니다.`
                : `${slot}번 자리표시자를 찾지 못했습니다.`,
            )
            return ok
          }
          setNote('기본 글쓰기 모드로 바꾼 뒤 자리표시자를 선택할 수 있습니다.')
          return false
        },
      }),
      [insertIntoEditor],
    )

    const switchToVisual = () => {
      const parsed = sourceToEditorHtml(htmlDraft)
      setHtmlDraft(parsed)
      onChange(parsed)
      setMode('visual')
      setNote('HTML을 글쓰기 화면으로 변환했습니다. 에메랄드 박스와 표 스타일이 그대로 보여야 합니다.')
    }

    const switchToHtml = () => {
      const editor = editorRef.current
      if (editor) {
        try {
          const html = editor.getContent()
          setHtmlDraft(html)
          onChange(html)
        } catch {
          /* editor already torn down */
        }
      }
      editorRef.current = null
      setMode('html')
    }

    const onHtmlChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      setHtmlDraft(event.target.value)
      onChange(event.target.value)
    }

    const onFileInput = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null
      pendingFileRef.current?.(file)
      pendingFileRef.current = null
    }

    const onSlotClick = (slot: ImageSlot) => {
      const editor = editorRef.current
      if (mode === 'visual' && editor) {
        const ok = selectPlaceholderSlot(editor, slot)
        setNote(
          ok
            ? `${slot}번 박스를 선택했습니다. 📷 사진 첨부를 누르면 이 자리가 사진으로 바뀝니다.`
            : `${slot}번 자리표시자가 없습니다.`,
        )
        return
      }
      setNote(`${slot}번을 고른 뒤 기본 글쓰기 모드에서 사진 첨부를 누르세요.`)
    }

    const tinyInit = useMemo(
      () => ({
        menubar: false,
        branding: false,
        promotion: false,
        statusbar: true,
        min_height: 520,
        height: 560,
        resize: true as const,
        plugins: 'lists link table image',
        toolbar:
          'undo redo | blocks | bold italic underline | bullist numlist | table link | dooliaimage doolialibrary',
        block_formats: '본문=p; 소제목=h2; 작은 제목=h3; 인용=blockquote',
        placeholder: '여기에 바로 글을 쓰거나, HTML 모드에서 AI 본문을 붙여넣은 뒤 이 화면으로 돌아오세요.',
        skin: false,
        content_css: false,
        content_style: TINY_CONTENT_STYLE,
        convert_urls: false,
        relative_urls: false,
        remove_script_host: false,
        verify_html: false,
        valid_elements: '*[*]',
        extended_valid_elements: '*[*]',
        invalid_elements: 'script,iframe,object,embed,link,meta',
        valid_children: '+body[style],-p[img],-h1[img],-h2[img],-h3[img],-h4[img],-li[img],-blockquote[img]',
        keep_styles: true,
        paste_webkit_styles: 'all',
        paste_retain_style_properties: 'all',
        entity_encoding: 'raw' as const,
        forced_root_block: 'p',
        image_dimensions: false,
        object_resizing: false,
        setup: (editor: TinyMCEEditor) => {
          editor.ui.registry.addButton('dooliaimage', {
            text: '📷 사진 첨부',
            tooltip: '지금 커서 위치에 사진을 넣습니다',
            onAction: () => attachRef.current(),
          })
          editor.ui.registry.addButton('doolialibrary', {
            text: '라이브러리',
            tooltip: 'R2 미디어 라이브러리',
            onAction: () => libraryRef.current(),
          })
          editor.on('click', (event) => {
            const target = event.target
            if (!(target instanceof Element)) return
            const box = findEnclosingPlaceholder(target)
            if (box && box.tagName !== 'IMG') editor.selection.select(box)
          })
          editor.on('BeforeSetContent', (event) => {
            if (typeof event.content === 'string' && event.content.includes('<img')) {
              event.content = ensureBodyImageBlocks(event.content)
            }
          })
          editor.on('init', () => {
            isolateImagesFromText(editor)
          })
          editor.on('SetContent', () => {
            isolateImagesFromText(editor)
          })
        },
      }),
      [],
    )

    useEffect(() => {
      return () => {
        pendingFileRef.current?.(null)
        editorRef.current = null
      }
    }, [])

    return (
      <div className="space-y-2">
        <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={onFileInput} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-ink">본문 에디터</p>
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50/80 p-0.5" role="tablist" aria-label="본문 편집 모드">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'html'}
              onClick={switchToHtml}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-extrabold',
                mode === 'html' ? 'bg-emerald-600 text-white' : 'text-emerald-800 hover:bg-white',
              )}
            >
              HTML
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'visual'}
              onClick={switchToVisual}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-extrabold',
                mode === 'visual' ? 'bg-emerald-600 text-white' : 'text-emerald-800 hover:bg-white',
              )}
            >
              기본 글쓰기 모드
            </button>
          </div>
        </div>
        <p className="text-xs font-medium leading-5 text-muted">
          <strong className="text-emerald-800">HTML</strong>에 AI 본문 코드를 그대로 붙여넣은 뒤{' '}
          <strong className="text-emerald-800">기본 글쓰기 모드</strong>로 바꾸면, 에메랄드 박스·비교표·색상이 티스토리처럼 보입니다. 글쓰기
          화면에서 커서를 찍고 <strong className="text-emerald-800">📷 사진 첨부</strong>를 누르세요.
        </p>
        {mode === 'visual' ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => void attachFromToolbar()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <ImagePlus size={15} />
              {uploading ? '업로드 중...' : '📷 사진 첨부'}
            </button>
            <button
              type="button"
              onClick={onOpenLibrary}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50"
            >
              <Images size={15} />
              라이브러리
            </button>
            <span className="text-xs font-extrabold text-emerald-800">자리표시자</span>
            {IMAGE_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => onSlotClick(slot)}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-emerald-200 bg-white px-2.5 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50"
              >
                {slot}번
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={switchToVisual}
            className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-4 text-xs font-extrabold text-white hover:bg-emerald-700"
          >
            기본 글쓰기 모드로 변환
          </button>
        )}
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          {mode === 'html' ? (
            <textarea
              value={htmlDraft}
              onChange={onHtmlChange}
              rows={20}
              spellCheck={false}
              className="tip-html-editor w-full rounded-xl p-3 font-mono text-[13px] leading-6 text-slate-800 outline-none"
              placeholder="여기에 AI가 만든 HTML 코드를 그대로 붙여넣으세요. 그다음 [기본 글쓰기 모드]를 누르면 디자인된 화면으로 바뀝니다."
            />
          ) : (
            <div className="tip-wysiwyg-wrap">
              <TinyMceReactEditor
                licenseKey="gpl"
                initialValue={sourceToEditorHtml(htmlDraft)}
                onInit={(_event, editor) => {
                  editorRef.current = editor
                  isolateImagesFromText(editor)
                }}
                onEditorChange={(content) => {
                  setHtmlDraft(content)
                  onChange(content)
                }}
                init={tinyInit}
              />
            </div>
          )}
        </div>
        {note ? (
          <p className={`text-xs font-bold ${/실패|찾지|끝에/.test(note) ? 'text-red-600' : 'text-emerald-800'}`}>{note}</p>
        ) : null}
      </div>
    )
  },
)

TipWysiwygEditor.displayName = 'TipWysiwygEditor'
