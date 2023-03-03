if has('vim_starting')
	set nocompatible               " Be iMproved
endif

let g:vim_path = "~/.nvim"

if has("win32")
	let g:vim_path = "~/vimfiles"
else
	let vimplug_exists=expand(g:vim_path . '/autoload/plug.vim')

	let g:vim_bootstrap_langs = ""
	let g:vim_bootstrap_editor = "vim"				" .vim or vim

	if !filereadable(vimplug_exists)
		echo "Installing Vim-Plug..."
		echo ""
		silent !\curl -fLo ~/.nvim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
		let g:not_finish_vimplug = "yes"

		autocmd VimEnter * PlugInstall
	endif
endif

" Required:
call plug#begin(expand(g:vim_path . '/plugged'))

"*****************************************************************************
"" Plug install packages
"*****************************************************************************
Plug 'Raimondi/delimitMate'
Plug 'easymotion/vim-easymotion'
Plug 'jlanzarotta/bufexplorer'
Plug 'scrooloose/nerdcommenter'
Plug 'scrooloose/nerdtree'
Plug 'scrooloose/syntastic'
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'vim-scripts/grep.vim'
Plug 'ctrlpvim/ctrlp.vim'
Plug 'airblade/vim-rooter'
Plug 'frazrepo/vim-rainbow'				" rainbow pairs
Plug 'jiangmiao/auto-pairs'				" Auto pairs ()
Plug 'mtdl9/vim-log-highlighting'		" Log Highlight
Plug 'ryanoasis/vim-devicons'			" Developer Icons
Plug 'tpope/vim-markdown'

if isdirectory('~/.fzf') == 0
	Plug '~/.fzf'
endif

if !has("win32")
	let g:make = 'gmake'
	if exists('make')
		let g:make = 'make'
	endif
	Plug 'Shougo/vimproc.vim', {'do': g:make}

	if v:version >= 703
		Plug 'Shougo/vimshell.vim'
	endif

	if v:version >= 704
		if has("python3") || has("python")
			"" Snippets
			Plug 'SirVer/ultisnips'
			Plug 'FelikZ/ctrlp-py-matcher'
		endif
	endif
endif

"" Vim-Session
Plug 'xolox/vim-misc'
Plug 'xolox/vim-session'

"Plug 'honza/vim-snippets'

"" Color
Plug 'tomasr/molokai'
Plug 'altercation/vim-colors-solarized'


call plug#end()




" Required:
filetype plugin indent on

"*****************************************************************************
"" Basic Setup
"*****************************************************************************"
"" Encoding
set encoding=utf-8
set fileencoding=utf-8
set fileencodings=utf-8,cp949

"" Fix backspace indent
set backspace=indent,eol,start

"" Tabs. May be overriten by autocmd rules
set tabstop=4
set softtabstop=0
set shiftwidth=4
set noexpandtab

"" Map leader to ,
let mapleader=','

"" Enable hidden buffers
set hidden

"" Searching
set hlsearch
set incsearch
set ignorecase
set smartcase

set fileformats=unix,dos,mac
set showcmd

" session management
let g:session_directory = g:vim_path."/session"
let g:session_autoload = "no"
let g:session_autosave = "no"
let g:session_command_aliases = 1

"*****************************************************************************
"" Visual Settings
"*****************************************************************************
syntax on
set ruler
set number


if filereadable(expand(g:vim_path."/plugged/molokai/colors/molokai.vim"))
	set background=dark
	colorscheme molokai 
endif

if has("win32")
	set fileencodings=utf-8,cp949
	set langmenu=cp949
	set guifont=JCoding:h11
	set lines=60 columns=120
else
	set shell=/bin/sh
endif

set mousemodel=popup
set t_Co=256
set guifont=JCoding:h14

if has("gui_running")
	set guioptions=egrti
	set guifont=D2Coding ligature:h12
	set lsp=9
	set clipboard=unnamed
else
	if $COLORTERM == 'gnome-terminal'
		set term=gnome-256color
	else
		if $TERM == 'xterm'
			set term=xterm-256color
		endif
	endif

endif

if &term =~ '256color'
	set t_ut=
endif


"" Disable the blinking cursor.
set gcr=a:blinkon0
set scrolloff=3

"" Use modeline overrides
set modeline
set modelines=10

set title
set titleold="Terminal"
set titlestring=%F

set statusline=%F%m%r%h%w%=(%{&ff}/%Y)\ (line\ %l\/%L,\ col\ %c)\

