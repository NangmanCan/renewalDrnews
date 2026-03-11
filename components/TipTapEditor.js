'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { useCallback, useRef, useState, useEffect } from 'react';
import { uploadImage } from '@/lib/storage';

// 폰트 크기 확장
import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
  name: 'fontSize',
  
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// 툴바 버튼 컴포넌트
const ToolbarButton = ({ onClick, active, disabled, children, title, ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={ariaLabel || title}
    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
      active ? 'bg-gray-200 text-sky-600' : 'text-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

// 툴바 구분선
const ToolbarDivider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

export default function TipTapEditor({ content, onChange, placeholder = '본문을 입력하세요...' }) {
  const [uploading, setUploading] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [tableRowMenuOpen, setTableRowMenuOpen] = useState(false);
  const [tableColMenuOpen, setTableColMenuOpen] = useState(false);
  const [tableSizeMenuOpen, setTableSizeMenuOpen] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [currentFontSize, setCurrentFontSize] = useState('');
  const [draftAvailable, setDraftAvailable] = useState(false);
  
  const imageInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const highlightPickerRef = useRef(null);
  const tableRowMenuRef = useRef(null);
  const tableColMenuRef = useRef(null);
  const tableSizeMenuRef = useRef(null);
  const linkInputRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      FontFamily,
      FontSize,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 font-semibold p-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // 초기 로드: 임시저장된 데이터 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem('tiptap_draft');
      const draftTime = localStorage.getItem('tiptap_draft_time');
      
      if (draft && draftTime) {
        const elapsed = Date.now() - parseInt(draftTime, 10);
        // 24시간 이내 draft만 유효
        if (elapsed < 24 * 60 * 60 * 1000) {
          setDraftAvailable(true);
        } else {
          localStorage.removeItem('tiptap_draft');
          localStorage.removeItem('tiptap_draft_time');
        }
      }
    }
  }, []);

  // 임시저장 복구
  const restoreDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem('tiptap_draft');
      if (draft && editor) {
        editor.commands.setContent(draft);
        setDraftAvailable(false);
        localStorage.removeItem('tiptap_draft');
        localStorage.removeItem('tiptap_draft_time');
      }
    }
  }, [editor]);

  const dismissDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tiptap_draft');
      localStorage.removeItem('tiptap_draft_time');
      setDraftAvailable(false);
    }
  }, []);

  // 30초마다 자동 임시저장
  useEffect(() => {
    if (!editor) return;

    const interval = setInterval(() => {
      const html = editor.getHTML();
      if (html && html !== '<p></p>' && typeof window !== 'undefined') {
        localStorage.setItem('tiptap_draft', html);
        localStorage.setItem('tiptap_draft_time', Date.now().toString());
      }
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, [editor]);

  // 메모리 누수 방지: cleanup에서 editor 파괴
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  // 외부 클릭 감지로 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setColorPickerOpen(false);
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target)) {
        setHighlightPickerOpen(false);
      }
      if (tableRowMenuRef.current && !tableRowMenuRef.current.contains(event.target)) {
        setTableRowMenuOpen(false);
      }
      if (tableColMenuRef.current && !tableColMenuRef.current.contains(event.target)) {
        setTableColMenuOpen(false);
      }
      if (tableSizeMenuRef.current && !tableSizeMenuRef.current.contains(event.target)) {
        setTableSizeMenuOpen(false);
      }
      if (linkInputRef.current && !linkInputRef.current.contains(event.target)) {
        setLinkInputOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 폰트 크기 동기화
  useEffect(() => {
    if (!editor) return;

    const updateFontSize = () => {
      const attrs = editor.getAttributes('textStyle');
      setCurrentFontSize(attrs.fontSize || '');
    };

    editor.on('selectionUpdate', updateFontSize);
    editor.on('transaction', updateFontSize);

    return () => {
      editor.off('selectionUpdate', updateFontSize);
      editor.off('transaction', updateFontSize);
    };
  }, [editor]);

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // MIME 타입 검증
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('지원하는 이미지 형식: JPEG, PNG, GIF, WebP');
      return;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploading(true);
    try {
      const { url, error } = await uploadImage(file, 'articles');
      
      if (error) throw error;

      // 에디터에 이미지 삽입
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  }, [editor]);

  // 링크 설정 (인라인 UI)
  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setLinkInputOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    
    setLinkInputOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  // 테이블 삽입 (크기 선택)
  const insertTable = useCallback((rows, cols) => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setTableSizeMenuOpen(false);
  }, [editor]);

  // 로딩 UI
  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg bg-white p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-sky-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 text-sm">에디터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg bg-white">
      {/* 임시저장 복구 알림 */}
      {draftAvailable && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex items-center justify-between">
          <p className="text-sm text-yellow-800">
            <strong>임시저장된 내용</strong>이 있습니다. 복구하시겠습니까?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              복구
            </button>
            <button
              type="button"
              onClick={dismissDraft}
              className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              무시
            </button>
          </div>
        </div>
      )}

      {/* 툴바 */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1 items-center relative z-20">
        {/* 텍스트 스타일 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="굵게 (Ctrl+B)"
          ariaLabel="텍스트 굵게"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h8M6 6h8a3 3 0 110 6H6V6zm0 6h9a3 3 0 110 6H6v-6z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="기울임 (Ctrl+I)"
          ariaLabel="텍스트 기울임"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m2 0h4M4 20h4" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          title="밑줄 (Ctrl+U)"
          ariaLabel="텍스트 밑줄"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20h14M8 4v10a4 4 0 008 0V4" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          title="취소선"
          ariaLabel="텍스트 취소선"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M8 5v7m8-7v7" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* 글자색 - 클릭 토글 */}
        <div className="relative" ref={colorPickerRef}>
          <ToolbarButton
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
            title="글자색"
            ariaLabel="글자색 선택"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10M12 3v18M5 11l7-7 7 7" />
            </svg>
          </ToolbarButton>
          {colorPickerOpen && (
            <div className="absolute top-full left-0 mt-1 flex bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50 gap-1">
              {['#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setColorPickerOpen(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform flex-shrink-0"
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`글자색 ${color}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 배경색 - 클릭 토글 */}
        <div className="relative" ref={highlightPickerRef}>
          <ToolbarButton
            onClick={() => setHighlightPickerOpen(!highlightPickerOpen)}
            title="배경색"
            ariaLabel="배경색 선택"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96a.75.75 0 010 1.06L19.36 6.45l-1.41-1.41 1.35-1.35a.75.75 0 011.06 0l.35.35zM5 21h14v2H5v-2z" />
            </svg>
          </ToolbarButton>
          {highlightPickerOpen && (
            <div className="absolute top-full left-0 mt-1 flex bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50 gap-1">
              {['#fef3c7', '#fecaca', '#ddd6fe', '#bfdbfe', '#bbf7d0', '#fed7aa', '#e5e5e5'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color }).run();
                    setHighlightPickerOpen(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform flex-shrink-0"
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`배경색 ${color}`}
                />
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* 폰트 크기 - 현재 값 동기화 */}
        <select
          value={currentFontSize}
          onChange={(e) => {
            const size = e.target.value;
            if (size) {
              editor.chain().focus().setFontSize(size).run();
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
          className="text-sm border border-gray-300 rounded px-2 py-1"
          title="폰트 크기"
          aria-label="폰트 크기 선택"
        >
          <option value="">기본</option>
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
          <option value="32">32px</option>
        </select>

        <ToolbarDivider />

        {/* 정렬 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          disabled={!editor.can().setTextAlign('left')}
          title="왼쪽 정렬"
          ariaLabel="왼쪽 정렬"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          disabled={!editor.can().setTextAlign('center')}
          title="가운데 정렬"
          ariaLabel="가운데 정렬"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          disabled={!editor.can().setTextAlign('right')}
          title="오른쪽 정렬"
          ariaLabel="오른쪽 정렬"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* 리스트 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          disabled={!editor.can().toggleBulletList()}
          title="글머리 기호"
          ariaLabel="글머리 기호 목록"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            <circle cx="4" cy="6" r="1.5" fill="currentColor" />
            <circle cx="4" cy="12" r="1.5" fill="currentColor" />
            <circle cx="4" cy="18" r="1.5" fill="currentColor" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          disabled={!editor.can().toggleOrderedList()}
          title="번호 목록"
          ariaLabel="번호 목록"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6v0M3 12v0M3 18v0" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          disabled={!editor.can().toggleBlockquote()}
          title="인용문"
          ariaLabel="인용문"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* 이미지 삽입 */}
        <ToolbarButton
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading}
          title="이미지 삽입"
          ariaLabel="이미지 업로드"
        >
          {uploading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </ToolbarButton>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          className="hidden"
          aria-label="이미지 파일 선택"
        />

        {/* 링크 - 인라인 입력 UI */}
        <div className="relative" ref={linkInputRef}>
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive('link')}
            title="링크 삽입"
            ariaLabel="링크 삽입"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </ToolbarButton>
          {linkInputOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 flex gap-2 min-w-[300px]">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyLink()}
                placeholder="https://example.com"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                autoFocus
                aria-label="링크 URL 입력"
              />
              <button
                type="button"
                onClick={applyLink}
                className="px-3 py-1 bg-sky-600 text-white rounded text-sm hover:bg-sky-700 transition-colors"
              >
                적용
              </button>
            </div>
          )}
        </div>

        {editor.isActive('link') && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="링크 제거"
            ariaLabel="링크 제거"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </ToolbarButton>
        )}

        <ToolbarDivider />

        {/* 표 삽입 - 크기 선택 UI */}
        <div className="relative" ref={tableSizeMenuRef}>
          <ToolbarButton
            onClick={() => setTableSizeMenuOpen(!tableSizeMenuOpen)}
            title="표 삽입"
            ariaLabel="표 삽입"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </ToolbarButton>
          {tableSizeMenuOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-[160px]">
              <p className="text-xs text-gray-500 mb-2 font-medium">표 크기 선택</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { rows: 2, cols: 2, label: '2×2' },
                  { rows: 3, cols: 3, label: '3×3' },
                  { rows: 4, cols: 4, label: '4×4' },
                  { rows: 2, cols: 3, label: '2×3' },
                  { rows: 3, cols: 2, label: '3×2' },
                  { rows: 5, cols: 5, label: '5×5' },
                ].map(({ rows, cols, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      insertTable(rows, cols);
                      setTableSizeMenuOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 rounded border border-gray-200 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 표 편집 버튼들 (표 안에서만 활성화) */}
        {editor.isActive('table') && (
          <>
            {/* 행 추가 - 클릭 토글 */}
            <div className="relative" ref={tableRowMenuRef}>
              <ToolbarButton
                onClick={() => setTableRowMenuOpen(!tableRowMenuOpen)}
                title="행 추가"
                ariaLabel="행 추가"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </ToolbarButton>
              {tableRowMenuOpen && (
                <div className="absolute top-full left-0 mt-1 flex flex-col bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowBefore().run();
                      setTableRowMenuOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap text-left"
                  >
                    위에 행 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setTableRowMenuOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap text-left"
                  >
                    아래 행 추가
                  </button>
                </div>
              )}
            </div>

            {/* 열 추가 - 클릭 토글 */}
            <div className="relative" ref={tableColMenuRef}>
              <ToolbarButton
                onClick={() => setTableColMenuOpen(!tableColMenuOpen)}
                title="열 추가"
                ariaLabel="열 추가"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </ToolbarButton>
              {tableColMenuOpen && (
                <div className="absolute top-full left-0 mt-1 flex flex-col bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnBefore().run();
                      setTableColMenuOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap text-left"
                  >
                    왼쪽에 열 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setTableColMenuOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap text-left"
                  >
                    오른쪽에 열 추가
                  </button>
                </div>
              )}
            </div>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
              title="행 삭제"
              ariaLabel="행 삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
              title="열 삭제"
              ariaLabel="열 삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().mergeCells().run()}
              disabled={!editor.can().mergeCells()}
              title="셀 병합"
              ariaLabel="셀 병합"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().splitCell().run()}
              disabled={!editor.can().splitCell()}
              title="셀 분할"
              ariaLabel="셀 분할"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16m8-16v16m8-16v16" />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="표 삭제"
              ariaLabel="표 삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </ToolbarButton>
          </>
        )}
      </div>

      {/* 에디터 영역 */}
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
}
