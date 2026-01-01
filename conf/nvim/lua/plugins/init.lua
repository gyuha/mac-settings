-- lua/plugins/init.lua
return {
  -- 테마
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    config = function()
      vim.cmd.colorscheme("tokyonight")
    end
  },


  -- 파일 탐색기
  {
    "nvim-tree/nvim-tree.lua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    cmd = { "NvimTreeToggle", "NvimTreeFindFile" },
    keys = {
      { "<leader>e", "<cmd>NvimTreeToggle<cr>", desc = "Explorer" },
      { "<F2>", "<cmd>NvimTreeToggle<cr>", desc = "Explorer (F2)" },
      { "<C-n>",    "<cmd>NvimTreeToggle<CR>",   mode = "n", silent = true, desc = "NvimTree Toggle" },
      { "<leader>fe","<cmd>NvimTreeFindFile<CR>",mode = "n", silent = true, desc = "NvimTree Find Current File" },
      { "<leader>ne","<cmd>NvimTreeFocus<CR>",   mode = "n", silent = true, desc = "NvimTree Focus" },
      { "<leader>er", function() local api=require("nvim-tree.api"); api.tree.focus(); api.fs.rename() end,
        mode="n", silent=true, desc="Explorer: Rename" },
      { "<leader>en", function() local api=require("nvim-tree.api"); api.tree.focus(); api.fs.create() end,
        mode="n", silent=true, desc="Explorer: New (file/dir)" },
      { "<leader>ed", function() local api=require("nvim-tree.api"); api.tree.focus(); api.fs.remove() end,
        mode="n", silent=true, desc="Explorer: Delete" },
      { "<leader>em", function() local api=require("nvim-tree.api"); api.tree.focus(); api.fs.rename_sub() end,
        mode="n", silent=true, desc="Explorer: Move/Rename (path)" },
    },
    config = function()
      require("nvim-tree").setup({
        view = { width = 32 },
        filters = { dotfiles = false },
        git = { enable = true, ignore = false },
      })
    end
  },


  -- Treesitter
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    event = { "BufReadPost", "BufNewFile" },
    config = function()
      require("nvim-treesitter.configs").setup({
        ensure_installed = { "bash", "lua", "vim", "vimdoc", "json", "yaml", "toml", "markdown",
          "regex",
          "javascript", "typescript", "tsx", "html", "css", "python", "go", "rust", "cpp" },
        highlight = { enable = true },
        indent = { enable = true },
        incremental_selection = { enable = true },
      })
    end
  },


  -- 점프/모션
  {
    "folke/flash.nvim",
    event = "VeryLazy",
    opts = { modes = { search = { enabled = true } } },
    keys = {
      { "s", mode = { "n", "x", "o" }, function() require("flash").jump() end,       desc = "Flash" },
      { "S", mode = { "n", "o", "x" }, function() require("flash").treesitter() end, desc = "Flash TS" },
      { "r", function() require("flash").remote() end,     mode = "o",               desc = "Flash Remote" },
      { "R", function() require("flash").treesitter_search() end, mode = { "n", "x", "o" }, desc = "Flash TS Search" },
    }
  },


  -- 알림/메시지 UI
  --   { "rcarriga/nvim-notify", config = function() vim.notify = require("notify") end },
  --   {
  --     "folke/noice.nvim",
  --     event = "VeryLazy",
  --     dependencies = { "MunifTanjim/nui.nvim", "rcarriga/nvim-notify" },
  --     opts = { presets = { lsp_doc_border = true } }
  --   },


  -- lua/plugins/hop.lua
  {
    "smoka7/hop.nvim", -- 공식: phaazon/hop.nvim, 활발한 포크: smoka7/hop.nvim
    branch = "v2",      -- hop v2 API
    config = function()
      local hop = require("hop")
      hop.setup({
        keys = "etovxqpdygfblzhckisuran", -- 기본 키셋(필요시 변경)
        -- case_insensitive = true, -- 대소문자 무시하고 싶으면 주석 해제
      })

      -- EasyMotion 유사 키매핑
      local directions = require("hop.hint").HintDirection
      local map = function(mode, lhs, rhs, desc)
        vim.keymap.set(mode, lhs, rhs, { desc = desc, silent = true, noremap = true })
      end

      -- 단어 시작(EasyMotion’s <Leader><Leader>w/e 스타일)
      -- <Leader><Leader>w: 앞으로 단어 시작으로 점프
      map({ "n", "x", "o" }, "<Leader><Leader>w", function()
        require("hop").hint_words({ direction = directions.AFTER_CURSOR, current_line_only = false })
      end, "Hop words after cursor")

      -- <Leader><Leader>b: 뒤로 단어 시작으로 점프
      map({ "n", "x", "o" }, "<Leader><Leader>b", function()
        require("hop").hint_words({ direction = directions.BEFORE_CURSOR, current_line_only = false })
      end, "Hop words before cursor")

      -- 라인 내 문자 탐색(EasyMotion’s s/S 느낌)
      -- f/t 류를 확장하는 한 글자 힌트
      map({ "n", "x", "o" }, "s", function()
        require("hop").hint_char1({ current_line_only = false })
      end, "Hop 1-char (anywhere)")

      map({ "n", "x", "o" }, "S", function()
        require("hop").hint_char2({ current_line_only = false })
      end, "Hop 2-char (anywhere)")

      -- 현재 라인에서 단어 이동(EasyMotion 라인 한정 느낌)
      map({ "n", "x", "o" }, "<Leader><Leader>j", function()
        require("hop").hint_lines({ direction = directions.AFTER_CURSOR, current_line_only = false })
      end, "Hop lines down")
      map({ "n", "x", "o" }, "<Leader><Leader>k", function()
        require("hop").hint_lines({ direction = directions.BEFORE_CURSOR, current_line_only = false })
      end, "Hop lines up")

      -- 단어의 어느 위치로든(문자 단위) 빠르게 점프
      -- EasyMotion 'w'류 대체로 자주 쓰는 매핑
      map({ "n", "x", "o" }, "<Leader><Leader>e", function()
        require("hop").hint_patterns({})
      end, "Hop by pattern")
    end,
  },

}
