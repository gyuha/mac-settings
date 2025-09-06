vim.g.mapleader = ","

-- 2) OS별 클립보드 설정 (기존 로직 유지)
if vim.fn.has('win32') == 1 then
  vim.opt.clipboard = "unnamed,unnamedplus"
elseif vim.fn.has('macunix') == 1 then
  vim.opt.clipboard = "unnamedplus"
end


-- 3) 기본 옵션 (기존 내용 유지)
vim.opt.showmode = true
vim.opt.number = true
vim.opt.termguicolors = true
vim.opt.signcolumn = "yes"
vim.opt.scrolloff = 8
vim.opt.sidescrolloff = 8
vim.opt.mouse = "a"


vim.opt.number = true
vim.opt.autoindent = true
vim.opt.tabstop = 2
vim.opt.expandtab = true
vim.opt.shiftwidth = 2
vim.opt.smarttab = true
vim.opt.softtabstop = 2
vim.opt.termguicolors = true
vim.opt.mouse = "" -- 터미널 복사 충돌 방지
vim.opt.ignorecase = true
vim.opt.smartcase = true

-- UX 강화
vim.opt.cursorline    = true
vim.opt.splitbelow    = true
vim.opt.splitright    = true
vim.opt.updatetime    = 200
vim.opt.timeoutlen    = 400
vim.opt.undofile      = true
vim.opt.inccommand    = "split"
vim.opt.list          = true
-- vim.opt.listchars     = { tab = "▸ ", trail = "•", extends = ">", precedes = "<" }
vim.opt.shortmess:append("I") -- intro 숨김
vim.opt.wrap = false

-- 5) hop 설치 여부에 관계없이 동작해야 하는 일반 키맵/옵션
--    (hop 관련 키는 위 plugins.keys로 옮겼으므로, 여기선 공용 키맵만 둡니다)
local opts = { noremap = true, silent = true }

-- Y를 누르면 라인 yank
vim.keymap.set('n', 'Y', 'yy', { noremap = true })

-- Visual Block 모드 토글 키
vim.api.nvim_set_keymap('n', '<C-q>', '<C-v>', opts)
vim.api.nvim_set_keymap('v', '<C-q>', '<C-v>', opts)
vim.keymap.set('n', '<leader>v', '<C-v>', opts)

-- ~/.config/nvim/init.lua
-- 1) lazy.nvim 부트스트랩
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    lazypath
  })
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup("plugins", {
  change_detection = { notify = false },
})

