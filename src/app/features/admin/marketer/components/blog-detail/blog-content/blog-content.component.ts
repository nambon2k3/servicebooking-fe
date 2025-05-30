import { Component, ElementRef, forwardRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import YouTube from '@tiptap/extension-youtube';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Bold from '@tiptap/extension-bold';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SsrService } from '../../../../../../core/services/ssr.service';


@Component({
  selector: 'app-blog-content',
  templateUrl: './blog-content.component.html',
  styleUrls: ['./blog-content.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BlogContentComponent),
      multi: true
    }
  ]
})
export class BlogContentComponent implements OnInit {
  @Input() content: string | null = null;
  showTextSizeDropdown: boolean = false;
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  editor!: Editor;

  constructor(
    private ssrService: SsrService,
  ) { }

  ngOnInit(): void {
    const document = this.ssrService.getDocument();
    if (document) {
      this.initializeEditor();
    }
  }

  // ControlValueAccessor Callbacks
  onChange = (value: any) => { };
  onTouched = () => { };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content'] && this.editor) {
      // Nếu content thay đổi và editor đã được khởi tạo, cập nhật nội dung của editor
      this.editor.commands.setContent(this.content || '');
    }
  }

  // Implement ControlValueAccessor Methods
  // Implement ControlValueAccessor Methods
  writeValue(value: any): void {
    this.content = value;
    if (this.editor) {
      this.editor.commands.setContent(value || '');
    }
  }

  // Register the function to call when the value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Register the function to call when the control is touched
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.editor) {
      this.editor.setEditable(!isDisabled);
    }
  }

  initializeEditor(): void {
    const FontSizeTextStyle = TextStyle.extend({
      addAttributes() {
        return {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize,
            renderHTML: (attributes: { fontSize?: string }) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        };
      },
    });

    const CustomBold = Bold.extend({
      renderHTML({ mark, HTMLAttributes }: { mark: any; HTMLAttributes: Record<string, string> }) {
        const { style, ...rest } = HTMLAttributes;
        const newStyle = `font-weight: bold;${style ? ` ${style}` : ''}`;
        return ['span', { ...rest, style: newStyle.trim() }, 0];
      },
      addOptions() {
        return {
          ...this.parent?.(),
          HTMLAttributes: {},
        };
      },
    });

    this.editor = new Editor({
      element: this.editorContainer.nativeElement,
      extensions: [
        StarterKit,
        CustomBold,
        TextStyle,
        Color,
        FontSizeTextStyle,
        FontFamily,
        Highlight,
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Image,
        YouTube,
      ],
      content: this.content || '',
      onUpdate: ({ editor }) => {
        this.onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: 'format lg:format-lg dark:format-invert focus:outline-none format-blue max-w-none',
        },
      }

    });
  }

  toggleBold(): void {
    this.editor.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor.chain().focus().toggleItalic().run();
  }

  toggleUnderline(): void {
    this.editor.chain().focus().toggleUnderline().run();
  }

  toggleStrike(): void {
    this.editor.chain().focus().toggleStrike().run();
  }

  toggleHighlight(): void {
    const isHighlighted = this.editor.isActive('highlight');
    this.editor.chain().focus().toggleHighlight(isHighlighted ? undefined : { color: '#ffc078' }).run();
  }

  toggleLink(): void {
    const url = window.prompt('Enter link URL:', 'https://flowbite.com');
    if (url) {
      this.editor.chain().focus().toggleLink({ href: url }).run()
      console.log("nam")
    }
  }




  toggleHRButton(): void {
    this.editor.chain().focus().setHorizontalRule().run();
  }

  removeLink(): void {
    this.editor.chain().focus().unsetLink().run();
  }

  toggleCode(): void {
    this.editor.chain().focus().toggleCode().run();
  }

  setTextAlign(align: 'left' | 'center' | 'right'): void {
    this.editor.chain().focus().setTextAlign(align).run();
  }

  toggleList(): void {
    this.editor.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor.chain().focus().toggleOrderedList().run();
  }

  toggleBlockquote(): void {
    this.editor.chain().focus().toggleBlockquote().run();
  }

  setHorizontalRule(): void {
    this.editor.chain().focus().setHorizontalRule().run();
  }

  addImage(): void {
    const url = window.prompt('Enter image URL:', 'https://placehold.co/600x400');
    if (url) this.editor.chain().focus().setImage({ src: url }).run();
  }

  addVideo(): void {
    const url = window.prompt('Enter YouTube URL:', 'https://www.youtube.com/watch?v=KaLxCiilHns');
    if (url)
      this.editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
  }


  displayTextSizeDropdown(): void {
    this.showTextSizeDropdown = !this.showTextSizeDropdown;
  }


  // Method to set font size
  setFontSize(fontSize: string): void {
    this.editor.chain().focus().setMark('textStyle', { fontSize }).run();
  }

  // Method to handle font size dropdown selection
  handleFontSizeSelection(event: Event): void {
    const target = event.target as HTMLElement;
    const fontSize = target.getAttribute('data-text-size');
    if (fontSize) {
      this.setFontSize(fontSize);
      this.showTextSizeDropdown = false;
    }
  }



  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }
}