if exists("*fugitive#statusline")
	set statusline+=%{fugitive#statusline()}
endif

" vim-airline
set laststatus=2
let g:airline_left_sep=''
let g:airline_right_sep=''

if !exists('g:airline_symbols')
	let g:airline_symbols = {}
endif

let g:airline_theme = 'powerlineish'
let g:airline#extensions#syntastic#enabled = 1
let g:airline#extensions#branch#enabled = 1
let g:airline#extensions#tabline#enabled = 1
let g:airline_skip_empty_sections = 1


set autoread

let g:NERDTreeWinSize = 30

" Formatting
set wrap						" Wrap long lines
set autoindent					" Indent at the same level of the previous line

set nospell					  	" Spell checking off

"" remove white spaces
fun! StripTrailingWhitespaces()
	let l = line(".")
	let c = col(".")
	%s/\s\+$//e
	%s/\($\n\s*\)\+\%$//e
	call cursor(l, c)
endfun

autocmd BufWritePre *.cpp,*.h,*.php,*.c,*.py,*.go,*.sh,*.cs,*.md,*.json :call StripTrailingWhitespaces()

" Instead of reverting the cursor to the last position in the buffer, we
" set it to the first line when editing a git commit message
au FileType gitcommit au! BufEnter COMMIT_EDITMSG call setpos('.', [0, 1, 1, 0])

" Save your backups to a less annoying place than the current directory.
" If you have .vim-backup in the current directory, it'll use that.
" Otherwise it saves it to ~/.vim/backup or . if all else fails.
if isdirectory($HOME . '/.nvim/backup') == 0
	:silent !mkdir -p ~/.nvim/backup >/dev/null 2>&1
endif
set backupdir-=.
set backupdir+=.
set backupdir-=~/
set backupdir^=~/.nvim/backup/
set backupdir^=./.nvim-backup/
set backup

" Save your swp files to a less annoying place than the current directory.
" If you have .nvim-swap in the current directory, it'll use that.
" Otherwise it saves it to ~/.nvim/swap, ~/tmp or .
if isdirectory($HOME . '/.nvim/swap') == 0
	:silent !mkdir -p ~/.nvim/swap >/dev/null 2>&1
endif
set directory=./.nvim-swap//
set directory+=~/.nvim/swap//
set directory+=~/tmp//
set directory+=.

" viminfo stores the the state of your previous editing session
set viminfo+=n~/.nvim/viminfo

if exists("+undofile")
	" undofile - This allows you to use undos after exiting and restarting
	" This, like swap and backups, uses .nvim-undo first, then ~/.nvim/undo
	" :help undo-persistence
	" This is only present in 7.3+
	if isdirectory($HOME . '/.nvim/undo') == 0
		:silent !mkdir -p ~/.nvim/undo > /dev/null 2>&1
	endif
	set undodir=./.nvim-undo//
	set undodir+=~/.nvim/undo//
	set undofile
endif

" Instead of reverting the cursor to the last position in the buffer, we
" set it to the first line when editing a git commit message
au FileType gitcommit au! BufEnter COMMIT_EDITMSG call setpos('.', [0, 1, 1, 0])

" Setting up the directories {
set backup					" Backups are nice ...
if has('persistent_undo')
	set undofile				" So is persistent undo ...
	set undolevels=1000			" Maximum number of changes that can be undone
	set undoreload=10000		" Maximum number lines to save for undo on a buffer reload
endif

" To disable views add the following to your .nvimrc.bundles.local file:
"	let g:g_no_views = 1
if !exists('g:g_no_views')
	" Add exclusions to mkview and loadview
	" eg: *.*, svn-commit.tmp
	let g:skipview_files = [
				\ '\[example pattern\]'
				\ ]
endif
" }


"*****************************************************************************
"" Mappings
"*****************************************************************************

"" Split
noremap <Leader>h :<C-u>split<CR>
noremap <Leader>v :<C-u>vsplit<CR>

"" Git
noremap <Leader>ga :Gwrite<CR>
noremap <Leader>gc :Gcommit<CR>
noremap <Leader>gsh :Gpush<CR>
noremap <Leader>gll :Gpull<CR>
noremap <Leader>gs :Gstatus<CR>
noremap <Leader>gb :Gblame<CR>
noremap <Leader>gd :Gvdiff<CR>
noremap <Leader>gr :Gremove<CR>

" session management
nnoremap <leader>so :OpenSession<Space>
nnoremap <leader>ss :SaveSession<Space>
nnoremap <leader>sd :DeleteSession<CR>
nnoremap <leader>sc :CloseSession<CR>

"" Tabs
nnoremap <Tab> gt
nnoremap <S-Tab> gT
nnoremap <silent> <S-t> :tabnew<CR>

"" Set working directory
nnoremap <leader>. :lcd %:p:h<CR>

"" Opens an edit command with the path of the currently edited file filled in
noremap <Leader>e :e <C-R>=expand("%:p:h") . "/" <CR>

"" Opens a tab edit command with the path of the currently edited file filled
noremap <Leader>te :tabe <C-R>=expand("%:p:h") . "/" <CR>

"" ctrlp.vim
set wildmode=list:longest,list:full
set wildignore+=*.o,*.obj,.git,*.rbc,*.pyc,__pycache__
let g:ctrlp_custom_ignore = '\v[\/](node_modules|target|dist)|(\.(swp|tox|ico|git|hg|svn))$'
let g:ctrlp_user_command = "find %s -type f | grep -Ev '"+ g:ctrlp_custom_ignore +"'"
let g:ctrlp_use_caching = 1

" The Silver Searcher
if executable('ag')
	set grepprg=ag\ --nogroup\ --nocolor
	let g:ctrlp_user_command = 'ag %s -l --nocolor -g ""'
	let g:ctrlp_use_caching = 0
endif

cnoremap <C-P> <C-R>=expand("%:p:h") . "/" <CR>
noremap <leader>b :CtrlPBuffer<CR>
let g:ctrlp_map = '<leader>e'
let g:ctrlp_open_new_file = 'r'
let g:ctrlp_cache_dir = $HOME . '/.cache/ctrlp'

" snippets
let g:UltiSnipsExpandTrigger="<tab>"
let g:UltiSnipsJumpForwardTrigger="<tab>"
let g:UltiSnipsJumpBackwardTrigger="<c-b>"
let g:UltiSnipsEditSplit="vertical"

" syntastic
let g:syntastic_always_populate_loc_list=1
let g:syntastic_error_symbol='✗'
let g:syntastic_warning_symbol='⚠'
let g:syntastic_style_error_symbol = '✗'
let g:syntastic_style_warning_symbol = '⚠'
let g:syntastic_auto_loc_list=1
let g:syntastic_aggregate_errors = 1

" Disable visualbell
set noerrorbells visualbell t_vb=
if has('autocmd')
	autocmd GUIEnter * set visualbell t_vb=
endif

" For when you forget to sudo.. Really Write the file.
cmap w!! w !sudo tee % >/dev/null

"" Copy/Paste/Cut
if has('unnamedplus')
	set clipboard=unnamed,unnamedplus
endif

noremap YY "+y<CR>
noremap <leader>p "+gP<CR>
noremap XX "+x<CR>

if has('macunix')
	" pbcopy for OSX copy/paste
	"vmap <C-x> :!pbcopy<CR>
	"vmap <C-c> :w !pbcopy<CR><CR>
	vmap <C-c> "+y
	vmap <C-x> "+c
	vmap <C-v> "*c<Esc>"+p
	imap <C-v> <Sec>"+pi
endif

"" Buffer nav
noremap <leader>z :bp<CR>
noremap <leader>q :bp<CR>
noremap <leader>x :bn<CR>
noremap <leader>w :bn<CR>

"" Close buffer
noremap <leader>c :bd<CR>

"" Clean search (highlight)
nnoremap <silent> <leader><space> :noh<cr>

"" Switching windows
noremap <C-j> <C-w>j
noremap <C-k> <C-w>k
noremap <C-l> <C-w>l
noremap <C-h> <C-w>h

"" Vmap for maintain Visual Mode after shifting > and <
vmap < <gv
vmap > >gv

"" Move visual block
vnoremap J :m '>+1<CR>gv=gv
vnoremap K :m '<-2<CR>gv=gv

"" Mouse Toggle
nnoremap <silent> <F9> :call ToggleMouse()<CR>
function! ToggleMouse()
	if &mouse == 'a'
		set mouse=
		echo "Mouse usage disabled"
	else
		set mouse=a
		echo "Mouse usage enabled"
	endif
endfunction

noremap <F4> :NERDTreeToggle<CR>
noremap <F5> :NERDTreeToggle<CR>
noremap <F6> :BufExplorer<CR>
" Dos to Unix
" noremap <F8> :%s/\r\(\n\)/\1/g<CR>
set pastetoggle=<F12>			" pastetoggle (sane indentation on pastes)

"" vim-markdown
let g:vim_markdown_conceal = 0

let g:ctrlp_map = '<c-p>'
let g:ctrlp_cmd = 'CtrlP'

if !has('nvim') | set viminfo+=n~/.config/vim/viminfo | endif
